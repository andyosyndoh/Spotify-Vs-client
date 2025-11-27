import * as vscode from 'vscode';
import axios from 'axios';
import * as http from 'http';
import { URL } from 'url';

export class SpotifyAuth {
    private accessToken?: string;
    private refreshToken?: string;
    private clientId: string;
    private redirectUri = 'http://127.0.0.1:8080/callback';
    private server?: http.Server;

    constructor(private context: vscode.ExtensionContext) {
        this.clientId = vscode.workspace.getConfiguration('spotify').get('clientId') || '';
    }

    private getClientSecret(): string {
        return vscode.workspace.getConfiguration('spotify').get('clientSecret') || '';
    }

    async authenticate(): Promise<void> {
        if (!this.clientId) {
            vscode.window.showErrorMessage('Please set Spotify Client ID in settings');
            return;
        }

        return new Promise((resolve, reject) => {
            this.server = http.createServer(async (req, res) => {
                const url = new URL(req.url!, `http://${req.headers.host}`);
                const code = url.searchParams.get('code');
                

                
                if (code) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<h1>Authentication successful!</h1><p>You can close this window.</p>');
                    this.server?.close();
                    
                    try {
                        await this.exchangeCodeForTokens(code);
                        resolve();
                    } catch (error) {
                        console.error('Token exchange error:', error);
                        vscode.window.showErrorMessage(`Authentication failed: ${error}`);
                        reject(error);
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<h1>Authentication failed</h1>');
                    this.server?.close();
                    reject(new Error('No authorization code received'));
                }
            });

            this.server.listen(8080, '127.0.0.1', () => {
                const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played';
                const authUrl = `https://accounts.spotify.com/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes)}`;
                vscode.env.openExternal(vscode.Uri.parse(authUrl));
            });
        });
    }

    private async exchangeCodeForTokens(code: string): Promise<void> {

        
        try {
            const clientSecret = this.getClientSecret();
            if (!clientSecret) {
                throw new Error('Client secret not configured. Please set spotify.clientSecret in settings.');
            }

            const response = await axios.post('https://accounts.spotify.com/api/token', 
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: this.redirectUri,
                    client_id: this.clientId,
                    client_secret: clientSecret
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
        } catch (error: any) {
            throw new Error(error.response?.data?.error_description || error.message);
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
            const clientSecret = this.getClientSecret();
            const response = await axios.post('https://accounts.spotify.com/api/token',
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken,
                    client_id: this.clientId,
                    client_secret: clientSecret
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