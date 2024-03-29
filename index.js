const fs = require('fs');
const path = require('path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const { WildernessFlashEvents } = require('./resources/Runescape');
const app = require('./server');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
})

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    let wildyHandler = new WildernessFlashEvents(10);
    wildyHandler.on('eventSoon', e => {
        let subbed = WildernessFlashEvents.getSubbedChannels();
        Object.keys(subbed).forEach(key => {
            let channel = c.channels.cache.get(key);

            if (!channel) return;
            if (subbed[key].specialsOnly && !e.special) return;
	
            channel.send(`${e.name} is happening in ${wildyHandler.reminderInterval} minutes`);
        })
    })

});

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);
// client.login(process.env.BOT_TOKEN_DEV);

app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}`));
