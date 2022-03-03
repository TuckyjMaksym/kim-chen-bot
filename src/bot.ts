// Modules
import { Telegraf } from 'telegraf';

// Database
import { scores } from './db';

// Events
import { randomEvent } from './events';

// Utils
import * as stickersIds from './stickersIds';
import { getMessage, getMessageForTopUsers } from './utils';

export const tgBotId = 5112385808;
export const bot = new Telegraf(process.env.TG_BOT_ACCESS_TOKEN);

bot.on('text', async (ctx) => {
    if (ctx.update.message.text === '/score') {
        const query = { _id: ctx.update.message.from.id };
        const result = await scores.findOne(query);
        const name = `@${ctx.update.message.from.username}`;
        const score = result.social_credits_score;

        ctx.reply(`${name} Якшо скріпт правильно РОБЕ то в тебе >>${score}<< соціальних кредитів.`);
    } else if (ctx.update.message.text === '/top') {
        const query = {};
        const result = await scores.find(query).limit(3).sort({ social_credits_score: -1 }).toArray();
        const topList = result.reduce((str, user, index) => {
            const message = getMessageForTopUsers(index, user.tg_username, user.social_credits_score);

            return `${str}\n${message}`;
        }, '');

        ctx.reply(`Сьогодні наш топ токсіків виглядає наступним чином:\n${topList}`);
    } else {
        randomEvent(ctx);
    }
})

bot.on('sticker', async (ctx) => {
    if (ctx?.update?.message) {
        const {
            update: {
                message: { sticker, reply_to_message, from, chat }
            },
        } = ctx;
        const isRepliedToSelf = from.id === reply_to_message?.from?.id;
        const isRepliedToBot = tgBotId === reply_to_message?.from?.id

        if (!isRepliedToBot && !isRepliedToSelf && reply_to_message && sticker) {
            // Whom to update social credits score
            const name = `@${reply_to_message.from.username}`; 
            // Sticker to rating change values
            const ratingsUpdates: { [key: string]: number } = {
                [stickersIds.diyaPlusTenId]: 10,
                [stickersIds.diyaPlusFiftyId]: 50,
                [stickersIds.diyaMinusTenId]: -10,
                [stickersIds.diyaMinusFiftyId]: -50,
            }
            const ratingChange = ratingsUpdates[sticker.file_id];

            // If rating changed, update value in database
            if (scores && ratingChange) {
                const query = { _id: reply_to_message.from.id };
                const update = {
                    $inc: { social_credits_score: ratingChange },
                    $set: { tg_username: reply_to_message.from.username, tg_chat_id: chat.id },
                };
                const options = { upsert: true };
                await scores.updateOne(query, update, options);

                const message = getMessage(sticker.file_id, name);

                if (message) {
                    ctx.reply(message);
                }
            }
        }
    }
});
