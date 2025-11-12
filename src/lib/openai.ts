/**
 * OpenAI client configuration
 */

import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Legacy export for backwards compatibility
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getOpenAIClient()[prop as keyof OpenAI];
  }
});

// Using GPT-5 with structured outputs support
export const MODEL = "gpt-5";







