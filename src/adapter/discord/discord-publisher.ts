import {GameStatusPublisher} from '../../domain/game-status-publisher.js';
import {GameStatus} from '../../domain/game-status-provider.js';
import {Client, Colors, EmbedBuilder, EmbedField, TextChannel} from 'discord.js';
import {ActivityType} from 'discord-api-types/v10';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {MapsRepository} from '../../domain/maps-repository.js';

export interface MessageFormats {
    playerCount: string,
    queuedPlayers: string,
    nextRestart: string,
}

export class DiscordPublisher implements GameStatusPublisher {
    private messageId: string | undefined;
    private channel: TextChannel | undefined;
    private nextRestartTimes: number[] | undefined;

    public msUntilNextRestart(): number | null {
        if (!this.nextRestartTimes || this.nextRestartTimes.length === 0) {
            return null;
        }
        const now = new Date();
        const currentHour = now.getHours();
        const nextRestartHour = this.nextRestartTimes.find((t) => t > currentHour);
        if (nextRestartHour === undefined) {
            return null;
        }
        const nextRestartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextRestartHour, 0, 0);
        if (nextRestartDate < now) {
            nextRestartDate.setDate(nextRestartDate.getDate() + 1);
        }
        return nextRestartDate.getTime() - now.getTime();
    }

    public humanReadableMs(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const pluralize = (value: number, unit: string): string => {
            return `${value} ${unit}${value !== 1 ? 's' : ''}`;
        };

        const parts: string[] = [];
        if (hours > 0) {
            parts.push(pluralize(hours, 'hour'));
        }
        if (minutes % 60 > 0) {
            parts.push(pluralize(minutes % 60, 'minute'));
        }
        if (parts.length === 0 && seconds % 60 > 0) {
            parts.push(pluralize(seconds % 60, 'second'));
        }
        if (parts.length === 0) {
            return 'less than a second';
        }

        return parts.join(', ');
    }

    constructor(private readonly client: Client, private readonly maps: MapsRepository, private readonly formats: MessageFormats) {
        if (!process.env.DISCORD_MESSAGE_CHANNEL_ID) {
            return
        }
        if (process.env.ABSOLUTE_RESTART_TIMES?.length) {
            const times = process.env.ABSOLUTE_RESTART_TIMES.split(',').map((t) => parseInt(t.trim(), 10));
            if (times.some((t) => isNaN(t) || t < 0 || t > 23)) {
                throw new Error('Invalid ABSOLUTE_RESTART_TIMES provided, must be a comma separated list of integers between (inclusive) 0 and 23.');
            }
            console.log('Using absolute restart times: ' + times.join(', '));
            this.nextRestartTimes = times;
        }
        this.updateCreateStatusMessage().then((c) => {
            console.log('Created or updates initial status message...');
            this.messageId = c.messageId;
            this.channel = c.channel;
        }).catch((err) => {
            console.error('Errored while updating or creating status message, message: ' + err);
            process.exit(1);
        });
    }

    async updateCreateStatusMessage(): Promise<{ messageId: string, channel: TextChannel }> {
        const cid = process.env.DISCORD_MESSAGE_CHANNEL_ID as string;
        const c = await this.client.channels.fetch(cid);
        if (!c) {
            throw new Error('Configured channel with ID ' + cid + ' is not known.');
        }
        if (!c.isSendable()) {
            throw new Error('Configured channel with ID ' + cid + ' cannot be send to.');
        }
        const configDir = './config/';
        const configFile = configDir + 'discord_message_id';
        if (existsSync(configFile)) {
            return {
                messageId: readFileSync(configFile).toString(),
                channel: c as TextChannel,
            };
        }
        const message = await c.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Grey)
                    .setTitle('Querying server...')
                    .setFooter({
                        text: 'Developed by FlorianSW',
                    })
            ],
        });

        mkdirSync(configDir, {recursive: true});
        writeFileSync(configFile, message.id);
        return {
            messageId: message.id,
            channel: c as TextChannel,
        }
    }

    async publish(status: GameStatus | undefined): Promise<void> {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setFooter({
                text: 'Developed by FlorianSW',
            });
        if (status === undefined) {
            this.client.user?.setPresence({
                status: 'idle',
                activities: [{
                    type: ActivityType.Watching,
                    name: 'the server boot',
                }],
            });
            this.client.user?.setStatus('dnd');
            embed
                .setColor(Colors.DarkGrey)
                .setTitle('Server is offline right now, waiting for first status');
        } else {
            let message = this.formats.playerCount
                .replace('${playerCount}', status.playerCount.toString())
                .replace('${maxPlayers}', status.maxPlayers.toString());
            if (status.queuedPlayers) {
                if (message.indexOf('${queuedPlayersMessage}') !== -1) {
                  message = message.replace(
                    '${queuedPlayersMessage}',
                    this.formats.queuedPlayers.replace('${queuedPlayers}', status.queuedPlayers.toString(10))
                  );
                }
                if (message.indexOf('${queuedPlayers}') !== -1) {
                  message = message.replace(
                    '${queuedPlayers}',
                    status.queuedPlayers.toString(10)
                  );
                }
            } else {
                message = message
                  .replace('${queuedPlayersMessage}', '')
                  .replace('${queuedPlayers}', '');
            }
            const hasNextRestartMessage = message.indexOf('${nextRestartMessage}') !== -1;
            const hasNextRestartRelative = message.indexOf('${nextRestartRelative}') !== -1;
            if (hasNextRestartMessage || hasNextRestartRelative) {
                const nextRestart = this.msUntilNextRestart();
                if (nextRestart !== null) {
                  const humanReadableNextRestart = this.humanReadableMs(nextRestart);
                    if (hasNextRestartMessage) {
                        message = message.replace(
                            '${nextRestartMessage}',
                            this.formats.nextRestart.replace('${nextRestartRelative}', humanReadableNextRestart)
                        );
                    }
                    if (hasNextRestartRelative) {
                        message = message.replace('${nextRestartRelative}', humanReadableNextRestart);
                    }
                } else {
                    message = message
                      .replace('${nextRestartMessage}', '')
                      .replace('${nextRestartRelative}', '');
                }
            }
            this.client.user?.setPresence({
                status: 'online',
                activities: [{
                    type: ActivityType.Playing,
                    name: message
                }]
            });
            const fields: EmbedField[] = [{
                name: 'Players',
                value: message,
                inline: false,
            }];
            if (status.map) {
                const map = this.maps.find(status.map);
                fields.push({
                    name: 'Map',
                    value: map?.name || status.map,
                    inline: false,
                });
                embed.setImage(map?.imageUrl || null);
            }
            if (status.map) {
            }
            embed
                .setTitle(status.name)
                .setColor(Colors.DarkGreen)
                .addFields(fields);
        }
        if (this.messageId) {
            const m = await this.channel?.messages.fetch(this.messageId);
            await m?.edit({
                embeds: [embed],
            });
        }
    }

    async currentStatus(): Promise<GameStatus | undefined> {
        const guild = await this.client.guilds.cache.first()!!;
        const member = await guild.members.fetch(this.client.user!!);
        if (member.presence?.status !== 'online' || member.presence?.activities.length !== 1) {
            return undefined;
        }
        const status = member.presence?.activities[0].name.split('/')
        if (status.length !== 2) {
            return undefined;
        }
        const secondSection = status[1].split(' ');
        const maxPlayers = parseInt(secondSection[0]);
        let queuedPlayers: number | undefined = undefined;
        if (secondSection.length === 2) {
            queuedPlayers = parseInt(secondSection[1]
                .replace('(', '')
                .replace('+', '')
                .replace(')', ''));
        }
        return {
            playerCount: parseInt(status[0]),
            maxPlayers: maxPlayers,
            queuedPlayers: queuedPlayers,
            name: null,
            map: null,
        }
    }
}
