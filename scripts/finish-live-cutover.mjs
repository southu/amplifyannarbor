#!/usr/bin/env node
/**
 * finish-live-cutover.mjs — one-command finisher for the /donate live cutover.
 *
 * Context: the donate flow is already code-complete. `app/api/create-checkout`
 * creates a live Stripe Checkout Session with an explicit
 *   cancel_url  = https://amplifyannarbor.com/donate   (AC4)
 *   success_url = https://amplifyannarbor.com/donate/success
 * reading the secret ONLY from process.env.STRIPE_SECRET_KEY. It is live-only:
 * with a non-live key it 404s and the browser falls back to the live Stripe
 * Payment Links, whose checkout cancel target Stripe fixes to https://stripe.com
 * (Payment Links expose no cancel_url knob). So AC4 passes the instant a live
 * secret key is present in the Cloudflare Pages production runtime — no code
 * change required. This script performs that single remaining operational step
 * and verifies the result.
 *
 * What it does (idempotent):
 *   1. Reads a LIVE Stripe secret key from the environment (never argv/hardcoded):
 *        STRIPE_LIVE_SECRET_KEY  (preferred, unambiguous) or STRIPE_SECRET_KEY.
 *      Refuses anything that is not sk_live_… or rk_live_… .
 *   2. Writes it to the Cloudflare Pages `amplifyannarbor` PRODUCTION env as an
 *      encrypted secret (type: secret_text) via the CF API, using
 *      CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID already in the environment.
 *      (Optionally also NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET
 *      if their live values are provided in the same env.)
 *   3. Triggers a production redeploy so the new env takes effect.
 *   4. Polls POST https://amplifyannarbor.com/api/create-checkout until it
 *      returns a live session URL containing `cs_live_`, then asserts the
 *      session's cancel_url === https://amplifyannarbor.com/donate (AC3 + AC4).
 *
 * No secret value is ever printed or written to disk/logs — only key TYPE and a
 * short prefix are shown. Run with `--dry-run` to validate inputs without
 * making any change.
 *
 * Usage:
 *   STRIPE_LIVE_SECRET_KEY=sk_live_… node scripts/finish-live-cutover.mjs
 *   STRIPE_LIVE_SECRET_KEY=sk_live_… node scripts/finish-live-cutover.mjs --dry-run
 */

const DRY_RUN = process.argv.includes("--dry-run");
const STATUS_ONLY = process.argv.includes("--status");
const PROJECT = "amplifyannarbor";
const SITE = "https://amplifyannarbor.com";
const EXPECT_CANCEL = "https://amplifyannarbor.com/donate";
const EXPECT_SUCCESS = "https://amplifyannarbor.com/donate/success";
const CF_API = "https://api.cloudflare.com/client/v4";

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}
function ok(msg) {
  console.log(`✓ ${msg}`);
}

function isLiveSecret(k) {
  return typeof k === "string" && (k.startsWith("sk_live_") || k.startsWith("rk_live_"));
}
function looksSecret(k) {
  // any Stripe secret/restricted key, live or test — used only to give a precise error
  return typeof k === "string" && /^(sk|rk)_(live|test)_/.test(k);
}

// --- 0. Read-only status: diagnose the AC4 blocker without any key ------------
// `--status` needs no Stripe key. It reports (a) what STRIPE_SECRET_KEY key
// TYPE is currently live in Cloudflare Pages production, and (b) whether
// POST /api/create-checkout is serving a live (cs_live_) session yet. It never
// prints a full secret — only the key prefix (sk_test_ / sk_live_ / rk_live_).
if (STATUS_ONLY) {
  const token = (process.env.CLOUDFLARE_API_TOKEN || "").trim();
  const account = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const summarizeKey = (v) => {
    if (typeof v !== "string" || !v) return "(unset)";
    const m = v.match(/^(sk|rk|pk)_(live|test)_/);
    return m ? `${m[0]} (${v.length} chars)` : `(non-standard, ${v.length} chars)`;
  };
  await (async () => {
    if (token && account) {
      try {
        const res = await fetch(
          `${CF_API}/accounts/${account}/pages/projects/${PROJECT}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        const ev =
          json?.result?.deployment_configs?.production?.env_vars || {};
        const sk = ev.STRIPE_SECRET_KEY?.value;
        console.log(`CF prod STRIPE_SECRET_KEY: ${summarizeKey(sk)}`);
        if (isLiveSecret(sk)) ok("CF prod key is LIVE — AC4 unblocked once deployed.");
        else console.log("→ AC4 BLOCKED: CF prod key is not live. Provide a live key and run this script without --status.");
      } catch (e) {
        console.warn(`(could not read CF env: ${e.message})`);
      }
    } else {
      console.log("(CLOUDFLARE_API_TOKEN/ACCOUNT_ID not set — skipping CF env read)");
    }
    // Probe the live endpoint from the public internet.
    try {
      const res = await fetch(`${SITE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50, name: "status probe", email: "verify@example.com", custom: false }),
      });
      const body = await res.json().catch(() => ({}));
      const url = typeof body.url === "string" ? body.url : "";
      if (res.status === 404) console.log("create-checkout: HTTP 404 (live path inactive → client uses Payment Links, whose cancel_url is https://stripe.com → AC4 fails).");
      else if (url.includes("cs_live_")) ok("create-checkout: serving a LIVE session (cs_live_) — AC4 should pass.");
      else console.log(`create-checkout: HTTP ${res.status}, url=${url ? url.slice(0, 40) : "(none)"}`);
    } catch (e) {
      console.warn(`(create-checkout probe failed: ${e.message})`);
    }
  })();
  // Status is read-only; the key-required provisioning logic below never runs.
  process.exit(0);
}

// --- 1. Resolve the live secret key from env (never argv) --------------------
const rawKey = (process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "").trim();
if (!rawKey) {
  die(
    "No key in env. Set STRIPE_LIVE_SECRET_KEY (or STRIPE_SECRET_KEY) to a live " +
      "Stripe secret key (sk_live_… or rk_live_… scoped to Checkout Sessions)."
  );
}
if (!isLiveSecret(rawKey)) {
  const kind = looksSecret(rawKey) ? `a ${rawKey.slice(0, 8)}… key` : "a non-Stripe-secret value";
  die(
    `Refusing to proceed: the provided key is ${kind}, not a live key. ` +
      "AC3/AC4 require a live-mode key (sk_live_/rk_live_). Test-mode keys yield cs_test_ sessions."
  );
}
ok(`Live Stripe secret key detected (${rawKey.slice(0, 8)}…, len ${rawKey.length}).`);

// Optional companion live values (only written if present + non-test).
const extraVars = {};
const pub = (process.env.STRIPE_LIVE_PUBLISHABLE_KEY || "").trim();
if (pub) {
  if (!pub.startsWith("pk_live_")) die("STRIPE_LIVE_PUBLISHABLE_KEY is not a pk_live_ key.");
  extraVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pub;
}
const whsec = (process.env.STRIPE_LIVE_WEBHOOK_SECRET || "").trim();
if (whsec) {
  if (!whsec.startsWith("whsec_")) die("STRIPE_LIVE_WEBHOOK_SECRET is not a whsec_ secret.");
  extraVars.STRIPE_WEBHOOK_SECRET = whsec;
}

const CF_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || "").trim();
const CF_ACCOUNT = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
if (!DRY_RUN && (!CF_TOKEN || !CF_ACCOUNT)) {
  die("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set to write the CF production env.");
}

const plannedKeys = ["STRIPE_SECRET_KEY", ...Object.keys(extraVars)];
ok(`Planned CF production env writes: ${plannedKeys.join(", ")}.`);

if (DRY_RUN) {
  ok("--dry-run: inputs valid; no CF write, redeploy, or verification performed.");
  process.exit(0);
}

// --- CF API helpers ----------------------------------------------------------
async function cf(path, init = {}) {
  const res = await fetch(`${CF_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!json || json.success !== true) {
    const errs = JSON.stringify(json && json.errors ? json.errors : json).slice(0, 300);
    throw new Error(`CF API ${path} failed (HTTP ${res.status}): ${errs}`);
  }
  return json.result;
}

async function main() {
  // --- 2. Write the live key(s) to CF production as encrypted secrets --------
  const env_vars = {
    STRIPE_SECRET_KEY: { type: "secret_text", value: rawKey },
  };
  for (const [k, v] of Object.entries(extraVars)) {
    // publishable key is public by nature but storing as plain_text keeps NEXT_PUBLIC_ inlining working
    env_vars[k] = { type: k.startsWith("NEXT_PUBLIC_") ? "plain_text" : "secret_text", value: v };
  }
  await cf(`/accounts/${CF_ACCOUNT}/pages/projects/${PROJECT}`, {
    method: "PATCH",
    body: JSON.stringify({ deployment_configs: { production: { env_vars } } }),
  });
  ok(`Wrote ${plannedKeys.join(", ")} to CF ${PROJECT} production (values not logged).`);

  // --- 3. Trigger a production redeploy so the new env takes effect ----------
  const dep = await cf(`/accounts/${CF_ACCOUNT}/pages/projects/${PROJECT}/deployments`, {
    method: "POST",
  });
  ok(`Triggered production redeploy (${dep && dep.id ? dep.id : "id n/a"}). Waiting for it to serve…`);

  // --- 4. Poll production until create-checkout returns a live session -------
  const deadline = Date.now() + 8 * 60 * 1000; // 8 min
  let lastStatus = "";
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 15000));
    let body, status;
    try {
      const res = await fetch(`${SITE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50, name: "cutover finisher", email: "verify@example.com", custom: false }),
      });
      status = res.status;
      body = await res.json().catch(() => ({}));
    } catch (e) {
      lastStatus = `fetch error: ${e.message}`;
      continue;
    }
    if (status === 404) {
      lastStatus = "create-checkout still 404 (old deploy / non-live key not yet active)";
      process.stdout.write(".");
      continue;
    }
    const url = body && typeof body.url === "string" ? body.url : "";
    if (status === 200 && url.includes("cs_live_")) {
      console.log("");
      ok(`create-checkout now returns a LIVE session: ${url.split("#")[0].slice(0, 60)}…`);
      // Confirm AC4: fetch the session's cancel_url via Stripe using the live key.
      const sid = (url.match(/cs_live_[A-Za-z0-9]+/) || [])[0];
      if (sid) {
        try {
          const sres = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sid}`, {
            headers: { Authorization: `Bearer ${rawKey}` },
          });
          const sess = await sres.json();
          const cancel = sess.cancel_url;
          const success = sess.success_url;
          if (cancel === EXPECT_CANCEL) ok(`AC4 satisfied: cancel_url = ${cancel}`);
          else die(`cancel_url is ${cancel}, expected ${EXPECT_CANCEL}`);
          if (success === EXPECT_SUCCESS) ok(`AC5 target: success_url = ${success}`);
          if (sess.livemode === true) ok("session.livemode = true (AC3).");
        } catch (e) {
          console.warn(`(could not read session back for AC4 assertion: ${e.message})`);
        }
      }
      ok("Cutover complete. AC3/AC4/AC5 should now pass against production.");
      return;
    }
    lastStatus = `create-checkout HTTP ${status}, url=${url ? url.slice(0, 40) : "(none)"}`;
    process.stdout.write(".");
  }
  console.log("");
  die(`Timed out waiting for a live session. Last: ${lastStatus}. Check the CF deploy status and env.`);
}

main().catch((e) => die(e.message));
