import {GameStatus} from '../../domain/game-status-provider.js';
import {CFToolsClient, Game} from 'cftools-sdk';
import {PollingProvider} from '../polling-provider.js';

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
            name: details.name,
            maxPlayers: details.status.players.slots,
            playerCount: details.status.players.online,
            queuedPlayers: details.status.players.queue,
            map: details.map,
        };
    }
}
