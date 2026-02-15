const { Telegraf, Markup } = require('telegraf');
const path = require('path');

// ❗ ВСТАВ СВІЙ ТОКЕН
const BOT_TOKEN = '8585469446:AAH12jLiSB6YkAOg9BCqy6UZBk-Fm0udCl4';

const bot = new Telegraf(BOT_TOKEN);
console.log("🤖 Бот TransporterUA запущений");

// ===== /start з картинкою =====
bot.start(async (ctx) => {
    await ctx.replyWithPhoto(
        { source: path.join(__dirname, 'images', 'Welcome.png') },
        {
            caption:
`🚛 *TransporterUA — вантажні перевезення по Україні*

✔️ Надійно  
✔️ Швидко  
✔️ Чесна ціна  

Оберіть дію нижче 👇`,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('📞 Написати менеджеру', 'https://t.me/Transporter_UA_manager')],
                [
                    Markup.button.callback('🚛 Інформація про авто', 'CAR_INFO'),
                    Markup.button.callback('💰 Калькулятор', 'CALC')
                ],
                [Markup.button.callback('📦 Як зробити замовлення?', 'ORDER')]
            ])
        }
    );
});

// ===== Інформація про авто =====
bot.action('CAR_INFO', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(
`🚛 *Наша автівка*

▫️ Вантажопідйомність: *до 2 тонн*  
▫️ Розміри: *4 × 2.2 × 2.1 м*  
▫️ Працюємо по всій Україні 🇺🇦`,
        { parse_mode: 'Markdown' }
    );
});

// ===== Як зробити замовлення =====
bot.action('ORDER', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(
`📦 *Як зробити замовлення?*

1️⃣ Напишіть менеджеру  
2️⃣ Узгодьте деталі  
3️⃣ Ми заберемо вантаж 🚛

👉 https://t.me/Transporter_UA_manager`,
        { parse_mode: 'Markdown' }
    );
});

// ===== Калькулятор =====
const userState = {};

bot.action('CALC', (ctx) => {
    ctx.answerCbQuery();
    userState[ctx.chat.id] = 'WAIT_DISTANCE';
    ctx.reply('📏 Введіть відстань у кілометрах (число):');
});

bot.on('text', (ctx) => {
    const chatId = ctx.chat.id;

    if (userState[chatId] === 'WAIT_DISTANCE') {
        const distance = parseFloat(ctx.message.text.replace(',', '.'));

        if (!isNaN(distance) && distance > 0) {
            const price = distance * 20;
            ctx.reply(`💰 *Вартість:* ${price} грн\n(20 грн / км)`, { parse_mode: 'Markdown' });
            userState[chatId] = null;
        } else {
            ctx.reply('❌ Введіть коректне число');
        }
    }
});

// ===== Запуск =====
bot.launch();