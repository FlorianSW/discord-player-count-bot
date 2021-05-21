import {Observable} from 'rxjs';

export interface GameStatus {
    playerCount: number;
    maxPlayers: number;
}

export interface GameStatusProvider {
    provide(): Observable<GameStatus>
}
