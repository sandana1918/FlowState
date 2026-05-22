import type { Request, Response } from 'express';
import { pool } from '../db/client.js';

export const listDeployments = async (_request: Request, response: Response) => {
  const result = await pool.query(
    'SELECT * FROM deployments ORDER BY received_at DESC LIMIT 100'
  );
  response.json({
    mode: 'real',
    data: result.rows.map((row) => ({
      id: row.id,
      repo: row.repo,
      branch: row.branch,
      commitHash: row.commit_hash,
      commitMessage: row.commit_message,
      author: row.author,
      authorEmail: row.author_email,
      avatarUrl: row.avatar_url ?? undefined,
      pushedAt: new Date(row.pushed_at).toISOString(),
      receivedAt: new Date(row.received_at).toISOString()
    })),
    timestamp: new Date().toISOString()
  });
};

export const getDeployment = async (request: Request, response: Response) => {
  const result = await pool.query('SELECT * FROM deployments WHERE id = $1', [request.params.id]);
  response.json({
    mode: 'real',
    data:
      result.rowCount === 0
        ? null
        : {
            id: result.rows[0].id,
            repo: result.rows[0].repo,
            branch: result.rows[0].branch,
            commitHash: result.rows[0].commit_hash,
            commitMessage: result.rows[0].commit_message,
            author: result.rows[0].author,
            authorEmail: result.rows[0].author_email,
            avatarUrl: result.rows[0].avatar_url ?? undefined,
            pushedAt: new Date(result.rows[0].pushed_at).toISOString(),
            receivedAt: new Date(result.rows[0].received_at).toISOString()
          },
    timestamp: new Date().toISOString()
  });
};
