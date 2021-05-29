import {GameStatus, GameStatusProvider} from '../../domain/game-status-provider';
import {from, Observable, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {CFToolsClient, Game} from 'cftools-sdk';

export class CFToolsProvider implements GameStatusProvider {
    constructor(private client: CFToolsClient, private hostname: string, private port: number, private interval: number = 10000) {
    }

    private async retrieve(): Promise<GameStatus> {
        const details = await this.client.getGameServerDetails({
            game: Game.DayZ,
            ip: this.hostname,
            port: this.port,
        });
        return {
            maxPlayers: details.status.players.slots,
            playerCount: details.status.players.online,
            queuedPlayers: details.status.players.queue,
        };
    }

    provide(): Observable<GameStatus> {
        return timer(0, this.interval).pipe(switchMap(() => from(this.retrieve())))
    }
}
