import { Router } from "express";
import { db, commentsTable, postsTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { ListCommentsParams, CreateCommentParams, CreateCommentBody, DeleteCommentParams } from "@workspace/api-zod";

const router = Router();

router.get("/posts/:id/comments", async (req, res) => {
  const parsed = ListCommentsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  try {
    const comments = await db
      .select({
        id: commentsTable.id,
        postId: commentsTable.postId,
        content: commentsTable.content,
        authorId: commentsTable.authorId,
        authorName: sql<string>`COALESCE(${usersTable.firstName} || ' ' || ${usersTable.lastName}, ${usersTable.email}, 'Anonymous')`,
        authorImageUrl: usersTable.profileImageUrl,
        createdAt: commentsTable.createdAt,
      })
      .from(commentsTable)
      .leftJoin(usersTable, eq(commentsTable.authorId, usersTable.id))
      .where(eq(commentsTable.postId, parsed.data.id))
      .orderBy(desc(commentsTable.createdAt));

    res.json(comments);
  } catch (err) {
    req.log.error({ err }, "Failed to list comments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/posts/:id/comments", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const paramsParsed = CreateCommentParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  const bodyParsed = CreateCommentBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const user = req.user as { id: string };

  try {
    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, paramsParsed.data.id));

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const [comment] = await db
      .insert(commentsTable)
      .values({
        postId: paramsParsed.data.id,
        content: bodyParsed.data.content,
        authorId: user.id,
      })
      .returning();

    const [fullComment] = await db
      .select({
        id: commentsTable.id,
        postId: commentsTable.postId,
        content: commentsTable.content,
        authorId: commentsTable.authorId,
        authorName: sql<string>`COALESCE(${usersTable.firstName} || ' ' || ${usersTable.lastName}, ${usersTable.email}, 'Anonymous')`,
        authorImageUrl: usersTable.profileImageUrl,
        createdAt: commentsTable.createdAt,
      })
      .from(commentsTable)
      .leftJoin(usersTable, eq(commentsTable.authorId, usersTable.id))
      .where(eq(commentsTable.id, comment.id));

    res.status(201).json(fullComment);
  } catch (err) {
    req.log.error({ err }, "Failed to create comment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/comments/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = DeleteCommentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid comment id" });
    return;
  }

  const user = req.user as { id: string };

  try {
    const [existing] = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.id, parsed.data.id));

    if (!existing) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (existing.authorId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(commentsTable).where(eq(commentsTable.id, parsed.data.id));

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete comment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
