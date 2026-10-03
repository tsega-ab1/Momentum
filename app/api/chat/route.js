import { callAI } from "@/lib/ai";

export async function POST(request) {
  const { provider, apiKey, model, messages } = await request.json();

  if (!provider) {
    return Response.json({ error: "Provider is required" }, { status: 422 });
  }
  if (provider !== "mock" && !apiKey) {
    return Response.json({ error: "API key is required for this provider" }, { status: 422 });
  }

  try {
    const reply = await callAI(provider, apiKey, model, messages);
    return Response.json({ reply });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
