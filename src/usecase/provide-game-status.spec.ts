import {ProvideGameStatus} from './provide-game-status.js';
import {GameStatus, GameStatusProvider} from '../domain/game-status-provider.js';
import {GameStatusPublisher} from '../domain/game-status-publisher.js';
import {Observable, of} from 'rxjs';

describe('ProvideGameStatus', () => {
    let useCase: ProvideGameStatus;
    let publisher: InMemoryGameStatusPublisher;

    beforeEach(() => {
        publisher = new InMemoryGameStatusPublisher();
        useCase = new ProvideGameStatus(new InMemoryGameStatusProvider(), publisher);
    });

    it('publishes status', async () => {
        await useCase.provide();

        expect(publisher.currentStatus).toEqual({
            maxPlayers: 40,
            playerCount: 5
        } as GameStatus);
    });
});

class InMemoryGameStatusProvider implements GameStatusProvider {
    provide(): Observable<GameStatus> {
        return of({
            maxPlayers: 40,
            playerCount: 5,
            name: 'Test-Server',
            map: 'Foy',
        });
    }
}

class InMemoryGameStatusPublisher implements GameStatusPublisher {
    public currentStatus: GameStatus | undefined = undefined;

    async publish(status: GameStatus): Promise<void> {
        this.currentStatus = status;
    }
}
