import {ProviderFactory} from './index';
import {GameStatusProvider} from './domain/game-status-provider';
import {SteamProvider} from './adapter/steam/steam-provider';
import {BattlEyeRconProvider} from './adapter/battleye-rcon/be-rcon-provider';

export function providerFactory(): ProviderFactory {
    switch (process.env.PLAYER_COUNT_PROVIDER) {
        case 'steam':
            return new SteamProviderFactory();
        case 'battleye':
            return new BattlEyeProviderFactory();
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

class BattlEyeProviderFactory implements ProviderFactory {
    build(): GameStatusProvider {
        if (!process.env.BE_RCON_HOST) {
            throw new Error('BE_RCON_HOST needs to be set!');
        }
        if (!process.env.BE_RCON_PORT) {
            throw new Error('BE_RCON_PORT needs to be set!');
        }
        if (!process.env.BE_RCON_PASSWORD) {
            throw new Error('BE_RCON_PASSWORD needs to be set!');
        }
        if (!process.env.BE_RCON_MAX_PLAYERS) {
            throw new Error('BE_RCON_MAX_PLAYERS needs to be set!');
        }
        return new BattlEyeRconProvider(
            process.env.BE_RCON_HOST,
            parseInt(process.env.BE_RCON_PORT),
            process.env.BE_RCON_PASSWORD,
            parseInt(process.env.BE_RCON_MAX_PLAYERS)
        );
    }
}
