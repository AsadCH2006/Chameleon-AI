"use client";

import React, { useState } from "react";
import { useGuardian } from "../context/GuardianContext";
import { Shield, Phone, Mic, ArrowRight } from "lucide-react";

export default function SetupScreen() {
  const { settings, updateSettings, startSession } = useGuardian();
  const [name, setName] = useState(settings.contactName);
  const [phone, setPhone] = useState(settings.contactPhone);
  const [phrase, setPhrase] = useState(settings.triggerPhrase);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !phrase) {
      alert("Please fill in all fields before proceeding.");
      return;
    }
    updateSettings({
      contactName: name,
      contactPhone: phone,
      triggerPhrase: phrase.toLowerCase().trim(),
    });
    startSession();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Chameleon AI</h1>
            <p className="text-sm text-slate-400">Guardian Setup & Configuration</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Emergency Contact Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> WhatsApp / Phone Number
            </label>
            <input
              type="tel"
              placeholder="+923001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1">
              <Mic className="w-3 h-3" /> Secret Trigger Phrase
            </label>
            <input
              type="text"
              placeholder="e.g. code red or remember milk"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Spoken phrase in English or Urdu that triggers the alert.
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Start Guardian Session <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}