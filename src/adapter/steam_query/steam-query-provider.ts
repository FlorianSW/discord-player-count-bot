import {GameStatus, GameStatusProvider} from '../../domain/game-status-provider';
import got from 'got';
import {from, Observable, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {PollingProvider} from '../polling-provider';
import {query, Type} from 'gamedig';

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
        } as GameStatus;
    }
}
