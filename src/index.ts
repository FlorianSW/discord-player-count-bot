import {ProvideGameStatus} from './usecase/provide-game-status.js';
import {Client} from 'discord.js';
import {DiscordPublisher} from './adapter/discord/discord-publisher.js';
import {Subscription} from 'rxjs';
import {config} from 'dotenv'
import {GameStatusProvider} from './domain/game-status-provider.js';
import {providerFactory} from './factories.js';
import {FileBackedMapRepository} from './adapter/file-backed-map-repository.js';

config();

export interface ProviderFactory {
    build(): GameStatusProvider
}

class App {
    private client: Client | undefined;
    private useCase: ProvideGameStatus | undefined;
    private updateSubscription: Subscription | undefined;

    public async setup() {
        this.client = await this.createDiscordClient();
        try {
            const publisher = new DiscordPublisher(this.client, new FileBackedMapRepository());
            this.useCase = new ProvideGameStatus(providerFactory().build(), publisher);
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
            const client = new Client({intents: 0});
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
