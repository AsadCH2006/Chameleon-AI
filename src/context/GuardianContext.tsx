"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GuardianSettings {
  contactName: string;
  contactPhone: string;
  triggerPhrase: string;
  isSessionActive: boolean;
}

interface GuardianContextType {
  settings: GuardianSettings;
  updateSettings: (newSettings: Partial<GuardianSettings>) => void;
  startSession: () => void;
  stopSession: () => void;
}

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export const GuardianProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<GuardianSettings>({
    contactName: "",
    contactPhone: "",
    triggerPhrase: "code red",
    isSessionActive: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("chameleon_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<GuardianSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("chameleon_settings", JSON.stringify(updated));
      return updated;
    });
  };

  const startSession = () => updateSettings({ isSessionActive: true });
  const stopSession = () => updateSettings({ isSessionActive: false });

  return (
    <GuardianContext.Provider value={{ settings, updateSettings, startSession, stopSession }}>
      {children}
    </GuardianContext.Provider>
  );
};

export const useGuardian = () => {
  const context = useContext(GuardianContext);
  if (!context) throw new Error("useGuardian must be used within GuardianProvider");
  return context;
};