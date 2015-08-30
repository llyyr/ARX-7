import irc from 'irc';
import config from './config';

import {Choose} from './commands/choose.js';
import {Debug} from './commands/debug.js';
import {Imgur} from './commands/imgur.js';
import {Order} from './commands/order.js';
import {Twitter} from './commands/twitter.js';
import {Youtube} from './commands/youtube.js';
import {Time} from './commands/time.js';

let channels = Object.keys(config.channels);

// Initialize the Bot
let client = new irc.Client(config.server, config.name, {
  channels: channels,
  autoRejoin: true
});

// Command List Setup
let commands = [
  new Choose(client),
  new Debug(client),
  new Imgur(client),
  new Order(client),
  new Twitter(client),
  new Youtube(client),
  new Time(client)
]

// On Server Connect
client.addListener('registered', (message) => {
  console.log('Connected to Server');
  client.say('NickServ', `identify ${config.password}`);
  console.log('Identified');
});

// Respond to Version requests
client.addListener('ctcp-version', (from, to, message) => {
  console.log(`CTCP request from ${from}`);
  client.ctcp(from, 'notice', `VERSION Bot running on node-irc.`);
});

// Listen for channel / personal Messages
client.addListener('message', (from, to, text, message) => {
  commands.forEach(c => {
    let i = -1;
    let plugin = c.constructor.name.toLowerCase();

    // Search config for non-lowercase values
    channels.some((element, index) => {
      if (element.toLowerCase() === to) {
        i = index;
        return true;
      }
    });

    // Check for plugin presence
    if (config.channels[channels[i]].indexOf(plugin) > -1) {
      c.message(from, to, text, message);
    }
  });
});

// Praise the Creator
client.addListener('join', (channel, nick, message) => {
  if (nick === 'Desch' && channel == '#arx-7') {
    client.say(channel, 'Hello Master.');
  }
});

// Catch errors, attempt to rejoin banned channels
client.addListener('error', message => {
  if (message.command == 'err_bannedfromchan') {
    console.log(`Banned from ${message.args[1]}. Rejoining in in 3 minutes`);

    // `()=>` ensures there is a delay; otherwise it continuously fires
    setTimeout(() => client.join(message.args[1]), 1000 * 60 * 3);
  }
  else {
    console.log(`Error: ${message.command}`);
  }
});
