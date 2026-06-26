import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function sendEmail(to: string[], subject: string, html: string): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Sam Cars Shop <notifications@samcars.shop>", to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendSMS(to: string, body: string): Promise<boolean> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    console.log("Twilio not configured, skipping SMS");
    return false;
  }

  // Normalize French mobile number
  let normalized = to.replace(/\s/g, "");
  if (normalized.startsWith("0")) normalized = "+33" + normalized.slice(1);

  try {
    const params = new URLSearchParams({ From: fromNumber, To: normalized, Body: body });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: params.toString(),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      console.error("Twilio error:", err.message);
    }
    return res.ok;
  } catch (e) {
    console.error("SMS send error:", e);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { type, data } = await req.json();

    const { data: settings } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (!settings) {
      return new Response(JSON.stringify({ sent: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (type === "contact" && !settings.notify_on_contact) {
      return new Response(JSON.stringify({ sent: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (type === "search" && !settings.notify_on_search_request) {
      return new Response(JSON.stringify({ sent: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let subject = "";
    let html = "";
    let smsBody = "";

    if (type === "contact") {
      subject = `Nouveau message de ${data.name} — Sam Cars Shop`;
      html = `
        <h2 style="color:#c9a227">Nouveau message reçu</h2>
        <p><strong>Nom:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Téléphone:</strong> ${data.phone || "Non renseigné"}</p>
        <p><strong>Sujet:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f5f5f5;padding:12px;border-radius:4px">${data.message}</p>
      `;
      smsBody = `[Sam Cars Shop] Nouveau message de ${data.name} (${data.phone || data.email}): "${data.subject}"`;
    } else if (type === "search") {
      subject = `Demande de recherche — Sam Cars Shop`;
      html = `
        <h2 style="color:#c9a227">Nouvelle demande de recherche</h2>
        <p><strong>Nom:</strong> ${data.name}</p>
        <p><strong>Téléphone:</strong> ${data.phone || "Non renseigné"}</p>
        <p><strong>Marque:</strong> ${data.brand || "Toutes"}</p>
        <p><strong>Budget:</strong> ${data.budget || "Non précisé"}</p>
        <p><strong>Message:</strong> ${data.details || data.message || ""}</p>
      `;
      smsBody = `[Sam Cars Shop] Recherche personnalisée: ${data.name} cherche ${data.brand || "un véhicule"} budget ${data.budget}`;
    } else if (type === "depot") {
      subject = `Demande de dépôt-vente — Sam Cars Shop`;
      html = `
        <h2 style="color:#c9a227">Nouvelle demande de dépôt-vente</h2>
        <p><strong>Nom:</strong> ${data.name}</p>
        <p><strong>Téléphone:</strong> ${data.phone || "Non renseigné"}</p>
        <p><strong>Véhicule:</strong> ${data.vehicle || "Non précisé"}</p>
        <p><strong>Message:</strong> ${data.message || ""}</p>
      `;
      smsBody = `[Sam Cars Shop] Dépôt-vente: ${data.name} (${data.phone || data.email}) souhaite confier ${data.vehicle || "son véhicule"}`;
    }

    const [emailSent, smsSent] = await Promise.all([
      sendEmail(settings.email_recipients || [], subject, html),
      settings.sms_enabled && settings.sms_phone_number
        ? sendSMS(settings.sms_phone_number, smsBody)
        : Promise.resolve(false),
    ]);

    return new Response(
      JSON.stringify({ sent: emailSent || smsSent, emailSent, smsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
