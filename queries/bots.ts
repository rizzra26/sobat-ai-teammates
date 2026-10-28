import { auth } from "@clerk/nextjs/server"
import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { chats } from "@/db/schema"

export async function listChats() {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated || !userId) return []

  const rows = await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: desc(chats.lastMessageAt),
    with: {
      members: {
        limit: 1,
        with: { bot: true },
      },
    },
  })

  return rows.map((chat) => {
    const bot = chat.members[0]?.bot

    return {
      id: chat.id,
      name: chat.name ?? bot?.name ?? "New chat",
      avatar: bot?.avatar ?? chat.id,
      preview: chat.lastMessagePreview,
      lastMessageAt: chat.lastMessageAt,
    }
  })
}

export type ChatSummary = Awaited<ReturnType<typeof listChats>>[number]
