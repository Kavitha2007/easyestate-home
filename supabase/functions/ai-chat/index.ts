const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are the EasyEstate AI Assistant, a helpful, concise real-estate guide.
You help buyers, renters, and sellers in India explore properties, understand EMI, evaluate locations,
and navigate the EasyEstate platform. Keep answers under ~120 words, friendly, formatted in markdown when useful.
If asked about EMI, explain: monthly EMI = P*r*(1+r)^n / ((1+r)^n - 1), where r = annual%/12/100, n = years*12.
For navigation help mention: Home, Search Properties, Saved Properties, Visit Requests, Chat, and (for owners) Add Property.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("Missing LOVABLE_API_KEY");
      return new Response(JSON.stringify({ error: "AI service is not configured. Please contact support." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, ...messages],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ reply: "I'm receiving too many requests right now. Please wait a moment and try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ reply: "AI service credits are exhausted. Please try again later." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ reply: "Sorry, the assistant is temporarily unavailable. Please try again shortly." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? "I couldn't generate a reply. Please try rephrasing your question.";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ reply: "Sorry, I'm having trouble right now. Please try again shortly." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
