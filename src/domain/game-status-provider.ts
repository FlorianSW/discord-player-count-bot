export interface GameStatus {
    playerCount: number;
    maxPlayers: number;
}

export interface GameStatusProvider {
    retrieve(): Promise<GameStatus>
}
