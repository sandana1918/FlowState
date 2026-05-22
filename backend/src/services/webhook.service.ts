import crypto from 'node:crypto';
import { pool } from '../db/client.js';
import { env } from '../config/env.js';
import { socketHandler } from '../socket/socketHandler.js';
import type { DeploymentRecord } from '../types/incident.types.js';
import {
  deploymentsReceivedTotal,
  webhookSignatureFailuresTotal
} from '../monitoring/prometheus.js';

interface GithubPushPayload {
  ref?: string;
  repository?: {
    full_name?: string;
    name?: string;
  };
  head_commit?: {
    id?: string;
    message?: string;
    timestamp?: string;
    author?: {
      name?: string;
      email?: string;
    };
  };
  pusher?: {
    name?: string;
  };
  sender?: {
    avatar_url?: string;
  };
}

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
      webhookSignatureFailuresTotal.inc();
      return false;
    }
  }

  isPushPayload(payload: unknown): payload is GithubPushPayload {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as GithubPushPayload;
    return (
      typeof candidate.ref === 'string' &&
      candidate.ref.startsWith('refs/heads/') &&
      typeof candidate.head_commit?.id === 'string' &&
      candidate.head_commit.id.length > 0
    );
  }

  async storePushEvent(payload: GithubPushPayload) {
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
      `INSERT INTO deployments (repo, branch, commit_hash, commit_message, author, author_email, avatar_url, pushed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        deployment.repo,
        deployment.branch,
        deployment.commitHash,
        deployment.commitMessage,
        deployment.author,
        deployment.authorEmail,
        deployment.avatarUrl ?? null,
        deployment.pushedAt
      ]
    );

    const row = result.rows[0];
    const saved = {
      ...deployment,
      id: row.id,
      receivedAt: new Date(row.received_at).toISOString()
    };
    deploymentsReceivedTotal.inc({
      repo: saved.repo,
      branch: saved.branch
    });
    socketHandler.emitDeploymentReceived(saved);
    return saved;
  }
}

export const webhookService = new WebhookService();
