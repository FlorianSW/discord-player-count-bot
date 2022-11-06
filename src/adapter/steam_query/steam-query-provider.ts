import {GameStatus} from '../../domain/game-status-provider.js';
import {PollingProvider} from '../polling-provider.js';
import gamedig from 'gamedig';
import {Type} from 'gamedig';

const {query} = gamedig;

export class SteamQueryProvider extends PollingProvider {
    constructor(private gameType: Type, private gameIp: string, private gameQueryPort: number) {
        super();
    }

    protected async retrieve(): Promise<GameStatus> {
        const result = await query({
            type: this.gameType,
            host: this.gameIp,
            port: this.gameQueryPort,
        });

        return {
            playerCount: result.players.length,
            maxPlayers: result.maxplayers,
            map: result.map,
            name: result.name,
        } as GameStatus;
    }
}
