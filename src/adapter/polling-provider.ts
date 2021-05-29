import {GameStatus, GameStatusProvider} from '../domain/game-status-provider';
import {from, Observable, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export abstract class PollingProvider implements GameStatusProvider {
    private interval: number = 10000;

    provide(): Observable<GameStatus | undefined> {
        return timer(0, this.interval).pipe(switchMap(() => from(this.retrieve())))
    }

    protected abstract retrieve(): Promise<GameStatus>;
}
