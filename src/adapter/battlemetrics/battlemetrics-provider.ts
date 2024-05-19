import {PollingProvider} from "../polling-provider.js";
import {GameStatus} from "../../domain/game-status-provider.js";
import got from "got";

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
        const response = await got(`https://api.battlemetrics.com/servers/${this.serverId}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            }
        });
        const gameInfo: bmResponse = JSON.parse(response.body);

        return {
            playerCount: gameInfo.data.attributes.players,
            maxPlayers: gameInfo.data.attributes.maxPlayers,
            map: gameInfo.data.attributes.details?.map || '',
            name: gameInfo.data.attributes.name,
        } as GameStatus;
    }
}
