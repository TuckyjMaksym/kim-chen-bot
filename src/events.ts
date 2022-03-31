import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";

// Database
import { scores } from './db';

import * as stickersIds from './stickersIds';

const eventChances = {
    mayorPenalty: 0.01,
    mayorBoost: 0.1
}

export const randomEvent = (ctx: Context<Update>) => {
    const mayorChanceValue = Math.random();

    if (mayorChanceValue < eventChances.mayorPenalty) {
        const updateDocs = (rating: number) => {
            const filter = { tg_chat_id: ctx.message.chat.id };
            const update = { $inc: { social_credits_score: Math.round(rating) } };

            scores.updateMany(filter, update);
        }
        const isAngry = Math.random() > 0.5;
        let ratingChange = 0;
        const nameRandomNumber = Math.random();
        let name = '';
        
        if (nameRandomNumber <= 0.33) {
            name = 'Максим Максимович Максимів ака "Дешбордовець"';
        } else if (nameRandomNumber > 0.33 && nameRandomNumber <= 0.67) {
            name = 'Вітальбан Кекандровець ака "Лежу адихаю"'
        } else if (nameRandomNumber > 0.67) {
            name = 'мій творець Максим ака "Безробітний"'
        }
        const start = `Вітаю, мене покликав ${name}. `;

        if (isAngry) {
            if (Math.random() > eventChances.mayorBoost) {
                ctx.reply(`${start}Він повідомив що ви не сплачуєте податки, тому я штрафую вас на 10 соціальних кредитів.`);
                ratingChange = -10;
            } else {
                ctx.reply(`${start}Він поскаржився на те що ви його ображаєте, у звязку з цим я забираю у вас 100 соціальних кредитів.`);
                ratingChange = -100;
            }
            ctx.replyWithSticker(stickersIds.mayorPenalty.id);
        } else {
            if (Math.random() > eventChances.mayorBoost) {
                ctx.reply(`${start}Він повідомив що ви тут обсираєте москалів і Путіна, за це, я вам накину по 10 балів. Слава Україні!`);
                ratingChange = 10;
            } else {
                ratingChange = Math.random() * 400 + 100;
                ctx.reply(`${start}Він повідомив мені гарну новину, тому за кожного москаля що помер сьогодні на нашій землі я вам накину по 1 балу. Сьогодні ви отримуєте +${ratingChange} соціальних кредитів кожен.`);
            }
            ctx.replyWithSticker(stickersIds.mayorBonus.id);
        }
        updateDocs(ratingChange);
    }
}