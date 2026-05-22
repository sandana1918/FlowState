import crypto from 'node:crypto';
import { pool } from '../db/client.js';
import { env } from '../config/env.js';
import { socketHandler } from '../socket/socketHandler.js';
import type { DeploymentRecord } from '../types/incident.types.js';

export class WebhookService {
  verifySignature(signature: string | undefined, rawBody: Buffer) {
    if (!signature) {
      return false;
    }
    const digest = `sha256=${crypto
      .createHmac('sha256', env.GITHUB_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')}`;

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch {
      return false;
    }
  }

  async storePushEvent(payload: Record<string, any>) {
    const deployment: DeploymentRecord = {
      repo: payload.repository?.full_name ?? payload.repository?.name ?? 'unknown',
      branch: String(payload.ref ?? '').replace('refs/heads/', ''),
      commitHash: payload.head_commit?.id ?? '',
      commitMessage: payload.head_commit?.message ?? '',
      author: payload.head_commit?.author?.name ?? payload.pusher?.name ?? 'unknown',
      authorEmail: payload.head_commit?.author?.email ?? '',
      avatarUrl: payload.sender?.avatar_url,
      pushedAt: payload.head_commit?.timestamp ?? new Date().toISOString()
    };

    const result = await pool.query(
      `INSERT INTO deployments (repo, branch, commit_hash, commit_message, author, author_email, pushed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        deployment.repo,
        deployment.branch,
        deployment.commitHash,
        deployment.commitMessage,
        deployment.author,
        deployment.authorEmail,
        deployment.pushedAt
      ]
    );

    const row = result.rows[0];
    const saved = {
      ...deployment,
      id: row.id,
      receivedAt: new Date(row.received_at).toISOString()
    };
    socketHandler.emitDeploymentReceived(saved);
    return saved;
  }
}

export const webhookService = new WebhookService();

