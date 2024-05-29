import {GameStatus} from '../../domain/game-status-provider.js';
import {PollingProvider} from '../polling-provider.js';

interface SteamGameInfo {
    response: SteamResponse;
}

interface SteamResponse {
    servers: SteamServer[];
}

interface SteamServer {
    max_players: number;
    players: number;
    name: string;
    map: string;
}

export class SteamProvider extends PollingProvider {
    constructor(private steamApiToken: string, private gameAddress: string) {
        super();
    }

    protected async retrieve(): Promise<GameStatus> {
        const response = await fetch(`https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${this.steamApiToken}&filter=\\addr\\${this.gameAddress}`);
        if (response.status !== 200) {
            throw new Error('unexpected response code, expected 200, got: ' + response.status);
        }
        const steamGameInfo: SteamGameInfo = await response.json() as SteamGameInfo;

        if (!steamGameInfo || !steamGameInfo.response || !steamGameInfo.response.servers || steamGameInfo.response.servers.length !== 1) {
            throw new Error('Steam did not respond with a single server. Returned servers: ' + steamGameInfo?.response?.servers?.length);
        }

        const server = steamGameInfo.response.servers[0];
        return {
            maxPlayers: server.max_players,
            playerCount: server.players,
            name: server.name,
            map: server.map,
        }
    }
}
