import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

export async function POST(req: Request) {
  try {
    const { contactName, contactPhone, triggerPhrase, location: clientLocation } = await req.json();

    // --- 1. GEOLOCATION WITH IP FALLBACK ---
    let finalLocation = clientLocation;

    if (!finalLocation?.latitude || !finalLocation?.longitude) {
      try {
        const ipRes = await fetch("https://ipapi.co/json/", { cache: "no-store" });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          finalLocation = {
            latitude: ipData.latitude,
            longitude: ipData.longitude,
            city: ipData.city,
            country: ipData.country_name,
            mapUrl: `https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}`,
            isApproximate: true,
          };
        }
      } catch (ipErr) {
        console.warn("IP Geolocation fallback failed:", ipErr);
      }
    }

    // --- 2. AI CRISIS ASSESSMENT ---
    let aiAssessment = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `System emergency voice trigger "${triggerPhrase}" was spoken. Produce a 1-sentence urgent crisis alert notification suitable for sending to emergency contact ${contactName}. Include a request for immediate check-in.`,
      });
      aiAssessment = response.text || "";
    } catch (apiErr: any) {
      console.warn("Gemini API fallback executed.");
      aiAssessment = `URGENT CRISIS ALERT: System emergency trigger "${triggerPhrase}" has been activated; please check in with me immediately to verify my safety.`;
    }

    if (!aiAssessment) {
      aiAssessment = `URGENT CRISIS ALERT: System emergency trigger "${triggerPhrase}" has been activated; please check in with me immediately to verify my safety.`;
    }

    const plainTextMessage = `${aiAssessment.trim()}${
      finalLocation?.mapUrl ? `\n\nLive Location: ${finalLocation.mapUrl}` : ""
    }`;

    // --- 3. DISPATCH VIA DISCORD WEBHOOK ---
    let discordStatus = "skipped";
    if (discordWebhookUrl) {
      try {
        const embedPayload = {
          username: "Chameleon Stealth Guard",
          embeds: [
            {
              title: "🚨 STEALTH EMERGENCY ALERT ACTIVATED",
              description: aiAssessment.trim(),
              color: 15548997, // Crimson Red
              fields: [
                { name: "Trigger Word", value: `\`"${triggerPhrase}"\``, inline: true },
                { name: "Emergency Contact", value: `${contactName} (${contactPhone})`, inline: true },
                {
                  name: "Location Status",
                  value: finalLocation?.mapUrl
                    ? `[View Google Maps](${finalLocation.mapUrl}) (${
                        finalLocation.isApproximate ? "IP Estimated" : "Exact GPS"
                      })`
                    : "Unavailable",
                  inline: false,
                },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        };

        const dcRes = await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(embedPayload),
        });

        if (dcRes.ok) {
          discordStatus = "sent";
        } else {
          console.error("Discord Webhook delivery failed:", dcRes.statusText);
          discordStatus = "failed";
        }
      } catch (dcErr) {
        console.error("Discord Dispatch Exception:", dcErr);
        discordStatus = "failed";
      }
    }

    // --- 4. LOG TO SUPABASE ---
    try {
      await supabase.from("emergency_logs").insert([
        {
          contact_name: contactName,
          contact_phone: contactPhone,
          trigger_phrase: triggerPhrase,
          latitude: finalLocation?.latitude || null,
          longitude: finalLocation?.longitude || null,
          ai_message: plainTextMessage,
          dispatch_status: `Discord: ${discordStatus}`,
        },
      ]);
    } catch (dbError: any) {
      console.error("Supabase Log Error:", dbError.message);
    }

    console.log("-----------------------------------------");
    console.log("🚨 STEALTH ALERT EXECUTED 🚨");
    console.log(`Discord Status: ${discordStatus.toUpperCase()}`);
    console.log("-----------------------------------------");

    return NextResponse.json({
      success: true,
      discordStatus,
      aiMessage: plainTextMessage,
    });
  } catch (error: any) {
    console.error("Emergency Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
