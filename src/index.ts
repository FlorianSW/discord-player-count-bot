import {ProvideGameStatus} from './usecase/provide-game-status';
import {SteamProvider} from './adapter/steam-provider';
import {Client} from 'discord.js';
import {DiscordPublisher} from './adapter/discord-publisher';
import {Subscription} from 'rxjs';
import { config } from "dotenv"

config();

class App {
    private client: Client | undefined;
    private useCase: ProvideGameStatus | undefined;
    private updateSubscription: Subscription | undefined;

    public async setup() {
        if (!process.env.STEAM_API_TOKEN) {
            throw new Error('STEAM_API_TOKEN needs to be set!');
        }
        if (!process.env.GAME_ADDRESS) {
            throw new Error('GAME_ADDRESS needs to be set!');
        }
        const provider = new SteamProvider(process.env.STEAM_API_TOKEN, process.env.GAME_ADDRESS);
        this.client = await this.createDiscordClient();
        try {
            const publisher = new DiscordPublisher(this.client);
            this.useCase = new ProvideGameStatus(provider, publisher);
        } catch (e) {
            this.client?.destroy();
            throw e;
        }
    }

    public shutdown() {
        this.client?.destroy();
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }

    public async start() {
        this.updateSubscription = this.useCase?.provide();
    }

    private createDiscordClient(): Promise<Client> {
        return new Promise((resolve, reject) => {
            const client = new Client();
            client.on('ready', () => {
                console.log(`Logged in as ${client.user?.tag}!`);
                resolve(client);
            });
            client.on('error', (error) => {
                console.log(error);
                reject(error);
            });
            client.on('warn', console.log);

            client.login(process.env.DISCORD_TOKEN || '');
        });
    }
}

console.log('Starting Discord Bot...');
const app = new App();
app.setup().then(async () => {
    console.log('App setup done...');

    await app.start();
}, (e) => {
    console.log('Error starting the bot', e);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('App is shutting down on user event');
    app.shutdown();
    process.exit(0);
});
