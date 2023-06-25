import { VercelRequest, VercelResponse } from '@vercel/node'
import { Markup, Telegraf } from 'telegraf'
import { ok } from './responses'
import { randomBytes } from 'crypto'
// import { InlineQueryResult } from 'telegraf/types'

const debug = require('debug')('lib:telegram')

const isDev = process.env.DEV

const VERCEL_URL = process.env.VERCEL_URL

const BOT_TOKEN = process.env.BOT_TOKEN || ''

export const bot = new Telegraf(BOT_TOKEN) as any

function botUtils() {
  bot.start(async (ctx) => {
    const randomNumber = Buffer.from(await randomBytes(8))

    const shareMarkup = Markup.inlineKeyboard([
      [Markup.button.switchToChat('Share', randomNumber.toString('hex'))],
    ])
    ctx.reply('Share swap link with your trade partner', {
      reply_markup: shareMarkup.reply_markup,
    })
  })

  bot.on('inline_query', async (ctx) => {
    const emptyResponse = () => {
      ctx.answerInlineQuery([], {
        cache_time: 1,
        is_personal: true,
        switch_pm_parameter: '0',
      })
    }
    if (!ctx.inlineQuery.query) {
      emptyResponse()
    }
    const me = await ctx.telegram.getMe()

    const result = [
      {
        id: ctx.update.update_id.toString(),
        type: 'article',
        title: 'Ton.Ninja',
        description: 'Click here, to send swap link',
        thumb_url: undefined,
        input_message_content: {
          message_text: `Click button below to open swap https://t.me/${me.username}/swap?startapp=${ctx.inlineQuery.query}`,
          parse_mode: 'HTML',
        },
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.button.url(
              `Swap #${ctx.inlineQuery.query}`,
              `https://t.me/${me.username}/swap?startapp=${ctx.inlineQuery.query}`
            ),
          ],
        ]).reply_markup,
      },
    ] as any

    await ctx.answerInlineQuery(result, {
      cache_time: 1,
      is_personal: true,
      switch_pm_parameter: '0',
    })
  })
}

async function localBot() {
  debug('Bot is running in development mode at http://localhost:3000')

  await bot.telegram.deleteWebhook()
}

export async function useWebhook(req: VercelRequest, res: VercelResponse) {
  try {
    if (!isDev && !VERCEL_URL) {
      throw new Error('VERCEL_URL is not set.')
    }

    const getWebhookInfo = await bot.telegram.getWebhookInfo()

    const botInfo = await bot.telegram.getMe()
    console.info('Server has initialized bot username using Webhook. ', botInfo.username)

    if (getWebhookInfo.url !== VERCEL_URL + '/api') {
      debug(`deleting webhook`)
      await bot.telegram.deleteWebhook()
      debug(`setting webhook to ${VERCEL_URL}/api`)
      await bot.telegram.setWebhook(`${VERCEL_URL}/api`)
    }

    // call bot commands and middlware
    botUtils()

    if (req.method === 'POST') {
      await bot.handleUpdate(req.body, res)
    } else {
      ok(res, 'Listening to bot events...')
    }
  } catch (error: any) {
    console.error(error)
    return error.message
  }
}

if (isDev) {
  localBot().then(() => {
    botUtils()

    // launch bot
    bot.launch()
  })
}
