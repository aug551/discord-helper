require('dotenv').config()
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { messages, getUserDetails, logout, animeSearch } = require('../resources/MyAnimeList');

function createEmbeddedLink(link) {
    const embed = new EmbedBuilder()
        .setColor(0x2e51a2)
        .setTitle("MyAnimeList Authentication")
        .setURL(link)
        .setDescription(messages.login)
        .setThumbnail('https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png')


    return embed;
}

function createEmbeddedSearch(
    title,
    synopsis,
    url,
    medImg,
    largeImg,
    alt_titles,
    start_date,
    end_date,
    num_episodes,
    status) {
    if (synopsis.length > 197) synopsis = synopsis.substring(0, 200) + '...';
    if (alt_titles.en == '' || alt_titles.en == undefined)
        alt_titles.en = title;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(synopsis)
        .setURL(url)
        .setThumbnail(medImg)
        .addFields(
            { name: "English Title", value: alt_titles.en },
            { name: '\u200B', value: '\u200B' },
            { name: 'Start Date', value: start_date, inline: true },
            { name: 'End Date', value: end_date, inline: true },
            { name: 'Status', value: status, inline: true },
            { name: 'Number of episodes', value: num_episodes + "", inline: true }
        )
        .setImage(largeImg)


    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('What you want to do with MAL helper. Type "help" for more information')
        )
        .setDescription('MyAnimeList helper'),
    async execute(interaction) {
        let command = interaction.options.getString('command');

        // For the following, you don't need to login
        if (command == 'help' || command == "" || !command) {
            return await interaction.reply({
                content: messages.help,
                ephemeral: true
            });
        }
        if (command.startsWith('search')) {
            let query = command.replace('search', '');
            query = query.trim();

            let res = await animeSearch(query, 1);
            let searchResults = res.data;
            // let nextPage = res.paging.next;

            toSend = [];

            // console.log(searchResults);

            searchResults.forEach(anime => {
                anime = anime.node;

                let embed = createEmbeddedSearch(
                    anime.title,
                    anime.synopsis,
                    `https://myanimelist.net/anime/${anime.id}`,
                    anime.main_picture.medium,
                    anime.main_picture.large,
                    anime.alternative_titles,
                    anime.start_date,
                    anime.end_date,
                    anime.num_episodes,
                    anime.status
                );
                toSend.push(embed);
            });

            return await interaction.reply({
                embeds: toSend
            })
        }

        if (command == 'logout') {
            let stat = logout(interaction.user.id);
            let msg = messages.logout;

            if (stat == 404) {
                msg = "There is no MAL user associated with your account."
            }

            return await interaction.reply({
                content: msg,
                ephemeral: true
            })
        }

        // For other commands, you need to login
        let user = await getUserDetails(interaction.user.id);
        if (!user || command == 'login')
            return await interaction.reply({
                content: messages.error,
                embeds: [createEmbeddedLink(`https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${process.env.MAL_CLIENT_ID}&code_challenge=${process.env.MAL_CODE_CHALLENGE}&state=${interaction.user.id}`)],
                ephemeral: true
            });

        if (command == 'user') {
            return await interaction.reply({
                content: `You are currently logged in with the MAL account: ${user.name} (${user.id})`,
                ephemeral: true
            });
        }
    },
}