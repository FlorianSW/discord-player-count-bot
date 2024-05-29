import {PollingProvider} from "../polling-provider.js";
import {GameStatus} from "../../domain/game-status-provider.js";

interface bmResponse {
    data: {
        attributes: {
            players: number,
            maxPlayers: number,
            name: string,
            details?: {
                map?: string,
            }
        }
    }
}

export class BattlemetricsProvider extends PollingProvider {
    constructor(private readonly accessToken: string, private serverId: string) {
        super();
    }

    protected async retrieve(): Promise<GameStatus> {
        const response = await fetch(`https://api.battlemetrics.com/servers/${this.serverId}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            }
        });
        if (response.status !== 200) {
            throw new Error('unexpected response code, expected 200, got: ' + response.status);
        }
        const gameInfo: bmResponse = await response.json() as bmResponse;

        return {
            playerCount: gameInfo.data.attributes.players,
            maxPlayers: gameInfo.data.attributes.maxPlayers,
            map: gameInfo.data.attributes.details?.map || '',
            name: gameInfo.data.attributes.name,
        } as GameStatus;
    }
}
