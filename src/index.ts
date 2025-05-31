import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import prisma from './db';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Set up Express for HTTP interactions (needed for ngrok)
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// This endpoint can be used to receive interactions if you set up Discord to use HTTP interactions
app.post('/interactions', (req, res) => {
  console.log('Received interaction:', req.body);
  res.json({ type: 1 }); // ACK the interaction
});

app.get('/health', (req, res) => {
  res.status(200).send('Bot is running and healthy!');
});

client.once(Events.ClientReady, () => {
  console.log('Ready! Logged in as ${readyClient.user.tag}');
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!hello')) {
    message.reply('Hello there!');
  }
  
  if (message.content.startsWith('!ping')) {
    message.reply('Pong!');
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

    console.log('Starting Express server on port: ', PORT);
    app.listen(PORT, () => {
      console.log(`Server started successfully on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
})();