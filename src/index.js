import { ChatGPTClient } from "@waylaidwanderer/chatgpt-api";
import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
const OPENAI_KEY = process.env.OPENAI_KEY;
const TELEGRAM_KEY = process.env.TELEGRAM_KEY;
const clientOptions = {
  // (Optional) Support for a reverse proxy for the completions endpoint (private API server).
  // Warning: This will expose your `openaiApiKey` to a third-party. Consider the risks before using this.
  reverseProxyUrl: "https://chatgpt.pawan.krd/api/completions",
  // (Optional) Parameters as described in https://platform.openai.com/docs/api-reference/completions
  modelOptions: {
    // You can override the model name and any other parameters here.
    model: "text-davinci-002-render",
  },
  // (Optional) Set custom instructions instead of "You are ChatGPT...".
  // promptPrefix: 'You are Bob, a cowboy in Western times...',
  // (Optional) Set a custom name for the user
  // userLabel: 'User',
  // (Optional) Set a custom name for ChatGPT
  // chatGptLabel: 'ChatGPT',
  // (Optional) Set to true to enable `console.debug()` logging
  debug: false,
};

const cacheOptions = {
  // Options for the Keyv cache, see https://www.npmjs.com/package/keyv
  // This is used for storing conversations, and supports additional drivers (conversations are stored in memory by default)
  // For example, to use a JSON file (`npm i keyv-file`) as a database:
  // store: new KeyvFile({ filename: 'cache.json' }),
};

const chatGptClient = new ChatGPTClient(
  OPENAI_KEY,
  clientOptions,
  cacheOptions
);
const sessions = {};

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TELEGRAM_KEY, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", async (msg) => {
  try {
    console.log(msg);
    const chatId = msg.chat.id;
    const response = await chatGptClient.sendMessage(msg.text, {
      conversationId: sessions[msg.chat.id]?.conversationId || null,
      parentMessageId: sessions[msg.chat.id]?.messageId || null,
      onProgress: (token) => console.log(token),
    });
    sessions[msg.from.id] = {
      conversationId: response.conversationId,
      parentMessageId: response.parentMessageId,
    };
    console.log(response);
    bot.sendMessage(
      chatId,
      `${response.response.replace("<|im_end|>", "")}`,
      {}
    );
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Server busy. Try again!");
    console.log(err);
  }
});
