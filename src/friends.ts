import * as vscode from 'vscode';
import { SpotifyAPI } from './api';

interface Friend {
    id: string;
    display_name: string;
    currently_playing?: {
        track: {
            name: string;
            artists: { name: string }[];
        };
    };
}

export class FriendsProvider implements vscode.TreeDataProvider<Friend>, vscode.Disposable {
    private _onDidChangeTreeData = new vscode.EventEmitter<Friend | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    
    private friends: Friend[] = [];
    private refreshTimer?: NodeJS.Timeout;

    constructor(private spotifyAPI: SpotifyAPI) {
        this.startRefresh();
    }

    private startRefresh(): void {
        this.refresh();
        this.refreshTimer = setInterval(() => {
            this.refresh();
        }, 10000); // Refresh every 10 seconds
    }

    refresh(): void {
        // Note: Spotify Web API doesn't provide friends' activity directly
        // This would require additional implementation with Spotify's Social API
        // For now, this is a placeholder structure
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Friend): vscode.TreeItem {
        const item = new vscode.TreeItem(element.display_name, vscode.TreeItemCollapsibleState.None);
        
        if (element.currently_playing) {
            const track = element.currently_playing.track;
            const artists = track.artists.map(a => a.name).join(', ');
            item.description = `🎵 ${track.name} - ${artists}`;
            item.tooltip = `${element.display_name} is listening to ${track.name} by ${artists}`;
        } else {
            item.description = 'Not listening';
            item.tooltip = `${element.display_name} is not currently listening to music`;
        }

        return item;
    }

    getChildren(element?: Friend): Thenable<Friend[]> {
        if (!element) {
            return Promise.resolve(this.friends);
        }
        return Promise.resolve([]);
    }

    dispose(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this._onDidChangeTreeData.dispose();
    }
}