import {DiscordPublisher} from './discord-publisher';
import {Client} from 'discord.js';
import DoneCallback = jest.DoneCallback;

describe('DiscordPublisher', () => {
    let client: Client;
    let publisher: DiscordPublisher;

    beforeEach((done: DoneCallback) => {
        client = new Client();
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
        })
    });
});
