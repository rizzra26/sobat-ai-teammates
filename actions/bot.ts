"use server"

import { auth } from "@clerk/nextjs/server"
import { and, eq, inArray } from "drizzle-orm"
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

export async function updateBot(botId: string, input: BotInput) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const parsed = botInsertSchema.parse(input)

  const [bot] = await db
    .update(bots)
    .set({
      ...parsed,
      instructions: parsed.instructions?.trim() || null,
    })
    .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
    .returning()

  if (!bot) throw new Error("Bot not found")

  revalidatePath("/", "layout")
  return bot
}

export async function deleteBot(botId: string) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const ownedBot = await db.query.bots.findFirst({
    where: and(eq(bots.id, botId), eq(bots.userId, userId)),
    columns: { id: true },
  })
  if (!ownedBot) throw new Error("Bot not found")

  const botChats = db
    .select({ id: chatMembers.chatId })
    .from(chatMembers)
    .where(eq(chatMembers.botId, botId))

  await db.transaction(async (tx) => {
    await tx
      .delete(chats)
      .where(
        and(
          eq(chats.userId, userId),
          eq(chats.kind, "direct"),
          inArray(chats.id, botChats)
        )
      )
    await tx.delete(bots).where(eq(bots.id, botId))
  })

  revalidatePath("/", "layout")
}
