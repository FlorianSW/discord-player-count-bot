import {GameStatus, GameStatusProvider} from '../../domain/game-status-provider';
import {CFToolsProvider} from './cftools-provider';
import {firstValueFrom} from 'rxjs';
import {config} from 'dotenv';
import {CFToolsClientBuilder} from 'cftools-sdk';

config();

describe('CFToolsProvider', () => {
    let provider: GameStatusProvider;

    beforeEach(() => {
        provider = new CFToolsProvider(new CFToolsClientBuilder().build(), process.env.CFTOOLS_HOSTNAME || '', parseInt(process.env.CFTOOLS_PORT || '0'));
    });

    it('returns game status', async () => {
        expect(await firstValueFrom(provider.provide())).toEqual(expect.objectContaining({
            maxPlayers: 40,
            playerCount: expect.any(Number),
            queuedPlayers: expect.any(Number),
        } as GameStatus));
    });
});
