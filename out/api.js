"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyAPI = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
class SpotifyAPI {
    constructor(auth) {
        this.auth = auth;
        this.baseUrl = 'https://api.spotify.com/v1';
    }
    async makeRequest(endpoint, method = 'GET', data) {
        const token = await this.auth.getAccessToken();
        if (!token) {
            vscode.window.showErrorMessage('Please authenticate with Spotify first');
            return;
        }
        try {
            const response = await (0, axios_1.default)({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: { Authorization: `Bearer ${token}` },
                data
            });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                vscode.window.showErrorMessage('Spotify authentication expired. Please re-authenticate.');
            }
            else {
                vscode.window.showErrorMessage(`Spotify API error: ${error.message}`);
            }
        }
    }
    async getCurrentPlayback() {
        return this.makeRequest('/me/player');
    }
    async play() {
        await this.makeRequest('/me/player/play', 'PUT');
        vscode.window.showInformationMessage('▶️ Playing');
    }
    async pause() {
        await this.makeRequest('/me/player/pause', 'PUT');
        vscode.window.showInformationMessage('⏸️ Paused');
    }
    async next() {
        await this.makeRequest('/me/player/next', 'POST');
        vscode.window.showInformationMessage('⏭️ Next track');
    }
    async previous() {
        await this.makeRequest('/me/player/previous', 'POST');
        vscode.window.showInformationMessage('⏮️ Previous track');
    }
    async showCurrentTrack() {
        const playback = await this.getCurrentPlayback();
        if (playback?.item) {
            const track = playback.item;
            const artists = track.artists.map(a => a.name).join(', ');
            vscode.window.showInformationMessage(`🎵 ${track.name} by ${artists} (${track.album.name})`);
        }
        else {
            vscode.window.showInformationMessage('No track currently playing');
        }
    }
}
exports.SpotifyAPI = SpotifyAPI;
//# sourceMappingURL=api.js.map