# Spotify VS Code Extension

Control Spotify playback and view friends' activity directly from VS Code.

## Setup

### 1. Create Spotify App
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Add redirect URI: `http://127.0.0.1:5500/test/spot.html`
4. Copy your Client ID

### 2. Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your Spotify Client ID:
   ```
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   ```

### 3. Run Development Simulator
```bash
npm run dev
```

This will generate `test/spot-dev.html` with your client ID. Open it with Live Server in VS Code.

## Development

- **`npm run compile`** - Compile TypeScript extension code
- **`npm run watch`** - Watch and compile TypeScript  
- **`npm run build:html`** - Build HTML simulator with env variables
- **`npm run dev`** - Build and show instructions to run simulator

## Security

- `.env` file is git-ignored (contains your secret client ID)
- `test/spot.html` is the template (safe to commit)
- `test/spot-dev.html` is generated (git-ignored, contains secrets)

## Features

### Core Functionality
- **Playback Controls**: Play, pause, next, previous track
- **Current Track Display**: Shows currently playing song in status bar
- **Authentication**: Secure OAuth integration with Spotify
- **Real-time Updates**: Automatic status bar updates

### Commands
- `Spotify: Authenticate` - Connect your Spotify account
- `Spotify: Play` - Resume playback
- `Spotify: Pause` - Pause playback  
- `Spotify: Next Track` - Skip to next song
- `Spotify: Previous Track` - Go to previous song
- `Spotify: Show Current Track` - Display current track info

### Keyboard Shortcuts
- `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`) - Play
- `Ctrl+Shift+Space` (Mac: `Cmd+Shift+Space`) - Pause
- `Ctrl+Shift+Right` (Mac: `Cmd+Shift+Right`) - Next track
- `Ctrl+Shift+Left` (Mac: `Cmd+Shift+Left`) - Previous track

## Setup

1. **Get Spotify Client ID**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy the Client ID
   - Add `https://localhost:8080/callback` as a redirect URI

2. **Configure Extension**:
   - Open VS Code settings
   - Search for "Spotify"
   - Set your Client ID in `spotify.clientId`

3. **Authenticate**:
   - Run command `Spotify: Authenticate`
   - Follow the OAuth flow in your browser
   - Copy the authorization code back to VS Code

## Development

```bash
npm install
npm run compile
```

Press F5 to launch extension in development mode.

## Requirements

- VS Code 1.74.0 or higher
- Active Spotify Premium account
- Internet connection for API calls