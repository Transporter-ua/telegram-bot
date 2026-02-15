const { Telegraf, Markup } = require('telegraf');
const path = require('path');
const express = require('express');

// ===== Express server (ЩОБ RENDER НЕ ВБИВАВ ПРОЦЕС) =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Telegram bot is running');
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ===== Telegram Bot =====
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не знайдено');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
console.log('🤖 Бот TransporterUA запущений');

// ===== /start з картинкою =====
bot.start(async (ctx) => {
  await ctx.replyWithPhoto(
    { source: path.join(__dirname, 'images', 'Welcome.png') },
    {
      caption: `🚛 *TransporterUA — вантажні перевезення по Україні*

✔️ Надійно  
✔️ Швидко  
✔️ Чесна ціна  

Оберіть дію нижче 👇`,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📞 Написати менеджеру', 'https://t.me/TransporterUAmanager')],
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
bot.action('CAR_INFO', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    `🚛 *Наша автівка*

▫️ Вантажопідйомність: *до 2 тонн*  
▫️ Розміри: *4 × 2.2 × 2.1 м*  
▫️ Працюємо по всій Україні 🇺🇦`,
    { parse_mode: 'Markdown' }
  );
});

// ===== Як зробити замовлення =====
bot.action('ORDER', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
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

bot.action('CALC', async (ctx) => {
  await ctx.answerCbQuery();
  userState[ctx.chat.id] = 'WAIT_DISTANCE';
  await ctx.reply('📏 Введіть відстань у кілометрах (число):');
});

bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;

  if (userState[chatId] === 'WAIT_DISTANCE') {
    const distance = parseFloat(ctx.message.text.replace(',', '.'));

    if (!isNaN(distance) && distance > 0) {
      const price = distance * 20;
      await ctx.reply(
        `💰 *Вартість:* ${price} грн\n(20 грн / км)`,
        { parse_mode: 'Markdown' }
      );
      userState[chatId] = null;
    } else {
      await ctx.reply('❌ Введіть коректне число');
    }
  }
});

// ===== Запуск бота =====
bot.launch();

// ===== Graceful shutdown (ДУЖЕ ВАЖЛИВО ДЛЯ RENDER) =====
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));