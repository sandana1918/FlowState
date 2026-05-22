import express from 'express';
import { Router } from 'express';
import { handleGithubWebhook } from '../controllers/webhook.controller.js';

export const webhookRouter = Router();
webhookRouter.post('/github', express.raw({ type: 'application/json' }), handleGithubWebhook);

