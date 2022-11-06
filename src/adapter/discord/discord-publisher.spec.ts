import {DiscordPublisher} from './discord-publisher.js';
import {Client, ClientOptions} from 'discord.js';
import DoneCallback = jest.DoneCallback;
import {config} from 'dotenv';
import {GameStatus} from '../../domain/game-status-provider.js';
import {GameMap, MapsRepository} from '../../domain/maps-repository.js';

config();

describe('DiscordPublisher', () => {
    let client: Client;
    let publisher: DiscordPublisher;

    beforeEach((done: DoneCallback) => {
        client = new Client({intents: 0} as ClientOptions);
        client.on('ready', () => {
            done();
        });
        client.login(process.env.DISCORD_TOKEN || '');

        publisher = new DiscordPublisher(client, new NoOpMapsRepository());
    });

    afterEach(() => {
        client.destroy();
    });

    it('sets new status to discord bot', async () => {
        await publisher.publish({playerCount: 5, maxPlayers: 40, name: null, map: null});

        expect(await publisher.currentStatus()).toEqual({
            playerCount: 5, maxPlayers: 40
        });
    });

    it('handles queued players if present', async () => {
        await publisher.publish({playerCount: 5, maxPlayers: 40, queuedPlayers: 2, name: null, map: null});

        expect(await publisher.currentStatus()).toEqual({
            playerCount: 5, maxPlayers: 40, queuedPlayers: 2
        } as GameStatus);
    });

    it('goes offline when null GameStatus provided', async () => {
        await publisher.publish(undefined);

        expect(await publisher.currentStatus()).toBeUndefined();
    });
});

class NoOpMapsRepository implements MapsRepository {
    find(name: string): GameMap | undefined {
        return undefined;
    }
}
