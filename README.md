# Spotify VS Code Extension

Control your Spotify playback directly from Visual Studio Code! View currently playing tracks, control playback, and see album artwork - all without leaving your editor.

## ✨ Features

- 🎵 **Real-time Track Display** - See what's playing in your status bar
- 🎨 **Album Artwork** - Hover over the song name to see album art and track details
- 📊 **Live Progress Bar** - Watch your song progress in real-time
- ⏯️ **Playback Controls** - Play, pause, skip tracks right from VS Code
- ⚡ **Quick Access** - Control Spotify without switching windows
- 🔐 **Secure OAuth** - Safe authentication with your Spotify account

## 📸 Screenshots

![Status Bar](https://raw.githubusercontent.com/andyosyndoh/Spotify-Vs-client/main/images/statusbar.png)

## 🚀 Getting Started

### Prerequisites
- Active Spotify account (Premium recommended for full playback control)
- Spotify app running on any device (desktop, mobile, or web player)

### Installation

1. **Install the extension** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=andyosyndoh.spotify-vscode)

2. **Authenticate with Spotify**:
   - Click the Spotify icon in the status bar (bottom of VS Code)
   - Or run command: `Spotify: Authenticate` (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Your browser will open - log in and authorize the extension
   - Return to VS Code - you're all set! 🎉

That's it! No configuration needed - just install and authenticate!

## 🎮 Usage

### Status Bar
The status bar shows your currently playing track. Click it to see more details!

Hover over the song name to see:
- Album artwork
- Artist and album information
- Real-time progress bar

### Controls
Use the playback control buttons in the status bar:
- ⏮️ Previous track
- ⏸️ Play/Pause
- ⏭️ Next track

### Commands
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and search for:
- `Spotify: Authenticate` - Connect your Spotify account
- `Spotify: Play` - Resume playback
- `Spotify: Pause` - Pause playback
- `Spotify: Next Track` - Skip to next song
- `Spotify: Previous Track` - Go to previous song
- `Spotify: Show Current Track` - Display track info

### Keyboard Shortcuts
- `Ctrl+Shift+Space` (Mac: `Cmd+Shift+Space`) - Play/Pause
- `Ctrl+Shift+Right` (Mac: `Cmd+Shift+Right`) - Next track
- `Ctrl+Shift+Left` (Mac: `Cmd+Shift+Left`) - Previous track

## ⚙️ Settings

| Setting | Description | Default |
|---------|-------------|---------||
| `spotify.refreshInterval` | How often to update track info (milliseconds) | 5000 |

## 🔧 Troubleshooting

### "No active playback device found"
- Make sure Spotify is playing on at least one device (phone, desktop, web player)
- Start playing a song on any Spotify app first

### Controls don't respond
- Check that Spotify is actively playing on a device
- Try refreshing by clicking the status bar
- Reload VS Code window: `Developer: Reload Window`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- Inspired by the need for seamless music control while coding

## 📞 Support

- 🐛 [Report a bug](https://github.com/andyosyndoh/Spotify-Vs-client/issues)
- 💡 [Request a feature](https://github.com/andyosyndoh/Spotify-Vs-client/issues)
- ⭐ [Star on GitHub](https://github.com/andyosyndoh/Spotify-Vs-client)

---

**Enjoy coding with your favorite music!** 🎵✨