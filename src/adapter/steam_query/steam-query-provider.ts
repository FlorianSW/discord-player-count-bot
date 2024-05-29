import {GameStatus} from '../../domain/game-status-provider.js';
import {PollingProvider} from '../polling-provider.js';
import {GameDig, QueryOptions} from "gamedig";

export class SteamQueryProvider extends PollingProvider {
    constructor(private gameType: QueryOptions['type'], private gameIp: string, private gameQueryPort: number) {
        super();
    }

    protected async retrieve(): Promise<GameStatus> {
        const result = await GameDig.query({
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
