import {Observable} from 'rxjs';

export interface GameStatus {
    playerCount: number;
    maxPlayers: number;
    queuedPlayers?: number;
}

export interface GameStatusProvider {
    provide(): Observable<GameStatus | undefined>
}
