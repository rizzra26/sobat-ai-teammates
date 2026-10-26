import { createInsertSchema } from "drizzle-zod"
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core"
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
