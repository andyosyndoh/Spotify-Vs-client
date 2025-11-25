"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarProvider = void 0;
const vscode = require("vscode");
class StatusBarProvider {
    constructor(spotifyAPI) {
        this.spotifyAPI = spotifyAPI;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.refreshInterval = vscode.workspace.getConfiguration('spotify').get('refreshInterval') || 5000;
        this.statusBarItem.command = 'spotify.showCurrentTrack';
        this.statusBarItem.show();
        this.startRefresh();
    }
    startRefresh() {
        this.updateStatusBar();
        this.refreshTimer = setInterval(() => {
            this.updateStatusBar();
        }, this.refreshInterval);
    }
    async updateStatusBar() {
        try {
            const playback = await this.spotifyAPI.getCurrentPlayback();
            if (playback?.item) {
                const track = playback.item;
                const artists = track.artists.map(a => a.name).join(', ');
                const icon = playback.is_playing ? '▶️' : '⏸️';
                this.statusBarItem.text = `${icon} ${track.name} - ${artists}`;
                this.statusBarItem.tooltip = `${track.name}\nby ${artists}\nfrom ${track.album.name}`;
            }
            else {
                this.statusBarItem.text = '🎵 No music playing';
                this.statusBarItem.tooltip = 'No Spotify playback detected';
            }
        }
        catch (error) {
            this.statusBarItem.text = '🎵 Spotify disconnected';
            this.statusBarItem.tooltip = 'Click to authenticate with Spotify';
            this.statusBarItem.command = 'spotify.authenticate';
        }
    }
    dispose() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this.statusBarItem.dispose();
    }
}
exports.StatusBarProvider = StatusBarProvider;
//# sourceMappingURL=statusBar.js.map