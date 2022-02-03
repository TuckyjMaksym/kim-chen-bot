import { config as configDotEnv } from 'dotenv';

configDotEnv();

import { bot } from './bot';
import { connectDb } from './db';

(async () => {
    await connectDb();
    bot.launch();
})()
