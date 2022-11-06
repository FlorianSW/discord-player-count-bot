import {GameStatusPublisher} from '../../domain/game-status-publisher.js';
import {GameStatus} from '../../domain/game-status-provider.js';
import {Client, Colors, EmbedBuilder, EmbedField, TextChannel} from 'discord.js';
import {ActivityType} from 'discord-api-types/v10';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {MapsRepository} from '../../domain/maps-repository.js';

export class DiscordPublisher implements GameStatusPublisher {
    private messageId: string | undefined;
    private channel: TextChannel | undefined;

    constructor(private readonly client: Client, private readonly maps: MapsRepository) {
        if (!process.env.DISCORD_MESSAGE_CHANNEL_ID) {
            return
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
        if (!c.isTextBased()) {
            throw new Error('Configured channel with ID ' + cid + ' is not a text channel.');
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
            await this.client.user?.setPresence({
                status: 'idle',
                activities: [{
                    type: ActivityType.Watching,
                    name: 'the server boot',
                }],
            });
            await this.client.user?.setStatus('dnd');
            embed
                .setColor(Colors.DarkGrey)
                .setTitle('Server is offline right now, waiting for first status');
        } else {
            let name = status.playerCount + '/' + status.maxPlayers;
            if (status.queuedPlayers) {
                name = `${name} (+${status.queuedPlayers})`;
            }
            await this.client.user?.setPresence({
                status: 'online',
                activities: [{
                    type: ActivityType.Playing,
                    name: name
                }]
            });
            const fields: EmbedField[] = [{
                name: 'Players',
                value: name,
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
