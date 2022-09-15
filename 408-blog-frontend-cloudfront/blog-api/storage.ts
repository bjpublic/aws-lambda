import * as AWS from "aws-sdk";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { Post, PostListItem } from "./models";

import { Database } from "better-sqlite3";
import { createClient } from "@redis/client";

import BetterSqlite3 = require("better-sqlite3");

type RedisClientType = ReturnType<typeof createClient>;

const s3 = process.env.IS_OFFLINE
  ? new AWS.S3({
      accessKeyId: "S3RVER",
      secretAccessKey: "S3RVER",
      endpoint: "http://localhost:4569",
      s3ForcePathStyle: true,
    })
  : new AWS.S3();
const s3BucketName = process.env.BUCKET_NAME!;
const dbS3ObjectKey = "simple-blog.db";
const localDbFile = path.join(os.tmpdir(), dbS3ObjectKey);

export async function insert(post: Post): Promise<boolean> {
  try {
    await doWrite((db) =>
      db
        .prepare(
          `INSERT INTO post (title, content, created, modified) VALUES (@title, @content, @created, NULL)`
        )
        .run(post)
    );
  } catch (error: any) {
    if (/UNIQUE constraint failed: post.title/.test(error.message)) {
      return false;
    }
    throw error;
  }
  return true;
}

export async function select(title: string): Promise<Post | null> {
  const row = await doRead((db) =>
    db.prepare(`SELECT * FROM post WHERE title = @title`).get({ title })
  );
  return row ?? null;
}

export async function update(
  oldTitle: string,
  post: Omit<Post, "created">
): Promise<boolean> {
  const result = await doWrite((db) =>
    db
      .prepare(
        `UPDATE post SET title = @title, content = @content, modified = @modified WHERE title = @oldTitle`
      )
      .run({ ...post, oldTitle })
  );
  return result.changes === 1;
}

export async function remove(title: string): Promise<void> {
  await doWrite((db) =>
    db.prepare(`DELETE FROM post WHERE title = @title`).run({ title })
  );
}

export async function list(): Promise<PostListItem[]> {
  const rows = await doRead((db) =>
    db.prepare(`SELECT title, created FROM post ORDER BY created DESC`).all()
  );
  return rows ?? [];
}

async function s3Exists(bucketName: string, key: string): Promise<boolean> {
  try {
    await s3
      .headObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();
    return true;
  } catch (error: any) {
    if (error.code === "Forbidden" || error.code === "NotFound") {
      return false;
    }
    throw error;
  }
}

async function s3Download(
  bucketName: string,
  key: string,
  localFile: string
): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    s3
      .getObject({
        Bucket: bucketName,
        Key: key,
      })
      .createReadStream()
      .on("error", reject)
      .pipe(
        fs.createWriteStream(localFile).on("close", resolve).on("error", reject)
      )
  );
}

async function s3Upload(
  bucketName: string,
  key: string,
  localFile: string
): Promise<void> {
  await s3
    .putObject({
      Bucket: bucketName,
      Key: key,
      Body: fs.createReadStream(localFile),
    })
    .promise();
}

async function doRead<T>(work: (db: Database) => T): Promise<T | null> {
  if (!(await s3Exists(s3BucketName, dbS3ObjectKey))) {
    return null;
  }
  await s3Download(s3BucketName, dbS3ObjectKey, localDbFile);
  try {
    const db = new BetterSqlite3(localDbFile);
    return work(db);
  } finally {
    fs.unlinkSync(localDbFile);
  }
}

const createTableSQL = `CREATE TABLE post (
  title TEXT NOT NULL PRIMARY KEY,
  content TEXT NOT NULL,
  created TEXT NOT NULL,
  modified TEXT NULL
);
`;

async function doWrite<T>(work: (db: Database) => T): Promise<T> {
  return await doInLock(async () => {
    let db: Database;
    try {
      if (!(await s3Exists(s3BucketName, dbS3ObjectKey))) {
        db = new BetterSqlite3(localDbFile);
        db.exec(createTableSQL);
      } else {
        await s3Download(s3BucketName, dbS3ObjectKey, localDbFile);
        db = new BetterSqlite3(localDbFile);
      }
      const result = work(db);
      await s3Upload(s3BucketName, dbS3ObjectKey, localDbFile);
      return result;
    } finally {
      fs.unlinkSync(localDbFile);
    }
  });
}

const redisUrl = `redis://${
  process.env.IS_OFFLINE ? "127.0.0.1" : process.env.REDIS_HOST
}:6379`;

const waitTimeoutMillis = 3000;
const lockTimeoutMillis = 5000;
const lockRedisKey = "simple-blog-redis-lock";

async function doInLock<T>(work: () => Promise<T>): Promise<T> {
  const client = createClient({ url: redisUrl });
  await client.connect();

  if (!(await acquireLock(client, lockRedisKey))) {
    throw new Error("잠금을 획득할 수 없습니다");
  }
  try {
    return await work();
  } finally {
    await client.del(lockRedisKey);
    await client.quit();
  }
}

async function sleep(millis: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, millis));
}

async function acquireLock(
  client: RedisClientType,
  lockRedisKey: string
): Promise<boolean> {
  const acquireStart = Date.now();
  while (Date.now() - acquireStart < waitTimeoutMillis) {
    const ret = await client.set(lockRedisKey, Date.now().toString(), {
      NX: true,
      PX: lockTimeoutMillis,
    });
    if (ret === "OK") {
      return true;
    }
    await sleep(Math.random() * 30);
  }
  return false;
}
