import * as vscode from 'vscode';
import { SpotifyAPI, PlaybackState } from './api';
import { SpotifyAuth } from './auth';

export class StatusBarProvider implements vscode.Disposable {
    private trackInfoItem: vscode.StatusBarItem;
    private previousButton: vscode.StatusBarItem;
    private playPauseButton: vscode.StatusBarItem;
    private nextButton: vscode.StatusBarItem;
    private refreshTimer?: NodeJS.Timeout;
    private progressTimer?: NodeJS.Timeout;
    private refreshInterval: number;
    private isAuthenticated = false;
    private updateDebounceTimer?: NodeJS.Timeout;
    
    // Local progress tracking
    private localProgressMs: number = 0;
    private lastUpdateTime: number = 0;
    private durationMs: number = 0;
    private isPlaying: boolean = false;
    private currentTrack?: any;

    constructor(private spotifyAPI: SpotifyAPI, private auth: SpotifyAuth) {
        this.refreshInterval = 10000; // Update from API every 10 seconds
        
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
        
        // Start local progress updates every second
        this.startProgressUpdates();
    }

    public async forceUpdate(): Promise<void> {
        // Debounce: if called multiple times rapidly, only execute the last one
        if (this.updateDebounceTimer) {
            clearTimeout(this.updateDebounceTimer);
        }
        
        this.updateDebounceTimer = setTimeout(async () => {
            // Clear existing timer
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
            
            // Update immediately
            await this.updateStatusBar();
            
            // Restart timer
            this.refreshTimer = setInterval(() => {
                this.updateStatusBar();
            }, this.refreshInterval);
            
            this.updateDebounceTimer = undefined;
        }, 100); // 100ms debounce delay
    }

    private startProgressUpdates(): void {
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
        }
        this.lastUpdateTime = Date.now();
        this.progressTimer = setInterval(() => {
            this.updateLocalProgress();
        }, 1000);
    }

    private stopProgressUpdates(): void {
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = undefined;
        }
    }

    private updateLocalProgress(): void {
        if (!this.isPlaying || !this.currentTrack) {
            return;
        }

        const now = Date.now();
        const elapsed = now - this.lastUpdateTime;
        this.localProgressMs += elapsed;
        this.lastUpdateTime = now;

        // Cap progress at duration to prevent overflow
        if (this.durationMs > 0) {
            this.localProgressMs = Math.min(this.localProgressMs, this.durationMs);
        }

        // Update tooltip with new progress
        this.updateTooltip();
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
                
                // Update local progress tracking
                this.currentTrack = track;
                this.localProgressMs = playback.progress_ms || 0;
                this.lastUpdateTime = Date.now();
                this.durationMs = track.duration_ms;
                this.isPlaying = playback.is_playing;
                
                // Update track info
                this.trackInfoItem.text = `🎵 ${track.name} - ${artists}`;
                this.trackInfoItem.command = 'spotify.showCurrentTrack';
                
                // Update tooltip
                this.updateTooltip();
                
                // Update play/pause button
                this.playPauseButton.text = playback.is_playing ? '⏸️' : '▶️';
                this.playPauseButton.command = playback.is_playing ? 'spotify.pause' : 'spotify.play';
                this.playPauseButton.tooltip = playback.is_playing ? 'Pause' : 'Play';
                
                // Start/stop progress updates based on playback state
                if (playback.is_playing) {
                    this.startProgressUpdates();
                } else {
                    this.stopProgressUpdates();
                }
                
                this.showControlButtons();
            } else {
                this.currentTrack = undefined;
                this.trackInfoItem.text = '🎵 No music playing';
                this.trackInfoItem.tooltip = 'No Spotify playback detected';
                this.trackInfoItem.command = 'spotify.showCurrentTrack';
                this.stopProgressUpdates();
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

    private updateTooltip(): void {
        if (!this.currentTrack) {
            return;
        }

        const track = this.currentTrack;
        const artists = track.artists.map((a: any) => a.name).join(', ');
        
        // Create a MarkdownString tooltip with album artwork
        const tooltip = new vscode.MarkdownString();
        tooltip.supportHtml = true;
        tooltip.isTrusted = true;
        
        // Add album artwork and track details side by side using HTML
        if (track.album.images && track.album.images.length > 0) {
            const imageUrl = track.album.images[track.album.images.length - 1].url;
            tooltip.appendMarkdown(`<table><tr><td><img src="${imageUrl}" width="64" height="64"/></td><td><b>${track.name}</b><br/>by ${artists}<br/>from <i>${track.album.name}</i></td></tr></table>`);
        } else {
            // Fallback if no image available
            tooltip.appendMarkdown(`**${track.name}**\n\n`);
            tooltip.appendMarkdown(`by ${artists}\n\n`);
            tooltip.appendMarkdown(`from *${track.album.name}*`);
        }
        
        // Add progress bar with local progress
        const progress = Math.min(this.localProgressMs / this.durationMs, 1);
        const progressBarLength = 20;
        const filledLength = Math.round(progress * progressBarLength);
        const emptyLength = progressBarLength - filledLength;
        const progressBar = '▰'.repeat(filledLength) + '▱'.repeat(emptyLength);
        tooltip.appendMarkdown(`\n\n${progressBar}`);
        
        this.trackInfoItem.tooltip = tooltip;
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
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
        }
        if (this.updateDebounceTimer) {
            clearTimeout(this.updateDebounceTimer);
        }
        this.trackInfoItem.dispose();
        this.previousButton.dispose();
        this.playPauseButton.dispose();
        this.nextButton.dispose();
    }
}