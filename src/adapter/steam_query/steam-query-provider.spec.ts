import {GameStatusProvider} from '../../domain/game-status-provider.js';
import {SteamQueryProvider} from './steam-query-provider.js';
import {firstValueFrom} from 'rxjs';
import {config} from 'dotenv';

config();

describe('SteamQueryProvider', () => {
    let provider: GameStatusProvider;

    beforeEach(() => {
        provider = new SteamQueryProvider(process.env.GAME_TYPE || 'dayz' as any, process.env.GAME_IP || '', parseInt(process.env.GAME_QUERY_PORT || '27016'));
    });

    it('returns game status', async () => {
        expect(await firstValueFrom(provider.provide())).toEqual(expect.objectContaining({
            maxPlayers: 60,
            playerCount: expect.any(Number),
        }));
    });
});
