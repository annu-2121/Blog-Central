import { pgTable, text, serial, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";
import { postsTable } from "./posts";

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  authorId: varchar("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;
