import {GameStatusPublisher} from '../domain/game-status-publisher';
import {GameStatus} from '../domain/game-status-provider';
import {Client} from 'discord.js';

export class DiscordPublisher implements GameStatusPublisher {
    constructor(private client: Client) {
    }

    async publish(status: GameStatus | undefined): Promise<void> {
        if (status === undefined) {
            await this.client.user?.setStatus('dnd');
        } else {
            await this.client.user?.setPresence({
                status: 'online',
                activity: {
                    type: 'PLAYING',
                    name: status.playerCount + '/' + status.maxPlayers
                }
            });
        }
    }

    async currentStatus(): Promise<GameStatus | undefined> {
        if (this.client.user?.presence.status !== 'online' || this.client.user?.presence.activities.length !== 1) {
            return undefined;
        }
        const status = this.client.user?.presence.activities[0].name.split('/')
        if (status.length !== 2) {
            return undefined;
        }
        return {
            playerCount: parseInt(status[0]),
            maxPlayers: parseInt(status[1])
        }
    }
}
