import * as vscode from 'vscode';
import axios from 'axios';
import { SpotifyAuth } from './auth';
import * as dns from 'dns';
import * as http from 'http';
import * as https from 'https';

// Force IPv4 to avoid IPv6 timeout issues
dns.setDefaultResultOrder('ipv4first');

// Create HTTP/HTTPS agents with IPv4 family and keep-alive
const httpAgent = new http.Agent({ 
    keepAlive: true,
    family: 4  // Force IPv4
});
const httpsAgent = new https.Agent({ 
    keepAlive: true,
    family: 4  // Force IPv4
});

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
                timeout: 10000, // 10 second timeout instead of default
                httpAgent: httpAgent,
                httpsAgent: httpsAgent,
                family: 4, // Force IPv4 at axios level too
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
                const errorMsg = response.data?.error?.message || 'No active device';
                // Don't throw for 404, just log it - the status bar update will show the real state
                console.log('404 - No active device:', errorMsg);
                throw new Error('No active Spotify device. Please start playing music on Spotify first.');
            } else if (response.status === 403) {
                // Check if it's a player command restriction
                const reason = response.data?.error?.reason;
                if (reason === 'PREMIUM_REQUIRED') {
                    throw new Error('This action requires Spotify Premium.');
                }
                // Some 403s are just warnings (e.g., already paused/playing), don't throw
                console.log('403 response (non-critical):', response.data?.error?.message);
                return undefined;
            } else if (response.status === 429) {
                throw new Error('Rate limited. Please wait a moment and try again.');
            } else if (response.status >= 400) {
                const errorMsg = response.data?.error?.message || response.statusText || 'Unknown error';
                throw new Error(`Spotify API error: ${errorMsg}`);
            }

            return response.data;
        } catch (error: any) {
            // Axios doesn't throw when validateStatus returns true, so we shouldn't reach here
            // unless there's a network error or our code threw an error
            
            // Log full error for debugging
            console.error('makeRequest caught error:', JSON.stringify({
                message: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data
            }));
            
            // If this is our own thrown error (from above status code handling), re-throw it
            if (error.message && !error.response && !error.code) {
                throw error;
            }
            
            // Handle network errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new Error('Network error. Please check your connection.');
            }
            
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                throw new Error('Spotify request timed out. Please check your internet connection.');
            }
            
            // This shouldn't happen but handle it gracefully
            throw new Error(`Unexpected error: ${error.message || JSON.stringify(error)}`);
        }
    }

    async getCurrentPlayback(): Promise<PlaybackState | undefined> {
        return this.makeRequest('/me/player');
    }

    async play(): Promise<void> {
        try {
            await this.makeRequest('/me/player/play', 'PUT');
        } catch (error: any) {
            // Silently ignore timeout errors - they happen, no need to spam
            if (error.message?.includes('timed out')) {
                return;
            }
            // Only show error if it's not a 403 (which we handle silently)
            if (!error.message?.includes('403')) {
                console.error('Play error:', error.message || error);
            }
        } finally {
            // Always update UI regardless of success/failure
            setTimeout(() => vscode.commands.executeCommand('spotify.forceUpdate'), 500);
        }
    }

    async pause(): Promise<void> {
        try {
            await this.makeRequest('/me/player/pause', 'PUT');
        } catch (error: any) {
            if (error.message?.includes('timed out')) {
                return;
            }
            if (!error.message?.includes('403')) {
                console.error('Pause error:', error.message || error);
            }
        } finally {
            // Always update UI regardless of success/failure
            setTimeout(() => vscode.commands.executeCommand('spotify.forceUpdate'), 500);
        }
    }

    async next(): Promise<void> {
        try {
            await this.makeRequest('/me/player/next', 'POST');
        } catch (error: any) {
            if (error.message?.includes('timed out')) {
                return;
            }
            if (!error.message?.includes('403')) {
                console.error('Next error:', error.message || error);
            }
        } finally {
            // Always update UI regardless of success/failure
            setTimeout(() => vscode.commands.executeCommand('spotify.forceUpdate'), 500);
        }
    }

    async previous(): Promise<void> {
        try {
            await this.makeRequest('/me/player/previous', 'POST');
        } catch (error: any) {
            if (error.message?.includes('timed out')) {
                return;
            }
            if (!error.message?.includes('403')) {
                console.error('Previous error:', error.message || error);
            }
        } finally {
            // Always update UI regardless of success/failure
            setTimeout(() => vscode.commands.executeCommand('spotify.forceUpdate'), 500);
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