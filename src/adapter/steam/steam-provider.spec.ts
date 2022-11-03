import {GameStatusProvider} from '../../domain/game-status-provider.js';
import {SteamProvider} from './steam-provider.js';
import {firstValueFrom} from 'rxjs';
import {config} from 'dotenv';

config();

describe('SteamProvider', () => {
    let provider: GameStatusProvider;

    beforeEach(() => {
        provider = new SteamProvider(process.env.STEAM_API_TOKEN || '', process.env.GAME_ADDRESS || '');
    });

    it('returns game status', async () => {
        expect(await firstValueFrom(provider.provide())).toEqual(expect.objectContaining({
            maxPlayers: expect.any(Number),
            playerCount: expect.any(Number)
        }));
    });
});
