const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const path = require('path');

// ===============================
// 🌐 EXPRESS SERVER (ДЛЯ RENDER)
// ===============================
const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 health endpoint — ДУЖЕ ВАЖЛИВО
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// головна сторінка (необовʼязково)
app.get('/', (req, res) => {
  res.send('🤖 Telegram bot is running');
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ===============================
// 🤖 TELEGRAM BOT
// ===============================
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не знайдено');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
console.log('🤖 Бот TransporterUA запущений');

// ===============================
// /start
// ===============================
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

// ===============================
// 🚛 ІНФО ПРО АВТО
// ===============================
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

// ===============================
// 📦 ЯК ЗАМОВИТИ
// ===============================
bot.action('ORDER', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    `📦 *Як зробити замовлення?*

1️⃣ Напишіть менеджеру  
2️⃣ Узгодьте деталі  
3️⃣ Ми заберемо вантаж 🚛

👉 https://t.me/TransporterUAmanager`,
    { parse_mode: 'Markdown' }
  );
});

// ===============================
// 💰 КАЛЬКУЛЯТОР
// ===============================
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
        `💰 *Вартість:* ${price} грн  
_(20 грн / км)_`,
        { parse_mode: 'Markdown' }
      );

      delete userState[chatId];
    } else {
      await ctx.reply('❌ Введіть коректне число');
    }
  }
});

// ===============================
// ▶️ ЗАПУСК БОТА
// ===============================
bot.launch();

// ===============================
// 🧯 GRACEFUL SHUTDOWN (Render)
// ===============================
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));