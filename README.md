# 🦎 Chameleon Stealth Guard

> **Covert Emergency Alert System disguised as a minimal, everyday Notepad PWA.**

Chameleon Stealth Guard solves the "coercion problem" in personal safety. In high-threat situations—such as domestic distress, muggings, or hostage scenarios—pulling out a phone, unlocking it, and dialing emergency services is often impossible or dangerous. 

Chameleon masquerades as a completely functional, lightweight text notepad. Beneath the surface, it maintains an active, low-power Web Speech listener. Dropping a pre-configured trigger word (e.g., *"blue"*) into normal conversation silently dispatches an AI-assessed emergency alert, precise GPS coordinates, and contact details to monitored response channels via Discord Webhooks and logs the event to Supabase.

---

## 🌟 Key Features

* **🎭 Stealth Presentation Mode**: Renders a fully interactive, local-storage powered notepad application to prevent suspicion if the screen is viewed.
* **🎙️ Passive Continuous Speech Monitoring**: Operates browser-native `Web Speech API` recognition silently without visual overlays, sound cues, or haptic feedback.
* **🧠 AI Crisis Assessment**: Integrates **Google Gemini AI (`gemini-2.5-flash`)** to dynamically convert raw trigger events into contextually structured distress alerts.
* **📍 High-Precision Geolocation**: Fetches high-accuracy device GPS coordinates, with an automatic fallback to IP-based location estimation (`ipapi.co`) if location permissions are restricted.
* **⚡ Instant Discord Webhook Dispatch**: Generates rich, actionable crimson embeds delivered straight to mobile and desktop Discord channels for immediate responder visibility.
* **🔒 Cloud Audit Logging**: Permanently logs timestamped triggers, coordinates, and dispatch statuses to **Supabase** for legal or forensic verification.
* **📱 Progressive Web App (PWA)**: Installable directly on iOS (Safari) and Android (Chrome) home screens with local offline caching.

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |   User Spoken Voice   |
                                  +-----------+-----------+
                                              |
                                              v
                              +---------------+---------------+
                              | Stealth Notepad PWA (Client)  |
                              |   - Speech Recognition API    |
                              |   - Browser GPS Location      |
                              +---------------+---------------+
                                              |
                                              v
                               +--------------+--------------+
                               | Next.js API (/api/emergency)|
                               +--------------+--------------+
                                              |
               +------------------------------+------------------------------+
               |                              |                              |
               v                              v                              v
    +----------+----------+        +----------+----------+        +----------+----------+
    |   Google Gemini AI   |        |   Discord Webhook    |        |   Supabase Database  |
    | (Crisis Assessment) |        |  (Instant Push Alert)|        |  (Forensic Audit Log)|
    +---------------------+        +---------------------+        +---------------------+
```

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Artificial Intelligence**: [@google/genai SDK](https://www.npmjs.com/package/@google/genai) (`gemini-2.5-flash`)
* **Database**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
* **Deployment**: [Vercel](https://vercel.com/)
* **Notification Layer**: Discord Webhooks API

---

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following installed locally:
* **Node.js** (v18.0 or higher)
* **npm** or **pnpm**
* A Google Gemini API Key
* A Supabase Project URL & Anon Key
* A Discord Webhook URL

---

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AsadCH2006/Chameleon-AI.git
cd Chameleon-AI
npm install
```

---

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url_here
```

---

### 3. Database Setup (Supabase)

Execute the following SQL query in your Supabase SQL Editor to create the log repository table:

```sql
create table emergency_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  contact_name text,
  contact_phone text,
  trigger_phrase text,
  latitude numeric,
  longitude numeric,
  ai_message text,
  dispatch_status text
);
```

---

### 4. Running Locally

Start the local Next.js development server:

```bash
npm run dev
```

Open `http://localhost:3000` on your browser to launch the app.

---

## 📲 Mobile PWA Installation

1. Deploy your app to Vercel or access your local HTTPS tunnel on your phone.
2. Open the URL on **Safari (iOS)** or **Chrome (Android)**.
3. Tap **Share / Menu** → select **Add to Home Screen**.
4. Open the installed **Chameleon** app, grant **Microphone** and **Location** permissions, set your secret trigger phrase, and begin silent monitoring.

---

## 🛡️ Practical Use Cases

* **Coercive Threats & Hostage Scenarios**: Speak a phrase out loud during normal conversation without alerting perpetrators.
* **Domestic Crisis Situations**: Alert designated emergency contacts silently when physically accessing a phone isn't safe.
* **Escort & Lone Worker Safety**: Provide instant continuous GPS telemetry to private security channels or automated notification boards.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
