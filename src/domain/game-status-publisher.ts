import {GameStatus} from './game-status-provider';

export interface GameStatusPublisher {
    publish(status: GameStatus | undefined): Promise<void>;
}
