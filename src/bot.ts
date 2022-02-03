import { Telegraf } from 'telegraf';
import { scores } from './db';

import * as stickersIds from './stickersIds';

export const bot = new Telegraf(process.env.TG_BOT_ACCESS_TOKEN);
const getMessage = (file_unique_id: string, name: string) => {
    const texts: { [key: string]: string } = {
        [stickersIds.diyaPlusTenId]: `Володя накинув 10 соціальних кредитів користувачу ${name}`,
        [stickersIds.diyaPlusFiftyId]: `Кім Чен Ин розщіпнув ширінку і дістав звідти 50 соціальних кредитів для користувача ${name}`,
        [stickersIds.diyaMinusTenId]: `${name}, з вас штраф, 10 соціальних кредитів. -10 КЕКВ`,
        [stickersIds.diyaMinusFiftyId]: `Ну і крінжа ${name}, я тебе на 50 соціальних кредитів бахну, будеш знав`
    }

    return texts[file_unique_id];
}

bot.on('text', async (ctx) => {
    if (ctx.update.message.text === '/score') {
        const query = { _id: ctx.update.message.from.id };
        const result = await scores.findOne(query);
        const name = `@${ctx.update.message.from.username}`;
        const score = result.social_credits_score;

        ctx.reply(`${name} Якшо скріпт правильно РОБЕ то в тебе >>${score}<< соціальних кредитів.`);
    }
})

bot.on('sticker', async (ctx) => {
    if (ctx?.update?.message) {
        const {
            update: {
                message: { sticker, reply_to_message, from }
            },
            chat,
        } = ctx;
        const isRepliedToSelf = from.id === reply_to_message?.from?.id;

        if (chat.id === +process.env.MAIN_CHAT_ID && !isRepliedToSelf && reply_to_message && sticker) {
            // Whom to update social credits score
            const name = `@${reply_to_message.from.username}`; 
            // Sticker to rating change values
            const ratingsUpdates: { [key: string]: number } = {
                [stickersIds.diyaPlusTenId]: 10,
                [stickersIds.diyaPlusFiftyId]: 50,
                [stickersIds.diyaMinusTenId]: -10,
                [stickersIds.diyaMinusFiftyId]: -50,
            }
            const ratingChange = ratingsUpdates[sticker.file_unique_id];

            // If rating changed, update value in database
            if (scores && ratingChange) {
                const query = { _id: reply_to_message.from.id };
                const update = { $inc: { social_credits_score: ratingChange } };
                const options = { upsert: true };
                const result = await scores.updateOne(query, update, options);

                const message = getMessage(sticker.file_unique_id, name);
                
                if (message) {
                    ctx.reply(message);
                }
            }
        }
    }
});
