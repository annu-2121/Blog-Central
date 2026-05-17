import { Router } from "express";
import { db, postsTable, commentsTable, usersTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { CreatePostBody, UpdatePostBody, GetPostParams, UpdatePostParams, DeletePostParams } from "@workspace/api-zod";

const router = Router();

router.get("/posts", async (req, res) => {
  try {
    const posts = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        authorId: postsTable.authorId,
        authorName: sql<string>`COALESCE(${usersTable.firstName} || ' ' || ${usersTable.lastName}, ${usersTable.email}, 'Anonymous')`,
        authorImageUrl: usersTable.profileImageUrl,
        createdAt: postsTable.createdAt,
        commentCount: sql<number>`CAST(COUNT(${commentsTable.id}) AS INTEGER)`,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .leftJoin(commentsTable, eq(postsTable.id, commentsTable.postId))
      .groupBy(postsTable.id, usersTable.id)
      .orderBy(desc(postsTable.createdAt));

    const result = posts.map((p) => ({
      ...p,
      excerpt: p.content.substring(0, 200) + (p.content.length > 200 ? "..." : ""),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/posts/recent", async (req, res) => {
  try {
    const posts = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        authorId: postsTable.authorId,
        authorName: sql<string>`COALESCE(${usersTable.firstName} || ' ' || ${usersTable.lastName}, ${usersTable.email}, 'Anonymous')`,
        authorImageUrl: usersTable.profileImageUrl,
        createdAt: postsTable.createdAt,
        commentCount: sql<number>`CAST(COUNT(${commentsTable.id}) AS INTEGER)`,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .leftJoin(commentsTable, eq(postsTable.id, commentsTable.postId))
      .groupBy(postsTable.id, usersTable.id)
      .orderBy(desc(postsTable.createdAt))
      .limit(5);

    const result = posts.map((p) => ({
      ...p,
      excerpt: p.content.substring(0, 200) + (p.content.length > 200 ? "..." : ""),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get recent posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/posts/stats", async (req, res) => {
  try {
    const [postCountResult] = await db.select({ count: count() }).from(postsTable);
    const [commentCountResult] = await db.select({ count: count() }).from(commentsTable);
    const [authorCountResult] = await db
      .selectDistinct({ authorId: postsTable.authorId })
      .from(postsTable);

    const authorsResult = await db
      .selectDistinct({ authorId: postsTable.authorId })
      .from(postsTable);

    res.json({
      totalPosts: postCountResult?.count ?? 0,
      totalComments: commentCountResult?.count ?? 0,
      totalAuthors: authorsResult.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/posts/:id", async (req, res) => {
  const parsed = GetPostParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  try {
    const [post] = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        authorId: postsTable.authorId,
        authorName: sql<string>`COALESCE(${usersTable.firstName} || ' ' || ${usersTable.lastName}, ${usersTable.email}, 'Anonymous')`,
        authorImageUrl: usersTable.profileImageUrl,
        createdAt: postsTable.createdAt,
        updatedAt: postsTable.updatedAt,
        commentCount: sql<number>`CAST(COUNT(${commentsTable.id}) AS INTEGER)`,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .leftJoin(commentsTable, eq(postsTable.id, commentsTable.postId))
      .where(eq(postsTable.id, parsed.data.id))
      .groupBy(postsTable.id, usersTable.id);

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json(post);
  } catch (err) {
    req.log.error({ err }, "Failed to get post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/posts", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const user = req.user as { id: string };

  try {
    const [post] = await db
      .insert(postsTable)
      .values({ title: parsed.data.title, content: parsed.data.content, authorId: user.id })
      .returning();

    const [fullPost] = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        authorId: postsTable.authorId,
        authorName: sql<string>`COALESCE(${usersTable.firstName} || ' ' || ${usersTable.lastName}, ${usersTable.email}, 'Anonymous')`,
        authorImageUrl: usersTable.profileImageUrl,
        createdAt: postsTable.createdAt,
        updatedAt: postsTable.updatedAt,
        commentCount: sql<number>`CAST(0 AS INTEGER)`,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .where(eq(postsTable.id, post.id));

    res.status(201).json(fullPost);
  } catch (err) {
    req.log.error({ err }, "Failed to create post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/posts/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const paramsParsed = UpdatePostParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  const bodyParsed = UpdatePostBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const user = req.user as { id: string };

  try {
    const [existing] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, paramsParsed.data.id));

    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (existing.authorId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db
      .update(postsTable)
      .set(bodyParsed.data)
      .where(eq(postsTable.id, paramsParsed.data.id));

    const [fullPost] = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        authorId: postsTable.authorId,
        authorName: sql<string>`COALESCE(${usersTable.firstName} || ' ' || ${usersTable.lastName}, ${usersTable.email}, 'Anonymous')`,
        authorImageUrl: usersTable.profileImageUrl,
        createdAt: postsTable.createdAt,
        updatedAt: postsTable.updatedAt,
        commentCount: sql<number>`CAST(COUNT(${commentsTable.id}) AS INTEGER)`,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .leftJoin(commentsTable, eq(postsTable.id, commentsTable.postId))
      .where(eq(postsTable.id, paramsParsed.data.id))
      .groupBy(postsTable.id, usersTable.id);

    res.json(fullPost);
  } catch (err) {
    req.log.error({ err }, "Failed to update post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/posts/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = DeletePostParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  const user = req.user as { id: string };

  try {
    const [existing] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, parsed.data.id));

    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (existing.authorId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(postsTable).where(eq(postsTable.id, parsed.data.id));

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete post");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
