# Bills Hub · Paytm prototype

One calendar for every recurring payment in the family. Clickable prototype for the Paytm Product Campus Case Study (Case 2: Recharge engagement), by Kirti Agarwal, MDI Gurgaon.

## What you can do in the prototype

- Enter one mobile number and verify it with an OTP; mobile, DTH and LPG accounts on that number are found
- Link a family member's number with OTP and consent
- Add any bill: category → provider → customer ID → bill fetched
- See every bill in one hub and calendar, with an AI summary (Gemini) and spend analysis
- Pay in full, pay several bills together, or split a bill with flatmates
- Rewards for each new category, auto-pay and family controls

Open a specific screen with `?start=` and one of: `start`, `found`, `hub`, `insights`, `bill`, `pay`, `split`, `calendar`, `rewards`, `family`, `autopay`, `addBill`.

## Run and deploy

It is a static page (`index.html`) plus one serverless function (`api/summary.js`).

1. Import this repository in Vercel (Framework preset: **Other**, no build command).
2. In **Settings → Environment Variables**, add `GEMINI_API_KEY` with your Gemini API key. Optional: `GEMINI_MODEL` (default `gemini-2.5-flash`).
3. Deploy. Without a key the prototype still works and shows its built-in summary text.

The key stays on the server. The summary request sends only amounts, dates and bill categories, never names, phone numbers or customer IDs.

All data in the prototype is sample data.

Hosted on Vercel.
