"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const auth_1 = require("./auth");
const api_1 = require("./api");
const statusBar_1 = require("./statusBar");
const friends_1 = require("./friends");
let spotifyAuth;
let spotifyAPI;
let statusBarProvider;
let friendsProvider;
function activate(context) {
    spotifyAuth = new auth_1.SpotifyAuth(context);
    spotifyAPI = new api_1.SpotifyAPI(spotifyAuth);
    statusBarProvider = new statusBar_1.StatusBarProvider(spotifyAPI);
    friendsProvider = new friends_1.FriendsProvider(spotifyAPI);
    // Register commands
    const commands = [
        vscode.commands.registerCommand('spotify.authenticate', () => spotifyAuth.authenticate()),
        vscode.commands.registerCommand('spotify.play', () => spotifyAPI.play()),
        vscode.commands.registerCommand('spotify.pause', () => spotifyAPI.pause()),
        vscode.commands.registerCommand('spotify.next', () => spotifyAPI.next()),
        vscode.commands.registerCommand('spotify.previous', () => spotifyAPI.previous()),
        vscode.commands.registerCommand('spotify.showCurrentTrack', () => spotifyAPI.showCurrentTrack())
    ];
    // Register providers
    vscode.window.registerTreeDataProvider('spotifyFriends', friendsProvider);
    context.subscriptions.push(...commands, statusBarProvider, friendsProvider);
    // Auto-authenticate if tokens exist
    spotifyAuth.tryAutoAuthenticate();
}
exports.activate = activate;
function deactivate() {
    statusBarProvider?.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map