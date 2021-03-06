// Modules
import axios from 'axios';
import { Telegraf } from 'telegraf';

// Database
import { scores } from './db';

// Events
import { randomEvent } from './events';

// Utils
import * as stickersIds from './stickersIds';
import { getMessage, getMessageForTopUsers } from './utils';

// Types
import { TRatesResponseData } from './types';

export const tgBotId = 5112385808;
export const bot = new Telegraf(process.env.TG_BOT_ACCESS_TOKEN);

bot.on('text', async (ctx) => {
    const words = ctx.message.text.split(' ') || [];
    const triggerWordsRegex = /(дурка|база|сук|сюк)/i;
    const pooResponseChance = 0.5;
    const pooRegex = /(посру)|([по]*(сра|сру|кака|кека)[тиью])/i;
    const kekRegex = /(kek[w]*|кек[в]*|рофл|[ао]р[у]|ор[у]*|л[оеу]л|rofl|lol)/i; // This can match substring in sentence, used only in condition

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
    }else if (ctx.update.message.text === '$') {
        const url = `https://openexchangerates.org/api/latest.json?app_id=${process.env.OPENEXCHANGERATES_APP_ID}&symbols=UAH,RUB`;
        const response = await axios({ url });

        if (response.status === 200) {
            const { timestamp, rates } = response.data as TRatesResponseData;
            const date = new Date(timestamp * 1000).toLocaleString('ua');
            const message = `Курс валют станом на ${date}\n\nГривня - ₴${rates.UAH.toFixed(2)}\nРубль - ₽${rates.RUB.toFixed(2)}`;

            ctx.reply(message);
        }
    } else if (triggerWordsRegex.test(ctx.message.text) || pooRegex.test(ctx.message.text) || kekRegex.test(ctx.message.text)) {
        if (words.includes('сук') || words.includes('сюк')) {
            ctx.replyWithSticker(stickersIds.sadCatWhy.id);
        } else if (words.includes('дурка') || words.includes('база')) {
            ctx.replyWithSticker(stickersIds.durkaWolf.id);
        } else if (Math.random() > pooResponseChance && pooRegex.test(ctx.message.text)) {
            ctx.replyWithSticker(stickersIds.noPooCert.id, { reply_to_message_id: ctx.message.message_id });
        } else if (words.some(word => /^(kek[w]*|кек[в]*|рофл|[ао]р[у]|ор[у]*|л[оеу]л|rofl|lol)$/i.test(word))) {
            const randomIndex = Math.floor(Math.random() * stickersIds.kekWStickers.length);

            ctx.replyWithSticker(stickersIds.kekWStickers[randomIndex]);
        }
    }
    randomEvent(ctx);
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

        // Replies handler
        if (reply_to_message) {
            if (!isRepliedToBot && !isRepliedToSelf) {
                // Whom to update social credits score
                const name = `@${reply_to_message.from.username}`; 
                // Sticker to rating change values
                const ratingsUpdates: { [key: string]: number } = {
                    [stickersIds.diyaPlusTenId.unique_id]: 10,
                    [stickersIds.diyaPlusFiftyId.unique_id]: 50,
                    [stickersIds.diyaMinusTenId.unique_id]: -10,
                    [stickersIds.diyaMinusFiftyId.unique_id]: -50,
                }
                const ratingChange = ratingsUpdates[sticker.file_unique_id];

                // If rating changed, update value in database
                if (scores && ratingChange) {
                    const query = { _id: reply_to_message.from.id };
                    const update = {
                        $inc: { social_credits_score: ratingChange },
                        $set: { tg_username: reply_to_message.from.username, tg_chat_id: chat.id },
                    };
                    const options = { upsert: true };
                    await scores.updateOne(query, update, options);

                    const message = getMessage(sticker.file_unique_id, name);

                    if (message) {
                        ctx.reply(message);
                    }
                }
            }
        } else {
            // Not reply, sent sticker handler
            switch (sticker.file_unique_id) {
                case stickersIds.kadyrovIzvinis.unique_id: {
                    ctx.reply('дон');
                    break;
                }
                default: break;
            }
        }
        randomEvent(ctx);
    }
});
