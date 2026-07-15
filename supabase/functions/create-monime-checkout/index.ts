/**
 * Supabase Edge Function: create-monime-checkout
 * Securely creates a Monime Checkout Session and returns the checkout URL.
 * Deploy with: supabase functions deploy create-monime-checkout
 *
 * Required Supabase secrets (set with: supabase secrets set KEY=value):
 *   MONIME_API_KEY   — your Monime Bearer API token (mon_test_... or mon_...)
 *   MONIME_SPACE_ID  — your Monime Space ID
 *   SITE_URL         — the public URL of your frontend app (e.g. https://awol.example.com)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const MONIME_API_KEY = Deno.env.get("MONIME_API_KEY");
    const MONIME_SPACE_ID = Deno.env.get("MONIME_SPACE_ID");
    const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:3000";

    if (!MONIME_API_KEY || !MONIME_SPACE_ID) {
      throw new Error("Monime API credentials are not configured. Please set MONIME_API_KEY and MONIME_SPACE_ID secrets.");
    }

    const body = await req.json();
    const {
      amount,
      currency = "SLE",
      mode,
      nomineeId,
      categoryId,
    } = body;

    if (!amount || !mode) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, mode" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const successParams = new URLSearchParams({
      payment_success: "true",
      payment_mode: mode,
      ...(nomineeId ? { nomineeId } : {}),
      ...(categoryId !== undefined ? { categoryId: String(categoryId) } : {}),
    });
    const successUrl = `${SITE_URL}/?tab=vote&${successParams.toString()}`;
    const cancelUrl = `${SITE_URL}/?tab=vote&payment_cancelled=true`;

    const checkoutPayload = {
      name: "AWOL America Awards — Vote",
      lineItems: [
        {
          type: "custom",
          name: mode === "one_time" ? "Voting Access (All Categories)" : "Vote — One Category",
          price: { currency, value: amount },
          quantity: 1,
        },
      ],
      successUrl,
      cancelUrl,
      metadata: {
        source: "awol_awards_platform",
        payment_mode: mode,
        ...(nomineeId ? { nomineeId } : {}),
        ...(categoryId !== undefined ? { categoryId: String(categoryId) } : {}),
      },
    };

    const monimeResponse = await fetch("https://api.monime.io/v1/checkout-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MONIME_API_KEY}`,
        "Monime-Space-Id": MONIME_SPACE_ID,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!monimeResponse.ok) {
      const errorText = await monimeResponse.text();
      console.error("Monime API error:", monimeResponse.status, errorText);
      throw new Error(`Monime API error ${monimeResponse.status}: ${errorText}`);
    }

    const session = await monimeResponse.json();

    return new Response(
      JSON.stringify({
        checkoutUrl: session.url || session.checkoutUrl || session.hosted_url,
        sessionId: session.id,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred." }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
