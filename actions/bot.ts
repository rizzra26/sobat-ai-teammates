"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { bots, botInsertSchema, chatMembers, chats, type BotInput } from "@/db/schema"

export async function createBot(input: BotInput) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const parsed = botInsertSchema.parse(input)

  const [bot] = await db.transaction(async (tx) => {
    const [bot] = await tx
      .insert(bots)
      .values({
        ...parsed,
        userId,
        instructions: parsed.instructions?.trim() || null,
      })
      .returning()

    const [chat] = await tx
      .insert(chats)
      .values({ userId })
      .returning()

    await tx.insert(chatMembers).values({ chatId: chat.id, botId: bot.id })

    return [bot]
  })

  revalidatePath("/", "layout")
  return bot
}
