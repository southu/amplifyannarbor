import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Citation {
  url: string;
  title?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { type, topic, context } = await request.json();

    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityKey) {
      return NextResponse.json(
        { error: "Perplexity API key not configured" },
        { status: 500 }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "research":
        // General research on a topic
        systemPrompt = `You are a research assistant for a charity blog (Amplify Ann Arbor, supporting Meals on Wheels). 
Provide well-researched, factual information with a focus on:
- Recent news and developments (2024-2026)
- Statistics and data that support the topic
- Expert quotes or insights when available
- Local Ann Arbor / Michigan context when relevant

Always cite your sources. Format your response as:
1. Key findings (bullet points)
2. Relevant statistics
3. Notable quotes or expert opinions
4. Suggested angles for the article`;
        userPrompt = `Research the following topic for a blog article: "${topic}"

${context ? `Additional context: ${context}` : ""}

Focus on finding recent, credible information that would help write an engaging, fact-based article.`;
        break;

      case "fact-check":
        // Verify claims in existing content
        systemPrompt = `You are a fact-checker. Verify the claims made in the provided content.
For each claim:
- Confirm if it's accurate, inaccurate, or needs context
- Provide the correct information with sources
- Note any outdated statistics that should be updated`;
        userPrompt = `Fact-check the following content:\n\n${topic}`;
        break;

      case "find-sources":
        // Find sources to cite
        systemPrompt = `You are a research assistant finding credible sources on a topic.
Focus on:
- Official organization websites
- News articles from reputable outlets
- Academic or government statistics
- Recent publications (2024-2026 preferred)

Provide 5-10 relevant sources with brief descriptions of what each covers.`;
        userPrompt = `Find credible sources about: "${topic}"

${context ? `Context: ${context}` : ""}`;
        break;

      case "local-research":
        // Ann Arbor / Michigan specific research
        systemPrompt = `You are a local research assistant specializing in Ann Arbor, Michigan and surrounding areas.
Focus on:
- Local news and developments
- Ann Arbor community organizations
- Michigan state programs and initiatives
- Local statistics and demographics
- Meals on Wheels programs in Michigan`;
        userPrompt = `Research local Ann Arbor/Michigan information about: "${topic}"

${context ? `Additional context: ${context}` : ""}`;
        break;

      case "trending":
        // Find trending/timely angles
        systemPrompt = `You are a content strategist finding timely angles for blog content.
Identify:
- Current news hooks related to the topic
- Upcoming events or awareness days
- Trending discussions on social media
- Seasonal relevance
- Ways to tie into current events`;
        userPrompt = `Find timely angles and news hooks for a blog article about: "${topic}"

${context ? `The article is for: ${context}` : "The article is for a charity concert supporting Meals on Wheels."}`;
        break;

      default:
        return NextResponse.json({ error: "Invalid research type" }, { status: 400 });
    }

    const messages: PerplexityMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: "sonar-pro", // Perplexity's best model with citations
        messages,
        temperature: 0.3, // Lower for more factual responses
        max_tokens: 4000,
        return_citations: true,
        return_related_questions: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Perplexity API error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "Research request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract citations from the response
    const citations: Citation[] = data.citations || [];
    const content = data.choices?.[0]?.message?.content || "";
    const relatedQuestions = data.related_questions || [];

    return NextResponse.json({
      content,
      citations,
      relatedQuestions,
    });
  } catch (error) {
    console.error("Research API error:", error);
    return NextResponse.json(
      { error: "Failed to process research request" },
      { status: 500 }
    );
  }
}
