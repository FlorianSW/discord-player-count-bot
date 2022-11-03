import {GameStatus} from './game-status-provider.js';

export interface GameStatusPublisher {
    publish(status: GameStatus | undefined): Promise<void>;
}
