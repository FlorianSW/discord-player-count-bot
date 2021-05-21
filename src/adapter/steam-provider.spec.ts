import {GameStatusProvider} from '../domain/game-status-provider';
import {SteamProvider} from './steam-provider';
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
            maxPlayers: 40,
            playerCount: expect.any(Number)
        }));
    });
});
