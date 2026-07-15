/**
 * Supabase Edge Function: monime-webhook
 * Securely receives checkout_session.completed events from Monime and records votes.
 * Deploy with: supabase functions deploy monime-webhook
 *
 * Required Supabase secrets (set with: supabase secrets set KEY=value):
 *   MONIME_WEBHOOK_SECRET — the HMAC S256 secret from the Monime Create Webhook page
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, monime-signature, x-monime-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper function to verify HMAC SHA-256 signature
async function verifyMonimeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  
  // Import the secret key
  const keyData = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  // Sign the payload
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    keyData,
    encoder.encode(payload)
  );
  
  // Convert ArrayBuffer to Hex String
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return computedHash === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const MONIME_WEBHOOK_SECRET = Deno.env.get("MONIME_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!MONIME_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables.");
      return new Response("Server configuration error", { status: 500 });
    }

    // Monime sends the signature in a header, typically 'monime-signature' or 'x-monime-signature'
    const signature = req.headers.get("monime-signature") || req.headers.get("x-monime-signature");
    if (!signature) {
      return new Response("Missing signature header", { status: 401 });
    }

    // We must read the raw body text for accurate HMAC verification
    const rawBody = await req.text();
    
    // Verify signature
    const isValid = await verifyMonimeSignature(rawBody, signature, MONIME_WEBHOOK_SECRET);
    if (!isValid) {
      console.error("Invalid webhook signature.");
      return new Response("Invalid signature", { status: 401 });
    }

    // Parse the validated payload
    const event = JSON.parse(rawBody);
    console.log(`Received authenticated event: ${event.type}`);

    // We only care about completed checkouts
    if (event.type === "checkout_session.completed") {
      const session = event.data;
      const metadata = session.metadata || {};

      // Initialize Supabase admin client to bypass RLS and increment safely
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      if (metadata.payment_mode === "per_vote" && metadata.nomineeId) {
        // Increment the vote securely
        const { error } = await supabaseAdmin.rpc("increment_nominee_votes", {
          p_id: metadata.nomineeId,
          p_amount: 1,
        });

        if (error) {
          console.error("Error updating vote in database:", error);
          throw error;
        }
        
        console.log(`Successfully incremented vote for nominee: ${metadata.nomineeId}`);
      } 
      else if (metadata.payment_mode === "one_time") {
        // For one_time mode, the actual "unlock" happens on the client via the success redirect URL,
        // but we can log it securely here for audit purposes.
        console.log("One-time payment completed securely.");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
