import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
});

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(req: Request) {
  try {
    const { contactName, contactPhone, triggerPhrase, location } = await req.json();

    // 1. Generate Assessment
    let aiAssessment = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `System emergency voice trigger "${triggerPhrase}" was spoken. Produce a 1-sentence urgent crisis alert notification suitable for sending to emergency contact ${contactName}. Include a request for immediate check-in.`,
      });
      aiAssessment = response.text || "";
    } catch (apiErr: any) {
      aiAssessment = `URGENT CRISIS ALERT: System emergency trigger "${triggerPhrase}" has been activated; please check in with me immediately to verify my safety.`;
    }

    if (!aiAssessment) {
      aiAssessment = `URGENT CRISIS ALERT: System emergency trigger "${triggerPhrase}" has been activated; please check in with me immediately to verify my safety.`;
    }

    const finalMessage = location?.mapUrl
      ? `${aiAssessment.trim()}\n\nLive Location: ${location.mapUrl}`
      : aiAssessment.trim();

    // 2. Dispatch Alert via Twilio
    let dispatchStatus = "skipped";
    if (twilioClient && twilioWhatsAppNumber && contactPhone) {
      try {
        const formattedFrom = twilioWhatsAppNumber.startsWith("whatsapp:")
          ? twilioWhatsAppNumber
          : `whatsapp:${twilioWhatsAppNumber}`;
        const formattedTo = contactPhone.startsWith("whatsapp:")
          ? contactPhone
          : `whatsapp:${contactPhone}`;

        await twilioClient.messages.create({
          body: finalMessage,
          from: formattedFrom,
          to: formattedTo,
        });
        dispatchStatus = "sent";
      } catch (waError: any) {
        console.error("Twilio Dispatch Error:", waError.message);
        dispatchStatus = "failed";
      }
    }

    // 3. Save Log to Supabase Database
    try {
      await supabase.from("emergency_logs").insert([
        {
          contact_name: contactName,
          contact_phone: contactPhone,
          trigger_phrase: triggerPhrase,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          ai_message: finalMessage,
          dispatch_status: dispatchStatus,
        },
      ]);
      console.log("Database Log: Persistent record stored in Supabase ✅");
    } catch (dbError: any) {
      console.error("Supabase Database Insert Error:", dbError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Emergency sequence executed and logged successfully.",
      aiMessage: finalMessage,
    });
  } catch (error: any) {
    console.error("Emergency Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}