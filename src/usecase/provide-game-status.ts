import {GameStatusProvider} from '../domain/game-status-provider';
import {GameStatusPublisher} from '../domain/game-status-publisher';

export class ProvideGameStatus {
    constructor(private provider: GameStatusProvider, private publisher: GameStatusPublisher) {
    }

    async provide() {
        await this.publisher.publish(await this.provider.retrieve());
    }
}
