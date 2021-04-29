import {GameStatus} from './game-status-provider';

export interface GameStatusPublisher {
    publish(status: GameStatus): Promise<void>;
}
