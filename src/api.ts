import * as vscode from 'vscode';
import axios from 'axios';
import { SpotifyAuth } from './auth';

export interface Track {
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
    duration_ms: number;
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
                data,
                validateStatus: (status) => {
                    // Accept all status codes and handle them manually
                    return status < 600;
                }
            });

            // Handle different status codes
            if (response.status === 401) {
                // Token expired - try to refresh it
                console.log('Token expired, attempting to refresh...');
                try {
                    await this.auth.forceRefreshToken();
                    // Retry the request with the new token
                    const newToken = await this.auth.getAccessToken();
                    if (newToken) {
                        const retryResponse = await axios({
                            method,
                            url: `${this.baseUrl}${endpoint}`,
                            headers: { Authorization: `Bearer ${newToken}` },
                            data,
                            validateStatus: (status) => status < 600
                        });
                        
                        if (retryResponse.status === 204) return undefined;
                        if (retryResponse.status >= 400) {
                            throw new Error(`Spotify API error: ${retryResponse.statusText}`);
                        }
                        return retryResponse.data;
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    throw new Error('Authentication required');
                }
            } else if (response.status === 204) {
                // No Content - successful operation (play, pause, next, previous)
                return undefined;
            } else if (response.status === 404) {
                throw new Error('No active playback device found. Please start Spotify on a device first.');
            } else if (response.status === 403) {
                throw new Error('This action requires Spotify Premium.');
            } else if (response.status === 429) {
                throw new Error('Rate limited. Please wait a moment and try again.');
            } else if (response.status >= 400) {
                const errorMsg = response.data?.error?.message || response.statusText || 'Unknown error';
                throw new Error(`Spotify API error: ${errorMsg}`);
            }

            return response.data;
        } catch (error: any) {
            if (error.message) {
                // Re-throw our custom errors
                throw error;
            }
            
            // Handle network errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new Error('Network error. Please check your connection.');
            }
            
            console.error('Spotify API error:', error);
            throw new Error('Failed to communicate with Spotify. Please try again.');
        }
    }

    async getCurrentPlayback(): Promise<PlaybackState | undefined> {
        return this.makeRequest('/me/player');
    }

    async play(): Promise<void> {
        try {
            await this.makeRequest('/me/player/play', 'PUT');
            // Small delay to let Spotify process the command
            await new Promise(resolve => setTimeout(resolve, 300));
            vscode.window.showInformationMessage('▶️ Playing');
        } catch (error: any) {
            vscode.window.showErrorMessage(`Play failed: ${error.message}`);
            throw error;
        }
    }

    async pause(): Promise<void> {
        try {
            await this.makeRequest('/me/player/pause', 'PUT');
            await new Promise(resolve => setTimeout(resolve, 300));
            vscode.window.showInformationMessage('⏸️ Paused');
        } catch (error: any) {
            vscode.window.showErrorMessage(`Pause failed: ${error.message}`);
            throw error;
        }
    }

    async next(): Promise<void> {
        try {
            await this.makeRequest('/me/player/next', 'POST');
            await new Promise(resolve => setTimeout(resolve, 500));
            vscode.window.showInformationMessage('⏭️ Next track');
        } catch (error: any) {
            vscode.window.showErrorMessage(`Next failed: ${error.message}`);
            throw error;
        }
    }

    async previous(): Promise<void> {
        try {
            await this.makeRequest('/me/player/previous', 'POST');
            await new Promise(resolve => setTimeout(resolve, 500));
            vscode.window.showInformationMessage('⏮️ Previous track');
        } catch (error: any) {
            vscode.window.showErrorMessage(`Previous failed: ${error.message}`);
            throw error;
        }
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