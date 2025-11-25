import * as vscode from 'vscode';
import { SpotifyAPI, PlaybackState } from './api';

export class StatusBarProvider implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    private refreshTimer?: NodeJS.Timeout;
    private refreshInterval: number;

    constructor(private spotifyAPI: SpotifyAPI) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.refreshInterval = vscode.workspace.getConfiguration('spotify').get('refreshInterval') || 5000;
        
        this.statusBarItem.command = 'spotify.showCurrentTrack';
        this.statusBarItem.show();
        
        this.startRefresh();
    }

    private startRefresh(): void {
        this.updateStatusBar();
        this.refreshTimer = setInterval(() => {
            this.updateStatusBar();
        }, this.refreshInterval);
    }

    private async updateStatusBar(): Promise<void> {
        try {
            const playback = await this.spotifyAPI.getCurrentPlayback();
            
            if (playback?.item) {
                const track = playback.item;
                const artists = track.artists.map(a => a.name).join(', ');
                const icon = playback.is_playing ? '▶️' : '⏸️';
                
                this.statusBarItem.text = `${icon} ${track.name} - ${artists}`;
                this.statusBarItem.tooltip = `${track.name}\nby ${artists}\nfrom ${track.album.name}`;
            } else {
                this.statusBarItem.text = '🎵 No music playing';
                this.statusBarItem.tooltip = 'No Spotify playback detected';
            }
        } catch (error) {
            this.statusBarItem.text = '🎵 Spotify disconnected';
            this.statusBarItem.tooltip = 'Click to authenticate with Spotify';
            this.statusBarItem.command = 'spotify.authenticate';
        }
    }

    dispose(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this.statusBarItem.dispose();
    }
}