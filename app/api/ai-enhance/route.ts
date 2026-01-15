import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

type EnhanceType = "generate" | "title" | "description" | "content" | "seo";

interface EnhanceRequest {
  type: EnhanceType;
  value: string;
  context?: {
    title?: string;
    description?: string;
    content?: string;
  };
}

// System prompts for different enhancement types
const SYSTEM_PROMPTS: Record<EnhanceType, string> = {
  generate: `You are an expert blog content creator for Amplify Ann Arbor, a charity concert supporting Ann Arbor Meals on Wheels.

YOUR TASK: Generate a complete blog article package in JSON format from the raw content provided.

Return ONLY valid JSON (no markdown code blocks):
{
  "title": "SEO-Optimized Title (50-60 characters)",
  "slug": "url-friendly-slug-with-hyphens",
  "description": "Meta description 150-160 chars for search engines",
  "content": "<h2>First Section</h2><p>Content with proper HTML...</p>",
  "category": "News|Events|Community|Impact",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

CONTENT REQUIREMENTS:
- 800-1,500 words for the content field
- Clear H2/H3 heading structure
- Warm, community-focused tone
- Proper HTML formatting (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)
- NO <h1> tags (title is separate)
- Focus on Ann Arbor community, charity, Meals on Wheels, local music scene`,

  title: `You are an expert copywriter for Amplify Ann Arbor, a charity concert.
Improve article titles to be:
- Engaging and click-worthy
- SEO-optimized with relevant keywords
- Under 60 characters
- Community-focused and warm tone

Return ONLY the improved title text, nothing else.`,

  description: `You are an SEO expert for Amplify Ann Arbor.
Create a meta description that:
- Is exactly 150-160 characters
- Includes relevant keywords naturally
- Has a clear value proposition
- Encourages clicks
- Relates to Ann Arbor community and charity

Return ONLY the description text, nothing else.`,

  content: `You are an expert editor for Amplify Ann Arbor community content.
Improve the article content for:
- Better readability and flow
- Clearer explanations
- Warm, community-focused tone
- Proper HTML formatting (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)
- Grammar and style improvements
- Logical structure with headings

Keep the same HTML structure but improve the text quality.
Return ONLY the improved HTML content, no code blocks or explanations.`,

  seo: `You are an SEO analyst for Amplify Ann Arbor.
Analyze the provided content and return a JSON object with:
{
  "score": 0-100,
  "suggestedTitle": "Optimized title suggestion",
  "suggestedDescription": "Optimized meta description",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3"
  ]
}

Return ONLY valid JSON, no markdown code blocks.`,
};

async function callOpenAI(
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.2",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_completion_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function POST(request: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body: EnhanceRequest = await request.json();
    const { type, value, context } = body;

    if (!type || !SYSTEM_PROMPTS[type]) {
      return NextResponse.json(
        { error: "Invalid enhancement type" },
        { status: 400 }
      );
    }

    if (!value || value.trim().length < 10) {
      return NextResponse.json(
        { error: "Content too short" },
        { status: 400 }
      );
    }

    let userContent = value;

    // Add context for certain enhancement types
    if (type === "description" && context) {
      userContent = `Title: ${context.title || "Untitled"}
Content Preview: ${context.content?.substring(0, 500) || ""}

Generate a meta description for this article.`;
    } else if (type === "content" && context) {
      userContent = `Title: ${context.title || "Untitled"}
Description: ${context.description || ""}

Content to improve:
${value}`;
    } else if (type === "seo" && context) {
      userContent = `Title: ${context.title || ""}
Description: ${context.description || ""}
Content: ${context.content || value}

Analyze this article for SEO.`;
    } else if (type === "generate") {
      userContent = `Transform this raw content into a complete blog article:

${value}`;
    }

    const result = await callOpenAI(SYSTEM_PROMPTS[type], userContent);

    // Parse JSON responses for generate and seo types
    if (type === "generate" || type === "seo") {
      try {
        // Extract JSON from response (handle potential markdown wrapping)
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ result: parsed, raw: result });
        }
      } catch {
        // If JSON parsing fails, return raw result
        return NextResponse.json({ result, raw: result });
      }
    }

    return NextResponse.json({ result: result.trim() });
  } catch (error) {
    console.error("AI enhance error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI enhancement failed" },
      { status: 500 }
    );
  }
}
