import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { chats } from "@/db/schema"

export async function getChat(chatId: string) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated || !userId) return null

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    with: {
      members: {
        limit: 1,
        with: { bot: true },
      },
    },
  })

  if (!chat) return null

  const bot = chat.members[0]?.bot

  return {
    id: chat.id,
    name: chat.name ?? bot?.name ?? "New chat",
    avatar: bot?.avatar ?? chat.id,
    job: bot?.job ?? null,
    preview: chat.lastMessagePreview,
    lastMessageAt: chat.lastMessageAt,
    bot: bot
      ? {
          id: bot.id,
          name: bot.name,
          avatar: bot.avatar,
          job: bot.job,
          instructions: bot.instructions,
        }
      : null,
  }
}

export type ChatDetail = NonNullable<Awaited<ReturnType<typeof getChat>>>
