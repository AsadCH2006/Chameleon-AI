"use client";

import { GuardianProvider, useGuardian } from "../context/GuardianContext";
import SetupScreen from "../components/SetupScreen";
import StealthNotes from "../components/StealthNotes";

function MainContent() {
  const { settings } = useGuardian();

  if (!settings.isSessionActive) {
    return <SetupScreen />;
  }

  return <StealthNotes />;
}

export default function Home() {
  return (
    <GuardianProvider>
      <MainContent />
    </GuardianProvider>
  );
}