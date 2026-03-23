# OKR Tracker — AI-Powered

A Perdoo-inspired OKR monitoring tool with an AI assistant powered by Claude. Built with React, deployable in minutes.

## Features

- **Dashboard** — Summary stats: total KRs, on track / at risk / off track / completed, avg progress
- **Filter & search** — By department, status, company KR alignment, or free text
- **Collapsible departments** — With risk indicators and avg progress per dept
- **KR detail view** — Click any KR to expand weekly update, objective, and company KR alignment
- **Inline editing** — Update current value, progress %, status, WoW change, and weekly update
- **AI Assistant** — Ask Claude questions about your OKRs in a side panel (requires Anthropic API key)

## Quick Start (local)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start
# Opens at http://localhost:3000
```

## Deploy to Vercel (free, 2 minutes)

1. Push this folder to a GitHub repository
2. Go to https://vercel.com → New Project → Import your repo
3. Click Deploy — done. Vercel auto-detects Create React App.

## Deploy to Netlify (free, 2 minutes)

1. Push this folder to a GitHub repository
2. Go to https://netlify.com → New site from Git → Select your repo
3. Build command: `npm run build`
4. Publish directory: `build`
5. Click Deploy.

## Using the AI Assistant

1. Click **✦ AI Assistant** in the top right
2. Enter your Anthropic API key (stored locally in your browser — never sent anywhere except Anthropic's API)
3. Ask anything:
   - "Which KRs are most at risk this week?"
   - "Summarize the Revenue department"
   - "What should leadership prioritize?"
   - "Which owners have the most off-track KRs?"
   - "What's the overall progress vs the timeline?"

The AI has full context of all 55 KRs including status, progress, owners, and weekly updates.

## Updating OKR data

Edit `src/data.js` to update or add KRs. Each KR has:

```js
{
  id: 1,                              // unique number
  dept: "Revenue",                    // department name
  kr: "KR description",               // key result text
  obj: "Department objective",        // parent objective
  companyKR: "KR 1.1 - ...",          // company-level KR alignment
  owner: "Name",                      // KR owner
  start: "17.8%",                     // starting value
  target: "20.0%",                    // target value
  current: "7.3%",                    // current value
  pct: 0,                             // progress 0-100
  status: "At Risk",                  // On Track / At Risk / Off Track / Completed
  wow: "+31.7%",                      // week-on-week change
  update: "Latest weekly update...",  // weekly notes
}
```

## Tech stack

- React 18
- Fonts: Syne (headings) + DM Mono (data/labels) from Google Fonts
- Anthropic Claude API (claude-sonnet-4-20250514)
- No other dependencies — zero external UI libraries
