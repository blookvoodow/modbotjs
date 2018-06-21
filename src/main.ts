import { DonBot } from './donbot';

let bot = DonBot({
    username: 'yessiree',
    password: 'YOUR SECRET KEY'
});

bot.init().then(() => {
    bot.getUserId();
});