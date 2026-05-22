export interface Deployment {
  id?: string;
  repo: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  authorEmail: string;
  avatarUrl?: string;
  pushedAt: string;
  receivedAt?: string;
}

