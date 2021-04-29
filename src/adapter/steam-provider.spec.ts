import {GameStatusProvider} from '../domain/game-status-provider';
import {SteamProvider} from './steam-provider';

describe('SteamProvider', () => {
    let provider: GameStatusProvider;

    beforeEach(() => {
        provider = new SteamProvider(process.env.STEAM_API_TOKEN || '', process.env.GAME_ADDRESS || '');
    });

    it('returns game status', async () => {
        expect(await provider.retrieve()).toEqual(expect.objectContaining({
            maxPlayers: 40,
            playerCount: expect.any(Number)
        }));
    });
});
