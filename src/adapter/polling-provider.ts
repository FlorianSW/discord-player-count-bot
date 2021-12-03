import {GameStatus, GameStatusProvider} from '../domain/game-status-provider';
import {asyncScheduler, delayWhen, from, map, Observable, retryWhen, tap, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export abstract class PollingProvider implements GameStatusProvider {
    private healthy = false;
    private try = 1;
    private interval: number = 10000;

    provide(): Observable<GameStatus | undefined> {
        return timer(0, this.interval).pipe(
            switchMap(() => from(this.retrieve())),
            retryWhen((errors => {
                if (this.healthy) {
                    return errors.pipe(
                        tap(val => {
                            if (this.try > 15) {
                                throw new Error('PollingProvider became unhealty, exiting... Check the configuration and make sure the game server is online.');
                            }
                            console.log('PollingProvider errored, retrying in ' + (this.try + 1) * 2 + ' seconds for max 15 tries (' + this.try + '. try). Error:', val.message);
                            this.try++;
                        }),
                        delayWhen(() => {
                            return timer(this.try * 2 * 1000, asyncScheduler);
                        }),
                    );
                } else {
                    return errors.pipe(
                        tap(err => console.log(err.message)),
                        map(() => {
                            throw new Error('PollingProvider never became healthy. Check the configuration for errors and try again.');
                        }),
                    );
                }
            })),
            tap(() => {
                this.healthy = true;
                this.try = 1;
            }),
        );
    }

    protected abstract retrieve(): Promise<GameStatus>;
}
