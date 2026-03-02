# PCT GPS Tracker — User Manual

A step-by-step guide to setting up and using the real-time GPS tracker on Paul Barry's PCT 2026 website.

---

## Table of Contents

1. [Overview](#overview)
2. [Initial Setup (One-Time)](#initial-setup-one-time)
3. [Using the Tracker on Paul's Phone](#using-the-tracker-on-pauls-phone)
4. [Viewing the Live Map](#viewing-the-live-map)
5. [Testing with Your Own Phone](#testing-with-your-own-phone)
6. [Troubleshooting](#troubleshooting)
7. [Technical Reference](#technical-reference)

---

## Overview

The GPS tracker lets Paul send his live location from his phone while hiking the PCT. Visitors to the website see his position updated on the trail map in real time.

**How it works:**

```
Paul's Phone (/tracker)  -->  POST /api/location  -->  Upstash Redis (cloud database)
                                                              |
Website visitors (/trail-map)  <--  GET /api/location  <-----+
       (auto-refreshes every 30 seconds)
```

---

## Initial Setup (One-Time)

These steps only need to be done once, before the tracker can be used.

### Step 1: Create an Upstash Redis Database

1. Go to the **Vercel Dashboard** → your project (`pct-website`)
2. Click **Storage** tab (in the top navigation)
3. Click **Create Database** → choose **Upstash Redis** (KV)
4. Pick the **Free** tier (more than enough for this use case)
5. Select a region close to the US (e.g., `us-east-1`)
6. Click **Create**

Once created, Vercel automatically adds two environment variables to your project:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### Step 2: Generate an Auth Token

The auth token is a secret password that only Paul knows. It prevents anyone else from sending fake location updates.

**Option A — Generate a random token:**

Open a terminal and run:
```bash
openssl rand -hex 32
```

This outputs something like:
```
a3f8b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
```

**Option B — Just make up a strong password:**
```
PaulPCT2026-MySecretTracker!
```

### Step 3: Set Environment Variables in Vercel

1. Go to **Vercel Dashboard** → your project → **Settings** → **Environment Variables**
2. Add these variables (for all environments: Production, Preview, Development):

| Variable | Value | Notes |
|----------|-------|-------|
| `KV_REST_API_URL` | *(auto-set by Step 1)* | Should already be there |
| `KV_REST_API_TOKEN` | *(auto-set by Step 1)* | Should already be there |
| `TRACKER_AUTH_TOKEN` | Your token from Step 2 | The secret password |
| `HIKE_START_DATE` | `2026-03-28` | The day Paul starts hiking |

3. Click **Save**
4. **Redeploy** the project (Deployments tab → click the three dots on the latest deployment → Redeploy)

### Step 4: Write Down the Token

Give Paul the auth token from Step 2. He'll need to type it into his phone once. Suggested ways to share it:
- Text/WhatsApp message to Paul
- Write it on a card he keeps in his pack
- Save it in his phone's password manager

---

## Using the Tracker on Paul's Phone

### Starting a Tracking Session

1. **Open the tracker page** on Paul's phone browser:
   - `https://paulbarry.com/tracker` (if using custom domain)
   - OR `https://pct-website-iota.vercel.app/tracker` (Vercel URL)

2. **Enter the auth token** in the "AUTH TOKEN" field
   - He only needs to do this once — the phone browser remembers it

3. **Tap "START TRACKING"**
   - The phone will ask for location permission → tap **Allow** (choose "While using the app" or "Always")
   - The status circle turns green and pulses
   - Status shows "Getting GPS..." then "Updated [time]"

4. **Leave the browser tab open** while hiking
   - The phone sends GPS coordinates every 60 seconds automatically
   - The screen shows: current coordinates, altitude, and number of updates sent
   - It's fine to lock the phone screen — the tab stays active on most phones

### Stopping Tracking

1. Open the tracker page
2. Tap **"STOP TRACKING"** (the red button)
3. Status changes to "Stopped"

### Tips for Paul

- **Battery life**: GPS tracking uses some battery. Consider bringing a power bank.
- **Phone settings**: Turn off battery optimization/power saving for the browser, otherwise the phone may kill the background tab.
- **No signal?**: If Paul loses cell service, the tracker shows "Network error — will retry". It automatically tries again every 60 seconds. Updates resume when signal returns.
- **Airplane mode**: The tracker won't work in airplane mode (it needs internet to send data).
- **Multiple devices**: Only one device should be tracking at a time. The system uses the most recent GPS update.
- **Bookmark it**: Paul should bookmark the /tracker page on his phone's home screen for easy access.

### Adding to Home Screen (Recommended)

**iPhone (Safari):**
1. Open the tracker URL in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. Name it "PCT Tracker" → tap Add

**Android (Chrome):**
1. Open the tracker URL in Chrome
2. Tap the three-dot menu
3. Tap "Add to Home Screen"
4. Name it "PCT Tracker" → tap Add

---

## Viewing the Live Map

Anyone visiting the website can see Paul's live location:

1. Go to `https://paulbarry.com/trail-map` (or the Vercel URL)
2. The map shows:
   - **Orange trail line**: The full PCT route
   - **Orange marker pin**: Paul's current location with day number and nearest landmark
   - **Sidebar**: Trail sections (current section highlighted)
   - **Stats bar**: Today's distance, elevation gain, total miles, current elevation, day number

The page **automatically refreshes** every 30 seconds — no need to manually reload.

---

## Testing with Your Own Phone

Yes! You can absolutely test this with your own phone before Paul starts hiking.

### Quick Test (5 minutes)

1. Make sure the [Initial Setup](#initial-setup-one-time) is complete and the site is deployed
2. Open the tracker on your phone: `https://pct-website-iota.vercel.app/tracker`
3. Enter the auth token → tap START TRACKING
4. Allow location access when prompted
5. Open the trail map on your computer: `https://pct-website-iota.vercel.app/trail-map`
6. Wait up to 30 seconds — you should see the marker jump to your location

### Walking Test (15-30 minutes)

This is the best way to verify everything works end-to-end:

1. Start tracking on your phone (same as above)
2. Go for a walk around your neighborhood
3. Keep the trail map open on your computer (or a second device)
4. Every 30 seconds, the map should update with your new position
5. The stats bar will show your movement:
   - "Today's Distance" increases as you walk
   - "Elevation Gain" changes if you go uphill
   - "Total Miles" shows your snapped position on the PCT (will be approximate since you're not on the actual trail)

**Note**: Since you're not on the PCT, the "Total Miles" and trail section will snap to the nearest point on the trail. The marker on the map will show your actual GPS coordinates though.

### Test with Fake Coordinates (No Walking Required)

If you want to simulate Paul being on the trail without physically going there:

```bash
# Simulate Paul at mile ~100 (near Warner Springs, CA)
curl -X POST https://pct-website-iota.vercel.app/api/location \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"lat":33.28,"lng":-116.63,"altitude":950,"timestamp":1711700000000}'

# Wait 10 seconds (rate limit), then simulate further north
curl -X POST https://pct-website-iota.vercel.app/api/location \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"lat":33.82,"lng":-117.05,"altitude":1500,"timestamp":1711700060000}'
```

Replace `YOUR_TOKEN_HERE` with the actual auth token from Step 2.

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Invalid token" | Wrong auth token entered | Re-enter the correct token from Step 2 |
| "Geolocation not available" | Browser doesn't support GPS | Use Chrome or Safari (not in-app browsers) |
| "GPS error: User denied" | Location permission denied | Go to phone Settings → Browser → Location → Allow |
| "Network error — will retry" | No internet connection | Wait for signal; tracker retries automatically |
| "Too frequent — will retry" | Sent updates too fast | Normal; there's a 10-second rate limit. It auto-retries |
| Map not updating | Page not refreshing | Wait 30 seconds; check browser console for errors |
| Stats show "—" | No GPS data in Redis yet | Start tracking first, then check the trail map |
| Token not saving | Browser privacy settings | Disable "Block all cookies" or use a different browser |

### Verifying the API Directly

Check if there's data in the system:
```bash
curl https://pct-website-iota.vercel.app/api/location
```

This returns JSON with the current position and stats. If it returns default/empty data, no GPS updates have been sent yet.

---

## Technical Reference

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/location` | GET | None (public) | Returns current position + trail stats |
| `/api/location` | POST | Bearer token | Submits a GPS update |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KV_REST_API_URL` | Yes | Upstash Redis REST URL (auto-set by Vercel) |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis auth token (auto-set by Vercel) |
| `TRACKER_AUTH_TOKEN` | Yes | Secret token for POST authentication |
| `HIKE_START_DATE` | Yes | Hike start date in YYYY-MM-DD format |

### Data Storage

- **Current position**: Stored in Redis key `location:current`
- **Daily history**: Stored in Redis key `location:history:YYYY-MM-DD`
- **Retention**: History entries expire after 90 days automatically

### Update Frequencies

- **Phone → Server**: Every 60 seconds
- **Server → Trail Map**: Every 30 seconds (polling)
- **Rate limit**: Server rejects updates within 10 seconds of the last one

### Custom Domain

When moving to a custom domain (e.g., `paulbarry.com`):
1. Add the domain in Vercel Dashboard → Settings → Domains
2. Update DNS records as instructed by Vercel
3. Everything else works automatically — no code changes needed
4. Paul should update his bookmark to the new domain's `/tracker` page
