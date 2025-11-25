"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyAuth = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
class SpotifyAuth {
    constructor(context) {
        this.context = context;
        this.redirectUri = 'https://localhost:8080/callback';
        this.clientId = vscode.workspace.getConfiguration('spotify').get('clientId') || '';
    }
    async authenticate() {
        if (!this.clientId) {
            vscode.window.showErrorMessage('Please set Spotify Client ID in settings');
            return;
        }
        const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played';
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes)}`;
        vscode.env.openExternal(vscode.Uri.parse(authUrl));
        const code = await vscode.window.showInputBox({
            prompt: 'Enter the authorization code from the callback URL',
            placeHolder: 'Authorization code'
        });
        if (code) {
            await this.exchangeCodeForTokens(code);
        }
    }
    async exchangeCodeForTokens(code) {
        try {
            const response = await axios_1.default.post('https://accounts.spotify.com/api/token', new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.redirectUri,
                client_id: this.clientId
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            this.accessToken = response.data.access_token;
            this.refreshToken = response.data.refresh_token;
            if (this.accessToken) {
                await this.context.secrets.store('spotify.accessToken', this.accessToken);
            }
            if (this.refreshToken) {
                await this.context.secrets.store('spotify.refreshToken', this.refreshToken);
            }
            vscode.commands.executeCommand('setContext', 'spotify:authenticated', true);
            vscode.window.showInformationMessage('Successfully authenticated with Spotify!');
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to authenticate with Spotify');
        }
    }
    async tryAutoAuthenticate() {
        this.accessToken = await this.context.secrets.get('spotify.accessToken');
        this.refreshToken = await this.context.secrets.get('spotify.refreshToken');
        if (this.accessToken) {
            vscode.commands.executeCommand('setContext', 'spotify:authenticated', true);
        }
    }
    async getAccessToken() {
        if (!this.accessToken && this.refreshToken) {
            await this.refreshAccessToken();
        }
        return this.accessToken;
    }
    async refreshAccessToken() {
        if (!this.refreshToken)
            return;
        try {
            const response = await axios_1.default.post('https://accounts.spotify.com/api/token', new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken,
                client_id: this.clientId
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            this.accessToken = response.data.access_token;
            if (this.accessToken) {
                await this.context.secrets.store('spotify.accessToken', this.accessToken);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to refresh Spotify token');
        }
    }
}
exports.SpotifyAuth = SpotifyAuth;
//# sourceMappingURL=auth.js.map