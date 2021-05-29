import {GameStatus} from '../../domain/game-status-provider';
import {CFToolsClient, Game} from 'cftools-sdk';
import {PollingProvider} from '../polling-provider';

export class CFToolsProvider extends PollingProvider {
    constructor(private client: CFToolsClient, private hostname: string, private port: number) {
        super();
    }

    protected async retrieve(): Promise<GameStatus> {
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
}
