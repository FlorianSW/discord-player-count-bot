import {GameStatus, GameStatusProvider} from '../../domain/game-status-provider';
import {Observable, Observer} from 'rxjs';
import {BattlEyeClient} from './battleye-client';

export class BattlEyeRconProvider implements GameStatusProvider {
    private readonly observable: Observable<GameStatus>;

    constructor(host: string, port: number, password: string, private maxPlayers: number) {
        this.observable = new Observable((observer: Observer<GameStatus | undefined>) => {
            const client = new BattlEyeClient(host, port, password);
            client
                .on('playerConnect', (name: string, amount: number) => {
                    observer.next({
                        playerCount: amount,
                        maxPlayers: this.maxPlayers
                    });
                })
                .on('playerDisconnect', (name: string, amount: number) => {
                    observer.next({
                        playerCount: amount,
                        maxPlayers: this.maxPlayers
                    });
                });

            return {
                unsubscribe() {
                    client.disconnect();
                }
            }
        });
    }

    provide(): Observable<GameStatus | undefined> {
        return this.observable;
    }
}
