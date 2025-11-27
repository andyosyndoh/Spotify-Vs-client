import * as vscode from 'vscode';
import axios from 'axios';
import { SpotifyAuth } from './auth';

export interface Track {
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
}

export interface PlaybackState {
    is_playing: boolean;
    item: Track;
    progress_ms: number;
}

export class SpotifyAPI {
    private baseUrl = 'https://api.spotify.com/v1';

    constructor(private auth: SpotifyAuth) {}

    private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
        const token = await this.auth.getAccessToken();
        if (!token) {
            vscode.window.showErrorMessage('Please authenticate with Spotify first');
            return;
        }

        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: { Authorization: `Bearer ${token}` },
                data
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Authentication required');
            } else {
                vscode.window.showErrorMessage(`Spotify API error: ${error.message}`);
            }
            throw error;
        }
    }

    async getCurrentPlayback(): Promise<PlaybackState | undefined> {
        return this.makeRequest('/me/player');
    }

    async play(): Promise<void> {
        await this.makeRequest('/me/player/play', 'PUT');
        vscode.window.showInformationMessage('▶️ Playing');
    }

    async pause(): Promise<void> {
        await this.makeRequest('/me/player/pause', 'PUT');
        vscode.window.showInformationMessage('⏸️ Paused');
    }

    async next(): Promise<void> {
        await this.makeRequest('/me/player/next', 'POST');
        vscode.window.showInformationMessage('⏭️ Next track');
    }

    async previous(): Promise<void> {
        await this.makeRequest('/me/player/previous', 'POST');
        vscode.window.showInformationMessage('⏮️ Previous track');
    }

    async showCurrentTrack(): Promise<void> {
        const playback = await this.getCurrentPlayback();
        if (playback?.item) {
            const track = playback.item;
            const artists = track.artists.map(a => a.name).join(', ');
            vscode.window.showInformationMessage(`🎵 ${track.name} by ${artists} (${track.album.name})`);
        } else {
            vscode.window.showInformationMessage('No track currently playing');
        }
    }
}