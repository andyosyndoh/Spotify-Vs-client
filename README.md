# Spotify VS Code Extension

Control Spotify playback and view friends' activity directly from VS Code.

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