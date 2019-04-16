import { DonBot } from './donbot';

let bot = DonBot({
    username: 'yessiree',
    password: 'Bthebeginn1ng'
});

bot.init().then(() => {
    bot.getUserId();
});