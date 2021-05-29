import {GameStatus, GameStatusProvider} from '../../domain/game-status-provider';
import got from 'got';
import {from, Observable, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {PollingProvider} from '../polling-provider';

interface SteamGameInfo {
    response: SteamResponse;
}

interface SteamResponse {
    servers: SteamServer[];
}

interface SteamServer {
    max_players: number;
    players: number;
}

export class SteamProvider extends PollingProvider {
    constructor(private steamApiToken: string, private gameAddress: string) {
        super();
    }

    protected async retrieve(): Promise<GameStatus> {
        const response = await got(`https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${this.steamApiToken}&filter=\\addr\\${this.gameAddress}`)
        const steamGameInfo: SteamGameInfo = JSON.parse(response.body);

        if (steamGameInfo.response.servers.length !== 1) {
            throw new Error('Steam did not respond with a single server, aborting the game status extracting.');
        }

        return {
            maxPlayers: steamGameInfo.response.servers[0].max_players,
            playerCount: steamGameInfo.response.servers[0].players
        }
    }
}
