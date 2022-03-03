import * as stickersIds from './stickersIds';

export const getMessageForTopUsers = (index: number, username: string, score: number) => {
    const messagesByPlacement = [
        `Наша молодчинка і гордість Китаю @${username} заробив >>${score}<< соціальних кредитів`,
        `За підтримки Даші Корейки, користувач @${username} заробив аж >>${score}<< соціальних кредитів`,
        `Ну і закриває нашу трійку, БОМЖ ДНЯ - @${username}, в якого всього навсього >>${score}<< соціальних кредитів`
    ];

    if (messagesByPlacement[index]) {
        return `${index + 1}. ${messagesByPlacement[index]}`;
    }
    return `${index + 1}. @${username} - ${score}`;
}

export const getMessage = (file_id: string, name: string) => {
    const texts: { [key: string]: string } = {
        [stickersIds.diyaPlusTenId]: `Володя накинув 10 соціальних кредитів користувачу ${name}`,
        [stickersIds.diyaPlusFiftyId]: `Кім Чен Ин розщіпнув ширінку і дістав звідти 50 соціальних кредитів для користувача ${name}`,
        [stickersIds.diyaMinusTenId]: `${name}, з вас штраф, 10 соціальних кредитів. -10 КЕКВ`,
        [stickersIds.diyaMinusFiftyId]: `Ну і крінжа ${name}, я тебе на 50 соціальних кредитів бахну, будеш знав`,
    }

    return texts[file_id];
}