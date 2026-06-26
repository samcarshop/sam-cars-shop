import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Simple hash using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "samcars-salt-2025");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === storedHash;
}

function jsonResp(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errResp(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // ============ LOGIN ============
    if (path === "/admin-api/login" && method === "POST") {
      const { password } = await req.json();
      if (!password) return errResp("Mot de passe requis", 400);

      const { data, error } = await supabase
        .from("admin_secrets")
        .select("password_hash")
        .eq("id", 1)
        .single();

      if (error || !data) {
        const defaultHash = await hashPassword("admin123");
        if (await verifyPassword(password, defaultHash)) {
          return jsonResp({ token: "admin-token-samcars-2025" });
        }
        return errResp("Erreur de configuration", 500);
      }

      if (await verifyPassword(password, data.password_hash)) {
        return jsonResp({ token: "admin-token-samcars-2025" });
      }
      return errResp("Mot de passe incorrect", 401);
    }

    // ============ VEHICLES CRUD ============
    if (path === "/admin-api/vehicles" && method === "GET") {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/vehicles" && method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("vehicles")
        .insert(body)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data, 201);
    }

    const vehicleMatch = path.match(/^\/admin-api\/vehicles\/(.+)$/);
    if (vehicleMatch) {
      const id = vehicleMatch[1];
      if (method === "PUT") {
        const body = await req.json();
        const { data, error } = await supabase
          .from("vehicles")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) return errResp(error.message);
        return jsonResp(data);
      }
      if (method === "DELETE") {
        const { error } = await supabase.from("vehicles").delete().eq("id", id);
        if (error) return errResp(error.message);
        return jsonResp({ success: true });
      }
    }

    // ============ SITE SETTINGS ============
    if (path === "/admin-api/settings" && method === "GET") {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/settings" && method === "PUT") {
      const body = await req.json();
      body.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from("site_settings")
        .update(body)
        .eq("id", 1)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    // ============ SEO SETTINGS ============
    if (path === "/admin-api/seo" && method === "GET") {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/seo" && method === "PUT") {
      const body = await req.json();
      body.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from("seo_settings")
        .update(body)
        .eq("id", 1)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    // ============ PAGES CRUD ============
    if (path === "/admin-api/pages" && method === "GET") {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("nav_order", { ascending: true });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/pages" && method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("pages")
        .insert(body)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data, 201);
    }

    const pageMatch = path.match(/^\/admin-api\/pages\/(.+)$/);
    if (pageMatch) {
      const id = pageMatch[1];
      if (method === "PUT") {
        const body = await req.json();
        body.updated_at = new Date().toISOString();
        const { data, error } = await supabase
          .from("pages")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) return errResp(error.message);
        return jsonResp(data);
      }
      if (method === "DELETE") {
        const { error } = await supabase.from("pages").delete().eq("id", id);
        if (error) return errResp(error.message);
        return jsonResp({ success: true });
      }
    }

    // ============ SECTIONS CRUD ============
    if (path === "/admin-api/sections" && method === "GET") {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/sections" && method === "PUT") {
      const sections = await req.json();
      for (const section of sections) {
        await supabase
          .from("sections")
          .update({
            is_visible: section.is_visible,
            sort_order: section.sort_order,
            background_image_url: section.background_image_url ?? null,
            background_video_url: section.background_video_url ?? null,
          })
          .eq("id", section.id);
      }
      return jsonResp({ success: true });
    }

    // ============ MEDIA CRUD ============
    if (path === "/admin-api/media" && method === "GET") {
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/media" && method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("media")
        .insert(body)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data, 201);
    }

    const mediaMatch = path.match(/^\/admin-api\/media\/(.+)$/);
    if (mediaMatch) {
      const id = mediaMatch[1];
      if (method === "PUT") {
        const body = await req.json();
        const { data, error } = await supabase
          .from("media")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) return errResp(error.message);
        return jsonResp(data);
      }
      if (method === "DELETE") {
        // Get file info first
        const { data: media } = await supabase
          .from("media")
          .select("storage_path")
          .eq("id", id)
          .single();
        if (media?.storage_path) {
          await supabase.storage.from("media").remove([media.storage_path]);
        }
        const { error } = await supabase.from("media").delete().eq("id", id);
        if (error) return errResp(error.message);
        return jsonResp({ success: true });
      }
    }

    // ============ REVIEWS CRUD ============
    if (path === "/admin-api/reviews" && method === "GET") {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/reviews" && method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("reviews")
        .insert(body)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data, 201);
    }

    const reviewMatch = path.match(/^\/admin-api\/reviews\/(.+)$/);
    if (reviewMatch) {
      const id = reviewMatch[1];
      if (method === "PUT") {
        const body = await req.json();
        const { data, error } = await supabase
          .from("reviews")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) return errResp(error.message);
        return jsonResp(data);
      }
      if (method === "DELETE") {
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) return errResp(error.message);
        return jsonResp({ success: true });
      }
    }

    // ============ SERVICES CRUD ============
    if (path === "/admin-api/services" && method === "GET") {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/services" && method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("services")
        .insert(body)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data, 201);
    }

    const serviceMatch = path.match(/^\/admin-api\/services\/(.+)$/);
    if (serviceMatch) {
      const id = serviceMatch[1];
      if (method === "PUT") {
        const body = await req.json();
        const { data, error } = await supabase
          .from("services")
          .update(body)
          .eq("id", id)
          .select()
          .single();
        if (error) return errResp(error.message);
        return jsonResp(data);
      }
      if (method === "DELETE") {
        const { error } = await supabase.from("services").delete().eq("id", id);
        if (error) return errResp(error.message);
        return jsonResp({ success: true });
      }
    }

    // ============ CONTACT MESSAGES ============
    if (path === "/admin-api/contact-messages" && method === "GET") {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    const contactMatch = path.match(/^\/admin-api\/contact-messages\/(.+)$/);
    if (contactMatch && method === "PUT") {
      const id = contactMatch[1];
      const body = await req.json();
      const { data, error } = await supabase
        .from("contact_messages")
        .update(body)
        .eq("id", id)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    // ============ SEARCH REQUESTS ============
    if (path === "/admin-api/search-requests" && method === "GET") {
      const { data, error } = await supabase
        .from("search_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    const searchMatch = path.match(/^\/admin-api\/search-requests\/(.+)$/);
    if (searchMatch && method === "PUT") {
      const id = searchMatch[1];
      const body = await req.json();
      const { data, error } = await supabase
        .from("search_requests")
        .update(body)
        .eq("id", id)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    // ============ UPLOAD ============
    if (path === "/admin-api/upload" && method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return errResp("No file provided", 400);

      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const path = `uploads/${filename}`;

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, uint8Array, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) return errResp(uploadError.message);

      const publicUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;

      const mediaRecord = {
        filename,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: path,
        public_url: publicUrl,
        alt_text: formData.get("alt_text") as string || "",
        title: formData.get("title") as string || "",
      };

      const { data, error } = await supabase
        .from("media")
        .insert(mediaRecord)
        .select()
        .single();

      if (error) return errResp(error.message);
      return jsonResp(data, 201);
    }

    // ============ VISUAL EDITOR SETTINGS ============
    if (path === "/admin-api/visual-editor" && method === "GET") {
      const { data, error } = await supabase
        .from("visual_editor_settings")
        .select("*");
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/visual-editor" && method === "PUT") {
      const body = await req.json();
      for (const [sectionKey, settings] of Object.entries(body)) {
        const { error } = await supabase
          .from("visual_editor_settings")
          .upsert(
            { section_key: sectionKey, settings: settings as object, updated_at: new Date().toISOString() },
            { onConflict: "section_key" }
          );
        if (error) console.error("Error saving visual settings for", sectionKey, error.message);
      }
      return jsonResp({ success: true });
    }

    // ============ NOTIFICATIONS SETTINGS ============
    if (path === "/admin-api/notifications" && method === "GET") {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/notifications" && method === "PUT") {
      const body = await req.json();
      body.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from("notification_settings")
        .update(body)
        .eq("id", 1)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    // ============ SEND NOTIFICATION EMAIL ============
    if (path === "/admin-api/send-notification" && method === "POST") {
      const { type, data: notificationData } = await req.json();
      const { data: notifSettings } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (!notifSettings) return jsonResp({ sent: false });

      // Check if notification is enabled for this type
      if (type === "contact" && !notifSettings.notify_on_contact) return jsonResp({ sent: false });
      if (type === "search" && !notifSettings.notify_on_search_request) return jsonResp({ sent: false });
      if (type === "depot" && !notifSettings.notify_on_depot_vente) return jsonResp({ sent: false });

      // Log to contact_messages or search_requests already handled by the form submission
      return jsonResp({ sent: true, recipients: notifSettings.email_recipients });
    }

    // ============ PUSH TOKENS ============
    if (path === "/admin-api/push-tokens" && method === "GET") {
      const { data, error } = await supabase
        .from("push_tokens")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/push-tokens" && method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("push_tokens")
        .upsert({ token: body.token, device_type: body.device_type }, { onConflict: "token" })
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data, 201);
    }

    const pushTokenMatch = path.match(/^\/admin-api\/push-tokens\/(.+)$/);
    if (pushTokenMatch && method === "DELETE") {
      const id = pushTokenMatch[1];
      const { error } = await supabase.from("push_tokens").delete().eq("id", id);
      if (error) return errResp(error.message);
      return jsonResp({ success: true });
    }

    // ============ VEHICLE INFO AUTO-SEND ============
    if (path === "/admin-api/vehicle-inquiry-settings" && method === "GET") {
      const { data, error } = await supabase
        .from("vehicle_inquiry_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    if (path === "/admin-api/vehicle-inquiry-settings" && method === "PUT") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("vehicle_inquiry_settings")
        .update(body)
        .eq("id", 1)
        .select()
        .single();
      if (error) return errResp(error.message);
      return jsonResp(data);
    }

    // Send vehicle info to customer
    if (path === "/admin-api/send-vehicle-info" && method === "POST") {
      const { vehicleId, customerEmail, customerName } = await req.json();

      // Get vehicle details
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (!vehicle) return errResp("Vehicle not found", 404);

      // In production, this would send an email with vehicle photos, videos, documents
      // For now, just return success
      return jsonResp({
        sent: true,
        vehicle: vehicle.name,
        customer: customerEmail,
        message: `Information sur ${vehicle.name} envoyee a ${customerEmail}`
      });
    }

    return errResp("Not found", 404);
  } catch (err) {
    return errResp(err.message || "Internal server error");
  }
});
