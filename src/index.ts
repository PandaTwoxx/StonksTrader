import { Client, GatewayIntentBits, Events, REST, Routes, Interaction } from 'discord.js';
import prisma from './db';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.once(Events.ClientReady, () => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  if (commandName === 'hello') {
    await interaction.reply(`Hello, ${interaction.user.username}!`);
  }
});

client.login(process.env.TOKEN);

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!'
  },
  {
    name: 'hello',
    description: 'Greets the user'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || '');

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID || ''),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');

    console.log('Checking database connection...');
    await prisma.$connect();
    console.log('Database connection successful!');
  } catch (error) {
    console.error(error);
  }
})();
