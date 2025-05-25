import TelegramBot from 'node-telegram-bot-api'
import { exec } from 'child_process'
import pg from 'pg'

const token = '7892674628:AAGiUXlYVxa_u6OZ6DC55nQfQ9-iHrnz0kU'

const bot = new TelegramBot(token, { polling: true })

const pool = new pg.Pool({
  user: 'root',
  host: 'localhost',
  database: 'ai_data',
  password: 'root',
  port: 5432,
})

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Choose a command:', {
    reply_markup: {
      keyboard: [['/status', '/data']],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  })
})

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id

  exec('pm2 jlist', (err, stdout) => {
    if (err) return bot.sendMessage(chatId, `Error: ${err.message}`)

    const data = JSON.parse(stdout)
    if (!Array.isArray(data)) return bot.sendMessage(chatId, 'Failed to parse pm2 output')

    let reply = '*PM2 Status:*\n\n'
    for (const proc of data) {
      reply += `*${proc.name}*  |  \`${proc.pm2_env.status}\`  |  🔁 ${proc.pm2_env.restart_time}x  |  🖥 ${proc.monit.cpu}% CPU  |  🧠 ${Math.round(proc.monit.memory / 1024 / 1024)}MB\n`
    }

    bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' })
  })
})

bot.onText(/\/data/, async (msg) => {
  const chatId = msg.chat.id

  try {
    const res = await pool.query('SELECT * FROM sample_data LIMIT 5')
    if (res.rows.length === 0) return bot.sendMessage(chatId, '📭 No data in the table.')

    let reply = '📋 *Top 5 Rows:*\n\n'
    res.rows.forEach((row, i) => {
      reply += `*Row ${i + 1}:*\n`
      for (const [key, value] of Object.entries(row)) {
        reply += `\`${key}\`: ${value}\n`
      }
      reply += '\n'
    })

    bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' })
  } catch (err) {
    bot.sendMessage(chatId, `DB error: ${err.message}`)
  }
})