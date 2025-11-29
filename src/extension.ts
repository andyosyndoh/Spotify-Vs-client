import * as vscode from 'vscode';
import { SpotifyAuth } from './auth';
import { SpotifyAPI } from './api';
import { StatusBarProvider } from './statusBar';
import { FriendsProvider } from './friends';

let spotifyAuth: SpotifyAuth;
let spotifyAPI: SpotifyAPI;
let statusBarProvider: StatusBarProvider;
let friendsProvider: FriendsProvider;

export function activate(context: vscode.ExtensionContext) {
    spotifyAuth = new SpotifyAuth(context);
    spotifyAPI = new SpotifyAPI(spotifyAuth);
    statusBarProvider = new StatusBarProvider(spotifyAPI, spotifyAuth);
    friendsProvider = new FriendsProvider(spotifyAPI);

    // Register commands
    const commands = [
        vscode.commands.registerCommand('spotify.authenticate', async () => {
            console.log('Spotify authenticate command triggered');
            try {
                await spotifyAuth.authenticate();
            } catch (error) {
                console.error('Authentication error:', error);
                vscode.window.showErrorMessage(`Authentication failed: ${error}`);
            }
        }),
        vscode.commands.registerCommand('spotify.play', () => spotifyAPI.play()),
        vscode.commands.registerCommand('spotify.pause', () => spotifyAPI.pause()),
        vscode.commands.registerCommand('spotify.next', () => spotifyAPI.next()),
        vscode.commands.registerCommand('spotify.previous', () => spotifyAPI.previous()),
        vscode.commands.registerCommand('spotify.showCurrentTrack', () => spotifyAPI.showCurrentTrack()),
        vscode.commands.registerCommand('spotify.checkConfig', () => {
            const clientId = vscode.workspace.getConfiguration('spotify').get('clientId');
            const clientSecret = vscode.workspace.getConfiguration('spotify').get('clientSecret');
            vscode.window.showInformationMessage(
                `Client ID: ${clientId ? 'Set ✓' : 'Not set ✗'}\n` +
                `Client Secret: ${clientSecret ? 'Set ✓' : 'Not set ✗'}`
            );
        })
    ];

    // Register providers
    vscode.window.registerTreeDataProvider('spotifyFriends', friendsProvider);

    context.subscriptions.push(...commands, statusBarProvider, friendsProvider);

    // Auto-authenticate if tokens exist
    spotifyAuth.tryAutoAuthenticate();
}

export function deactivate() {
    statusBarProvider?.dispose();
}