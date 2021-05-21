import {GameStatus, GameStatusProvider} from '../domain/game-status-provider';
import {GameStatusPublisher} from '../domain/game-status-publisher';
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
