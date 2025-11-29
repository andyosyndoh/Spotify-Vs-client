import * as vscode from 'vscode';
import axios from 'axios';
import * as http from 'http';
import { URL } from 'url';
import * as crypto from 'crypto';

export class SpotifyAuth {
    private accessToken?: string;
    private refreshToken?: string;
    // Hardcoded Client ID - users don't need to configure anything!
    private readonly clientId = 'YOUR_SPOTIFY_CLIENT_ID_HERE'; // Replace with your actual Client ID
    private readonly redirectUri = 'http://127.0.0.1:8080/callback';
    private server?: http.Server;
    private codeVerifier?: string;

    constructor(private context: vscode.ExtensionContext) {}

    // PKCE helper functions
    private generateRandomString(length: number): string {
        return crypto.randomBytes(length).toString('base64url').slice(0, length);
    }

    private base64URLEncode(str: Buffer): string {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    private sha256(buffer: string): Buffer {
        return crypto.createHash('sha256').update(buffer).digest();
    }

    async authenticate(): Promise<void> {
        // Generate PKCE code verifier and challenge
        this.codeVerifier = this.generateRandomString(64);
        const codeChallenge = this.base64URLEncode(this.sha256(this.codeVerifier));

        return new Promise((resolve, reject) => {
            this.server = http.createServer(async (req, res) => {
                const url = new URL(req.url!, `http://${req.headers.host}`);
                const code = url.searchParams.get('code');
                
                if (code) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1DB954; }
                                .container { text-align: center; color: white; }
                                h1 { font-size: 2em; margin-bottom: 10px; }
                                p { font-size: 1.2em; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>✅ Authentication Successful!</h1>
                                <p>You can close this window and return to VS Code.</p>
                            </div>
                        </body>
                        </html>
                    `);
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
                    res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f44336; }
                                .container { text-align: center; color: white; }
                                h1 { font-size: 2em; margin-bottom: 10px; }
                                p { font-size: 1.2em; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>❌ Authentication Failed</h1>
                                <p>Please try again from VS Code.</p>
                            </div>
                        </body>
                        </html>
                    `);
                    this.server?.close();
                    reject(new Error('No authorization code received'));
                }
            });

            this.server.listen(8080, '127.0.0.1', () => {
                const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played';
                const authUrl = `https://accounts.spotify.com/authorize?` +
                    `client_id=${this.clientId}` +
                    `&response_type=code` +
                    `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
                    `&scope=${encodeURIComponent(scopes)}` +
                    `&code_challenge_method=S256` +
                    `&code_challenge=${codeChallenge}`;
                
                vscode.window.showInformationMessage('Opening browser for Spotify authentication...');
                vscode.env.openExternal(vscode.Uri.parse(authUrl));
            });
        });
    }

    private async exchangeCodeForTokens(code: string): Promise<void> {
        if (!this.codeVerifier) {
            throw new Error('Code verifier not found');
        }

        try {
            const response = await axios.post('https://accounts.spotify.com/api/token', 
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: this.redirectUri,
                    client_id: this.clientId,
                    code_verifier: this.codeVerifier
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
            
            // Clear the code verifier
            this.codeVerifier = undefined;
            
            vscode.commands.executeCommand('setContext', 'spotify:authenticated', true);
            vscode.window.showInformationMessage('🎵 Successfully connected to Spotify!');
        } catch (error: any) {
            throw new Error(error.response?.data?.error_description || error.message);
        }
    }

    async tryAutoAuthenticate(): Promise<void> {
        this.accessToken = await this.context.secrets.get('spotify.accessToken');
        this.refreshToken = await this.context.secrets.get('spotify.refreshToken');
        
        if (this.accessToken || this.refreshToken) {
            vscode.commands.executeCommand('setContext', 'spotify:authenticated', true);
        }
    }

    async hasValidTokens(): Promise<boolean> {
        if (!this.accessToken && !this.refreshToken) {
            this.accessToken = await this.context.secrets.get('spotify.accessToken');
            this.refreshToken = await this.context.secrets.get('spotify.refreshToken');
        }
        return !!(this.accessToken || this.refreshToken);
    }

    async getAccessToken(): Promise<string | undefined> {
        // Load tokens from storage if not in memory
        if (!this.accessToken && !this.refreshToken) {
            this.accessToken = await this.context.secrets.get('spotify.accessToken');
            this.refreshToken = await this.context.secrets.get('spotify.refreshToken');
        }
        
        // If no access token but have refresh token, try to refresh
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
            // Update refresh token if a new one is provided
            if (response.data.refresh_token) {
                this.refreshToken = response.data.refresh_token;
                if (this.refreshToken) {
                    await this.context.secrets.store('spotify.refreshToken', this.refreshToken);
                }
            }
            
            if (this.accessToken) {
                await this.context.secrets.store('spotify.accessToken', this.accessToken);
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            // Clear tokens on refresh failure
            this.accessToken = undefined;
            this.refreshToken = undefined;
            throw new Error('Authentication required');
        }
    }
}