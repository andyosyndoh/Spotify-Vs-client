# Quick Setup Guide

Your Spotify extension is installed! Now you need to configure it:

## Step 1: Get Spotify Credentials

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in:
   - **App Name**: VS Code Spotify Extension
   - **App Description**: Personal Spotify controller for VS Code
   - **Redirect URI**: `http://127.0.0.1:8080/callback`
5. Click "Save"
6. Click "Settings" button
7. Copy your **Client ID** and **Client Secret**

## Step 2: Configure VS Code Settings

### Option A: Using VS Code UI
1. Press `Ctrl+,` (or `Cmd+,` on Mac) to open Settings
2. Search for "spotify"
3. Enter your **Client ID** in `Spotify: Client Id`
4. Enter your **Client Secret** in `Spotify: Client Secret`

### Option B: Using settings.json
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Preferences: Open User Settings (JSON)"
3. Add these lines:
```json
{
  "spotify.clientId": "your_client_id_here",
  "spotify.clientSecret": "your_client_secret_here"
}
```

## Step 3: Authenticate

1. Look at the VS Code status bar (bottom of the screen)
2. Click on "🎵 Click to login to Spotify"
3. Your browser will open - log in and authorize the app
4. Return to VS Code - you should see your currently playing track!

## Step 4: Test It!

- Click the status bar to see track info
- Use the playback controls (⏮️ ⏸️ ⏭️)
- Hover over the song name to see album artwork!

## Troubleshooting

### "Please set Spotify Client ID in settings"
- You haven't configured the Client ID yet (see Step 2)

### "Client secret not configured"
- You haven't configured the Client Secret yet (see Step 2)

### Browser opens but nothing happens
- Make sure the redirect URI in your Spotify app settings is exactly: `http://127.0.0.1:8080/callback`
- Check VS Code's Output panel (View → Output → Spotify) for errors

### Extension commands not working
1. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Check if extension is enabled: `Ctrl+Shift+X` → search for "Spotify Integration"
3. Check Output panel for errors

## Quick Command Reference

Press `Ctrl+Shift+P` (or `Cmd+Shift+P`) and type:
- **Spotify: Authenticate** - Login to Spotify
- **Spotify: Play** - Resume playback
- **Spotify: Pause** - Pause playback
- **Spotify: Next Track** - Skip to next track
- **Spotify: Previous Track** - Go to previous track
- **Spotify: Show Current Track** - Show track details

## Keyboard Shortcuts

- `Ctrl+Shift+Space` - Play/Pause
- `Ctrl+Shift+Right` - Next track
- `Ctrl+Shift+Left` - Previous track
