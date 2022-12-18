const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { WildernessFlashEvents } = require('../resources/Runescape');

const Subscribe = async (interaction) => {
    let res = WildernessFlashEvents.addToSubbedChannels({
        id: interaction.channelId,
        name: interaction.channel.name
    });

    if (res == 201)
        await interaction.reply(`Added ${interaction.channel.name} channel to subscriber list.`);
    else if (res == 409)
        await interaction.reply('This channel is already getting wilderness flash event updates.');
    else
        await interaction.reply('There was an error with adding the channel to subscriber list.');
}

const Unsubscribe = async (interaction) => {
    let res = WildernessFlashEvents.deleteSubbedChannel({
        id: interaction.channelId
    });

    if (res == 204) {
        await interaction.reply('This channel is currently not subscribed to receive wildy notifications.');
    }
    else if (res == 202) {
        await interaction.reply('Successfully removed this channel from further receiving wildy notifications.');
    }
    else {
        await interaction.reply('There was an error with removing the channel to subscriber list.');
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wildy')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Subscribe or unsubscribe')
                .setRequired(true)
                .addChoices(
                    { name: 'Subscribe', value: 'subscribe' },
                    { name: 'Unsubscribe', value: 'unsubscribe' }
                )
        )
        .setDescription('Get notified with wilderness flash events.'),
    async execute(interaction) {
        if (interaction.options.getString('type') == "subscribe") {
            return Subscribe(interaction);
        }
        if (interaction.options.getString('type') == "unsubscribe") {
            return Unsubscribe(interaction);
        }
    },
}



