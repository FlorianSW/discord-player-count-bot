import {GameStatusPublisher} from '../../domain/game-status-publisher';
import {GameStatus} from '../../domain/game-status-provider';
import {Client} from 'discord.js';
import {max, sample} from 'rxjs/operators';

export class DiscordPublisher implements GameStatusPublisher {
    constructor(private client: Client) {
    }

    async publish(status: GameStatus | undefined): Promise<void> {
        if (status === undefined) {
            await this.client.user?.setStatus('dnd');
        } else {
            let name = status.playerCount + '/' + status.maxPlayers;
            if (status.queuedPlayers) {
                name = `${name} (+${status.queuedPlayers})`;
            }
            await this.client.user?.setPresence({
                status: 'online',
                activity: {
                    type: 'PLAYING',
                    name: name
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
        const secondSection = status[1].split(' ');
        const maxPlayers = parseInt(secondSection[0]);
        let queuedPlayers: number | undefined = undefined;
        if (secondSection.length === 2) {
            queuedPlayers = parseInt(secondSection[1]
                .replace('(', '')
                .replace('+', '')
                .replace(')', ''));
        }
        return {
            playerCount: parseInt(status[0]),
            maxPlayers: maxPlayers,
            queuedPlayers: queuedPlayers,
        }
    }
}
