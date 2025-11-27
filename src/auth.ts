import * as vscode from 'vscode';
import axios from 'axios';

export class SpotifyAuth {
    private accessToken?: string;
    private refreshToken?: string;
    private clientId: string;
    private redirectUri = 'http://127.0.0.1:5500/test/spot.html';

    constructor(private context: vscode.ExtensionContext) {
        this.clientId = vscode.workspace.getConfiguration('spotify').get('clientId') || '';
    }

    async authenticate(): Promise<void> {
        if (!this.clientId) {
            vscode.window.showErrorMessage('Please set Spotify Client ID in settings');
            return;
        }

        const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played';
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes)}`;

        vscode.env.openExternal(vscode.Uri.parse(authUrl));
        
        const code = await vscode.window.showInputBox({
            prompt: 'After authorizing, copy the "code" parameter from the URL and paste it here',
            placeHolder: 'Authorization code from callback URL'
        });

        if (code) {
            await this.exchangeCodeForTokens(code);
        }
    }

    private async exchangeCodeForTokens(code: string): Promise<void> {
        try {
            const response = await axios.post('https://accounts.spotify.com/api/token', 
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: this.redirectUri,
                    client_id: this.clientId
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

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
        } catch (error) {
            vscode.window.showErrorMessage('Failed to authenticate with Spotify');
        }
    }

    async tryAutoAuthenticate(): Promise<void> {
        this.accessToken = await this.context.secrets.get('spotify.accessToken');
        this.refreshToken = await this.context.secrets.get('spotify.refreshToken');
        
        if (this.accessToken) {
            vscode.commands.executeCommand('setContext', 'spotify:authenticated', true);
        }
    }

    async getAccessToken(): Promise<string | undefined> {
        if (!this.accessToken && this.refreshToken) {
            await this.refreshAccessToken();
        }
        return this.accessToken;
    }

    private async refreshAccessToken(): Promise<void> {
        if (!this.refreshToken) return;

        try {
            const response = await axios.post('https://accounts.spotify.com/api/token',
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken,
                    client_id: this.clientId
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            this.accessToken = response.data.access_token;
            if (this.accessToken) {
                await this.context.secrets.store('spotify.accessToken', this.accessToken);
            }
        } catch (error) {
            vscode.window.showErrorMessage('Failed to refresh Spotify token');
        }
    }
}