const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { WildernessFlashEvents } = require('../resources/Runescape');

const Subscribe = async (interaction, specialsOnly = false) => {
    let res = WildernessFlashEvents.addToSubbedChannels({
        id: interaction.channelId,
        name: interaction.channel.name,
        specialsOnly: specialsOnly
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
                .addChoices(
                    { name: 'Subscribe', value: 'subscribe' },
                    { name: 'Specials Only', value: 'specials' },
                    { name: 'Unsubscribe', value: 'unsubscribe' }
                )
        )
        .setDescription('Get notified with wilderness flash events.'),
    async execute(interaction) {
        if (interaction.options.getString('type') == "subscribe") {
            return Subscribe(interaction);
        }
        if (interaction.options.getString('type') == 'specials') {
            return Subscribe(interaction, true);
        }
        if (interaction.options.getString('type') == "unsubscribe") {
            return Unsubscribe(interaction);
        }

        let eventsStr = "";
        let nextEvent = WildernessFlashEvents.getNextEvent();
        let AllEvents = WildernessFlashEvents.events;
        let nextSpecial;

        AllEvents.sort((evt1, evt2) => evt1.order < evt2.order);
        AllEvents.forEach((event, idx) => {
            eventsStr += `${event.order}.\t${event.name}`;
            if (event.order == nextEvent.order) {
                eventsStr += `\t--- Upcoming event (${WildernessFlashEvents.timeToNextHour()} minutes) ---`;
                let next = idx++;
                while (!nextSpecial) {
                    next++;
                    if (next == AllEvents.length + 1) next = 0;
                    if (AllEvents[next].special == true) nextSpecial = AllEvents[next];
                }
            }

            if (nextSpecial && event.order == nextSpecial.order) eventsStr += '\t--- Next special event---';

            if (nextEvent.order == 0 && event.order == AllEvents[AllEvents.length].order) eventsStr += '\t--- Previours Event ---';
            else if (event.order == nextEvent.order - 1) eventsStr += '\t--- Previous Event ---';



            eventsStr += "\n";

        });

        return await interaction.reply({ content: eventsStr, ephemeral: true });
    },
}



