"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsProvider = void 0;
const vscode = require("vscode");
class FriendsProvider {
    constructor(spotifyAPI) {
        this.spotifyAPI = spotifyAPI;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.friends = [];
        this.startRefresh();
    }
    startRefresh() {
        this.refresh();
        this.refreshTimer = setInterval(() => {
            this.refresh();
        }, 10000); // Refresh every 10 seconds
    }
    refresh() {
        // Note: Spotify Web API doesn't provide friends' activity directly
        // This would require additional implementation with Spotify's Social API
        // For now, this is a placeholder structure
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        const item = new vscode.TreeItem(element.display_name, vscode.TreeItemCollapsibleState.None);
        if (element.currently_playing) {
            const track = element.currently_playing.track;
            const artists = track.artists.map(a => a.name).join(', ');
            item.description = `🎵 ${track.name} - ${artists}`;
            item.tooltip = `${element.display_name} is listening to ${track.name} by ${artists}`;
        }
        else {
            item.description = 'Not listening';
            item.tooltip = `${element.display_name} is not currently listening to music`;
        }
        return item;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.friends);
        }
        return Promise.resolve([]);
    }
    dispose() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this._onDidChangeTreeData.dispose();
    }
}
exports.FriendsProvider = FriendsProvider;
//# sourceMappingURL=friends.js.map