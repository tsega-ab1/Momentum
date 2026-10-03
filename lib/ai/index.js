import * as mock from "./providers/mock.js";
import * as openai from "./providers/openai.js";
import * as anthropic from "./providers/anthropic.js";

const adapters = { mock, openai, anthropic };

export async function callAI(provider, apiKey, model, messages) {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  return adapter.sendMessage(apiKey, model, messages);
}
