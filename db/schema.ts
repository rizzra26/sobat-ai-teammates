import { relations } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { z } from "zod"

export const bots = pgTable(
  "bots",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    avatar: text("avatar").notNull().$defaultFn(() => nanoid()),
    job: text("job").notNull(),
    instructions: text("instructions"),
    sandboxId: text("sandbox_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (bot) => [index("bots_user_id_idx").on(bot.userId)],
)

export const botInsertSchema = createInsertSchema(bots, {
  name: (schema) =>
    schema
      .trim()
      .min(1, "Name is required")
      .max(50, "Keep the name under 50 characters"),
  job: (schema) =>
    schema
      .trim()
      .min(1, "Job is required")
      .max(100, "Keep the job under 100 characters"),
  avatar: (schema) => schema.trim().min(1, "Shuffle a face first"),
  instructions: (schema) =>
    schema.trim().max(2000, "Keep the instructions under 2000 characters"),
}).omit({ id: true, userId: true, sandboxId: true, createdAt: true })

export type BotInput = z.infer<typeof botInsertSchema>

export const chatKind = pgEnum("chat_kind", ["direct", "group"])

export const chats = pgTable(
  "chats",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id").notNull(),
    kind: chatKind("kind").notNull().default("direct"),
    name: text("name"),
    lastMessagePreview: text("last_message_preview"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (chat) => [index("chats_user_id_idx").on(chat.userId)],
)

export const chatMembers = pgTable(
  "chat_members",
  {
    chatId: text("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    botId: text("bot_id")
      .notNull()
      .references(() => bots.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (chatMember) => [
    primaryKey({ columns: [chatMember.chatId, chatMember.botId] }),
    index("chat_members_bot_id_idx").on(chatMember.botId),
  ],
)

export const botsRelations = relations(bots, ({ many }) => ({
  memberships: many(chatMembers),
}))

export const chatsRelations = relations(chats, ({ many }) => ({
  members: many(chatMembers),
}))

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMembers.chatId],
    references: [chats.id],
  }),
  bot: one(bots, {
    fields: [chatMembers.botId],
    references: [bots.id],
  }),
}))
