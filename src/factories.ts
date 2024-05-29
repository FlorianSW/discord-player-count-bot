import {ProviderFactory} from './index.js';
import {GameStatusProvider} from './domain/game-status-provider.js';
import {SteamProvider} from './adapter/steam/steam-provider.js';
import {CFToolsProvider} from './adapter/cftools/cftools-provider.js';
import {CFToolsClientBuilder} from 'cftools-sdk';
import {SteamQueryProvider} from './adapter/steam_query/steam-query-provider.js';
import {BattlemetricsProvider} from "./adapter/battlemetrics/battlemetrics-provider.js";
import {QueryOptions} from "gamedig";

export function providerFactory(): ProviderFactory {
    switch (process.env.PLAYER_COUNT_PROVIDER) {
        case 'steam':
            return new SteamProviderFactory();
        case 'steam-query':
            return new SteamQueryProviderFactory();
        case 'cftools_cloud':
            return new CFToolsCloudProviderFactory();
        case 'battlemetrics':
            return new BattlemetricsProviderFactory();
        default:
            throw new Error('No or unknown player count provider configured.');
    }
}

class SteamProviderFactory implements ProviderFactory {
    build(): GameStatusProvider {
        if (!process.env.STEAM_API_TOKEN) {
            throw new Error('STEAM_API_TOKEN needs to be set!');
        }
        if (!process.env.GAME_ADDRESS) {
            throw new Error('GAME_ADDRESS needs to be set!');
        }
        return new SteamProvider(process.env.STEAM_API_TOKEN, process.env.GAME_ADDRESS);
    }
}

class SteamQueryProviderFactory implements ProviderFactory {
    build(): GameStatusProvider {
        if (!process.env.GAME_TYPE) {
            throw new Error('GAME_TYPE needs to be set!');
        }
        if (!process.env.GAME_IP) {
            throw new Error('GAME_IP needs to be set!');
        }
        if (!process.env.GAME_QUERY_PORT) {
            throw new Error('GAME_QUERY_PORT needs to be set!');
        }
        return new SteamQueryProvider(process.env.GAME_TYPE as QueryOptions['type'], process.env.GAME_IP, parseInt(process.env.GAME_QUERY_PORT || '0'));
    }
}

class BattlemetricsProviderFactory implements ProviderFactory {
    build(): GameStatusProvider {
        if (!process.env.BM_ACCESS_TOKEN) {
            throw new Error('BM_ACCESS_TOKEN needs to be set!');
        }
        if (!process.env.BM_SERVER_ID) {
            throw new Error('BM_SERVER_ID needs to be set!');
        }
        return new BattlemetricsProvider(process.env.BM_ACCESS_TOKEN, process.env.BM_SERVER_ID);
    }
}

class CFToolsCloudProviderFactory implements ProviderFactory {
    build(): GameStatusProvider {
        if (!process.env.CFTOOLS_HOSTNAME) {
            throw new Error('CFTOOLS_HOSTNAME needs to be set!');
        }
        if (!process.env.CFTOOLS_PORT) {
            throw new Error('CFTOOLS_PORT needs to be set!');
        }
        return new CFToolsProvider(
            new CFToolsClientBuilder().withCache().withCacheConfiguration({
                gameServerDetails: 60,
            }).build(),
            process.env.CFTOOLS_HOSTNAME,
            parseInt(process.env.CFTOOLS_PORT)
        );
    }
}
