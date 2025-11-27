import * as vscode from 'vscode';
import { SpotifyAPI, PlaybackState } from './api';
import { SpotifyAuth } from './auth';

export class StatusBarProvider implements vscode.Disposable {
    private trackInfoItem: vscode.StatusBarItem;
    private previousButton: vscode.StatusBarItem;
    private playPauseButton: vscode.StatusBarItem;
    private nextButton: vscode.StatusBarItem;
    private refreshTimer?: NodeJS.Timeout;
    private refreshInterval: number;
    private isAuthenticated = false;

    constructor(private spotifyAPI: SpotifyAPI, private auth: SpotifyAuth) {
        this.refreshInterval = vscode.workspace.getConfiguration('spotify').get('refreshInterval') || 5000;
        
        // Create status bar items from right to left (higher priority numbers appear more to the right)
        this.trackInfoItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 104);
        this.previousButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 103);
        this.playPauseButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 102);
        this.nextButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 101);
        
        this.setupStatusBarItems();
        this.startRefresh();
    }

    private setupStatusBarItems(): void {
        // Track info
        this.trackInfoItem.command = 'spotify.showCurrentTrack';
        this.trackInfoItem.show();
        
        // Control buttons
        this.previousButton.text = '⏮️';
        this.previousButton.command = 'spotify.previous';
        this.previousButton.tooltip = 'Previous Track';
        
        this.playPauseButton.text = '▶️';
        this.playPauseButton.command = 'spotify.play';
        this.playPauseButton.tooltip = 'Play/Pause';
        
        this.nextButton.text = '⏭️';
        this.nextButton.command = 'spotify.next';
        this.nextButton.tooltip = 'Next Track';
    }

    private startRefresh(): void {
        this.updateStatusBar();
        this.refreshTimer = setInterval(() => {
            this.updateStatusBar();
        }, this.refreshInterval);
    }

    private async updateStatusBar(): Promise<void> {
        try {
            // Check if we have stored tokens first
            const hasTokens = await this.auth.hasValidTokens();
            if (!hasTokens) {
                this.showAuthenticationRequired();
                return;
            }
            
            const playback = await this.spotifyAPI.getCurrentPlayback();
            this.isAuthenticated = true;
            
            if (playback?.item) {
                const track = playback.item;
                const artists = track.artists.map(a => a.name).join(', ');
                
                // Update track info
                this.trackInfoItem.text = `🎵 ${track.name} - ${artists}`;
                this.trackInfoItem.tooltip = `${track.name}\nby ${artists}\nfrom ${track.album.name}`;
                this.trackInfoItem.command = 'spotify.showCurrentTrack';
                
                // Update play/pause button
                this.playPauseButton.text = playback.is_playing ? '⏸️' : '▶️';
                this.playPauseButton.command = playback.is_playing ? 'spotify.pause' : 'spotify.play';
                this.playPauseButton.tooltip = playback.is_playing ? 'Pause' : 'Play';
                
                this.showControlButtons();
            } else {
                this.trackInfoItem.text = '🎵 No music playing';
                this.trackInfoItem.tooltip = 'No Spotify playback detected';
                this.trackInfoItem.command = 'spotify.showCurrentTrack';
                this.hideControlButtons();
            }
        } catch (error: any) {
            if (error.message === 'Authentication required') {
                this.showAuthenticationRequired();
            } else {
                // Keep current state for other errors (network issues, etc.)
                console.error('Spotify update error:', error.message);
            }
        }
    }

    private showAuthenticationRequired(): void {
        this.isAuthenticated = false;
        this.trackInfoItem.text = '🎵 Click to login to Spotify';
        this.trackInfoItem.tooltip = 'Click to authenticate with Spotify';
        this.trackInfoItem.command = 'spotify.authenticate';
        this.hideControlButtons();
    }

    private showControlButtons(): void {
        this.previousButton.show();
        this.playPauseButton.show();
        this.nextButton.show();
    }

    private hideControlButtons(): void {
        this.previousButton.hide();
        this.playPauseButton.hide();
        this.nextButton.hide();
    }

    dispose(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this.trackInfoItem.dispose();
        this.previousButton.dispose();
        this.playPauseButton.dispose();
        this.nextButton.dispose();
    }
}