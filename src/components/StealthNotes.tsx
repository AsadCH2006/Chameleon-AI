"use client";

import React, { useState } from "react";
import { useGuardian } from "../context/GuardianContext";
import { useSpeechTrigger } from "../hooks/useSpeechTrigger";
import { Lock, FileText, Check, AlertTriangle } from "lucide-react";

export default function StealthNotes() {
  const { settings, stopSession } = useGuardian();
  const [noteText, setNoteText] = useState("");
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleTrigger = async () => {
    if (alertTriggered) return;
    setAlertTriggered(true);

    let locationData: { latitude?: number; longitude?: number; mapUrl?: string } = {};

    // Silently attempt to capture GPS coordinates before dispatching
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });

        const { latitude, longitude } = position.coords;
        locationData = {
          latitude,
          longitude,
          mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
        };
      } catch (geoError) {
        console.warn("Geolocation access denied or timed out:", geoError);
      }
    }

    try {
      await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: settings.contactName,
          contactPhone: settings.contactPhone,
          triggerPhrase: settings.triggerPhrase,
          location: locationData,
        }),
      });
    } catch (err) {
      console.error("Failed to send emergency alert API request:", err);
    }
  };

  useSpeechTrigger({
    triggerPhrase: settings.triggerPhrase,
    isActive: settings.isSessionActive,
    onTriggerDetected: handleTrigger,
  });

  const handleSaveNote = () => {
    setLastSaved(new Date().toLocaleTimeString());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8">
      {/* Covert Top Bar */}
      <header className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          <h1 className="text-base font-semibold text-slate-300">Quick Notes</h1>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" /> Saved at {lastSaved}
            </span>
          )}
          <button
            onClick={stopSession}
            title="Lock session"
            className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Notepad Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Start typing your notes here..."
          className="w-full flex-1 bg-transparent border-none text-slate-200 placeholder-slate-600 focus:outline-none resize-none text-base leading-relaxed"
        />

        <div className="flex justify-between items-center pt-4 border-t border-slate-800/60">
          <span className="text-xs text-slate-600">
            {noteText.length} characters | {noteText.split(/\s+/).filter(Boolean).length} words
          </span>

          <button
            onClick={handleSaveNote}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
          >
            Save Draft
          </button>
        </div>
      </main>

      {/* Hidden Stealth Diagnostic Watermark (For Development Testing) */}
      <footer className="mt-4 pt-2 text-center border-t border-slate-900">
        <p className="text-[10px] text-slate-800 select-none">
          Protection Status: Active | Trigger: "{settings.triggerPhrase}" | Contact: {settings.contactName}
        </p>
        {alertTriggered && (
          <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-rose-950/80 border border-rose-800/50 rounded text-rose-300 text-[11px]">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Stealth Emergency Sequence Initiated
          </div>
        )}
      </footer>
    </div>
  );
}