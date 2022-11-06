import {Observable} from 'rxjs';

export interface GameStatus {
    playerCount: number;
    map: string | null;
    name: string | null;
    maxPlayers: number;
    queuedPlayers?: number;
}

export interface GameStatusProvider {
    provide(): Observable<GameStatus | undefined>
}
