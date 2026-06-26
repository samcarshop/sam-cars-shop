import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "RESEND_API_KEY non configuree dans les secrets Edge Functions",
        hint: "Ajoutez RESEND_API_KEY via Settings > Edge Functions > Secrets dans Supabase",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let toEmail = "test@example.com";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.to) toEmail = body.to;
  } catch {}

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [toEmail],
        subject: "Test d'integration Resend — Sam Cars Shop",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#c9a227;border-bottom:1px solid #c9a227;padding-bottom:8px">
              Test d'integration Resend
            </h2>
            <p>Cet email confirme que l'integration Resend est <strong>operationnelle</strong>.</p>
            <p style="color:#666;font-size:13px">Envoye depuis : Sam Cars Shop Admin</p>
            <p style="color:#999;font-size:12px">Date : ${new Date().toISOString()}</p>
          </div>
        `,
      }),
    });

    const responseText = await res.text();
    let responseData: any;
    try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText }; }

    return new Response(
      JSON.stringify({
        success: res.ok,
        status: res.status,
        resend_response: responseData,
        to: toEmail,
        key_prefix: RESEND_API_KEY.substring(0, 8) + "...",
      }),
      {
        status: res.ok ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
