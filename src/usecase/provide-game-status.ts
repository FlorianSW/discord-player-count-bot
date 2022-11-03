import {GameStatus, GameStatusProvider} from '../domain/game-status-provider.js';
import {GameStatusPublisher} from '../domain/game-status-publisher.js';
import {Subscription} from 'rxjs';

export class ProvideGameStatus {
    constructor(private provider: GameStatusProvider, private publisher: GameStatusPublisher) {
    }

    provide(): Subscription {
        return this.provider.provide().subscribe(async (status: GameStatus | undefined) => {
            await this.publisher.publish(status);
        })
    }
}
