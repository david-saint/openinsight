export type StylePreference = "Concise" | "Detailed";

/**
 * Manages the dynamic construction of system prompts based on user preferences.
 * Enforces rigid JSON response structures for reliable parsing.
 */
export class PromptManager {
  private static readonly EXPLAIN_BASE =
    "You are an expert explainer. Provide a clear and objective explanation of the provided text or concept. Focus on clarity and neutrality.";

  private static readonly FACT_CHECK_BASE =
    "You are an expert fact-checker. Verify the accuracy of the provided text. Be objective and cite evidence where possible.";

  private static readonly JSON_INSTRUCTION_EXPLAIN = `
Response MUST be a valid JSON object following this EXACT schema:
{
  "summary": "A concise explanation of the text.",
  "explanation": "A more detailed breakdown of the concept.",
  "context": {
    "example": "An illustrative example to aid understanding. (Optional)",
    "related_concepts": ["concept1", "concept2"]
  }
}`;

  private static readonly JSON_INSTRUCTION_FACT_CHECK = `
Response MUST be a valid JSON object following this EXACT schema:
{
  "summary": "A brief summary of the claim.",
  "verdict": "True | False | Partially True | Unverifiable",
  "details": "An explanation of the verdict.",
  "sources": [
    {
      "title": "Source Title",
      "url": "https://...",
      "snippet": "Relevant quote from the source."
    }
  ]
}`;

  /**
   * Generates the system prompt for the "Explain" action.
   */
  static getExplainPrompt(
    style: StylePreference,
    emphasizedWords: string[] = []
  ): string {
    const styleInstruction =
      style === "Concise"
        ? "Be extremely concise, direct, and use simple language."
        : "Provide a comprehensive, nuanced, and detailed breakdown of the concept.";

    let keywordInstruction = "";
    if (emphasizedWords.length > 0) {
      keywordInstruction = `\n\nTHE USER HAS EMPHASIZED THESE KEYWORDS: ${emphasizedWords.join(
        ", "
      )}. Please ensure your explanation pays special attention to these terms, providing deeper context or sub-explanations for them within the overall response.`;
    }

    return `${this.EXPLAIN_BASE} ${styleInstruction}${keywordInstruction}\n${this.JSON_INSTRUCTION_EXPLAIN}`;
  }

  /**
   * Generates the system prompt for the "Fact-check" action.
   */
  static getFactCheckPrompt(
    style: StylePreference,
    emphasizedWords: string[] = []
  ): string {
    const styleInstruction =
      style === "Concise"
        ? "Be concise. Provide a brief verdict and the most essential evidence."
        : "Provide a detailed analysis of the claim, exploring nuances and providing multiple data points if available.";

    let keywordInstruction = "";
    if (emphasizedWords.length > 0) {
      keywordInstruction = `\n\nTHE USER HAS EMPHASIZED THESE KEYWORDS: ${emphasizedWords.join(
        ", "
      )}. Please prioritize these terms in your fact-check, ensuring their specific accuracy or role in the claim is thoroughly addressed.`;
    }

    return `${this.FACT_CHECK_BASE} ${styleInstruction}${keywordInstruction}\n${this.JSON_INSTRUCTION_FACT_CHECK}`;
  }
}
