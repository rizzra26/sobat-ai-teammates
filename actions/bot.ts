"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { bots, botInsertSchema, type BotInput } from "@/db/schema"

export async function createBot(input: BotInput) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const parsed = botInsertSchema.parse(input)

  const [bot] = await db
    .insert(bots)
    .values({
      ...parsed,
      userId,
      instructions: parsed.instructions?.trim() || null,
    })
    .returning()

  revalidatePath("/")
  return bot
}
