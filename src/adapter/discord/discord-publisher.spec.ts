import {DiscordPublisher} from './discord-publisher';
import {Client, ClientOptions} from 'discord.js';
import DoneCallback = jest.DoneCallback;
import {config} from 'dotenv';
import {GameStatus} from '../../domain/game-status-provider';

config();

describe('DiscordPublisher', () => {
    let client: Client;
    let publisher: DiscordPublisher;

    beforeEach((done: DoneCallback) => {
        client = new Client({} as ClientOptions);
        client.on('ready', () => {
            done();
        });
        client.login(process.env.DISCORD_TOKEN || '');

        publisher = new DiscordPublisher(client);
    });

    afterEach(() => {
        client.destroy();
    });

    it('sets new status to discord bot', async () => {
        await publisher.publish({playerCount: 5, maxPlayers: 40});

        expect(await publisher.currentStatus()).toEqual({
            playerCount: 5, maxPlayers: 40
        });
    });

    it('handles queued players if present', async () => {
        await publisher.publish({playerCount: 5, maxPlayers: 40, queuedPlayers: 2});

        expect(await publisher.currentStatus()).toEqual({
            playerCount: 5, maxPlayers: 40, queuedPlayers: 2
        } as GameStatus);
    });

    it('goes offline when null GameStatus provided', async () => {
        await publisher.publish(undefined);

        expect(await publisher.currentStatus()).toBeUndefined();
    });
});
