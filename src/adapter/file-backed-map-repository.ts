import {GameMap, MapsRepository} from '../domain/maps-repository.js';
import {existsSync, readFileSync} from 'fs';

export class FileBackedMapRepository implements MapsRepository {
    private readonly maps: {[name: string]: GameMap};

    constructor() {
        const mapsPath = './config/maps.json';
        if (!existsSync(mapsPath)) {
            console.debug('./config/maps.json does not exist');
            this.maps = {};
            return;
        }
        this.maps = JSON.parse(readFileSync(mapsPath).toString());
    }

    find(name: string): GameMap | undefined {
        return this.maps[name];
    }
}
