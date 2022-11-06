export interface GameMap {
    name: string,
    imageUrl: string,
}

export interface MapsRepository {
    find(name: string): GameMap | undefined;
}
