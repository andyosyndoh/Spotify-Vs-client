# Quick Setup Guide for Spotify VS Code Extension

## Issue: Extension Not Responding?

The extension requires Spotify API credentials to work. Here's how to set it up:

## Step 1: Get Your Spotify Credentials

1. **Go to Spotify Developer Dashboard:**
   - Visit: https://developer.spotify.com/dashboard
   - Log in with your Spotify account

2. **Create a New App:**
   - Click "Create app"
   - Name: "VS Code Extension" (or any name you like)
   - Description: "Personal VS Code integration"
   - Redirect URI: `http://127.0.0.1:8080/callback`
   - ⚠️ **Important:** Make sure to add the redirect URI exactly as shown
   - Check the agreement boxes and click "Save"

3. **Get Your Credentials:**
   - Click on your newly created app
   - Click "Settings"
   - You'll see:
     - **Client ID** (visible by default)
     - **Client Secret** (click "View client secret")
   - Keep this page open

## Step 2: Configure VS Code

1. **Open VS Code Settings:**
   - Press `Ctrl+,` (or `Cmd+,` on Mac)
   - Or: File → Preferences → Settings

2. **Search for "spotify"**

3. **Set Your Credentials:**
   - **Spotify: Client Id** → Paste your Client ID
   - **Spotify: Client Secret** → Paste your Client Secret

   Or edit `settings.json` directly:
   ```json
   {
     "spotify.clientId": "your_client_id_here",
     "spotify.clientSecret": "your_client_secret_here"
   }
   ```

## Step 3: Test Configuration

1. **Check if credentials are set:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type: "Spotify: Check Configuration"
   - You should see both Client ID and Client Secret marked as "Set ✓"

2. **Authenticate:**
   - Press `Ctrl+Shift+P`
   - Type: "Spotify: Authenticate with Spotify"
   - A browser window will open
   - Log in and authorize the app
   - You should see "Authentication successful!" in the browser
   - VS Code will show a success message

## Step 4: Use the Extension

Once authenticated:
- **Status Bar** shows current playing track with controls
- **Hover** over the track name to see album artwork
- **Click** the play/pause button to control playback
- Use keyboard shortcuts:
  - `Ctrl+Shift+Space` → Play/Pause
  - `Ctrl+Shift+Right` → Next Track
  - `Ctrl+Shift+Left` → Previous Track

## Troubleshooting

### "Please set Spotify Client ID in settings"
→ You haven't configured your Client ID (see Step 2)

### "Client secret not configured"
→ You haven't configured your Client Secret (see Step 2)

### "Authentication failed" or redirect doesn't work
→ Make sure your redirect URI in Spotify Dashboard is exactly: `http://127.0.0.1:8080/callback`

### Browser opens but shows error
→ Check that port 8080 is not in use by another application

### Extension installed but commands don't appear
→ Reload VS Code window:
   - Press `Ctrl+Shift+P`
   - Type: "Developer: Reload Window"

## Quick Test

Run this in Command Palette to verify setup:
```
Spotify: Check Configuration
```

If both show "Set ✓", you're ready to go!
