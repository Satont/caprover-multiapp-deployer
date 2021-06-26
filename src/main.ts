/* eslint-disable no-extra-boolean-cast */
import 'source-map-support/register';

import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { deployApps } from './api';

const app = express();

const sigHeaderName = 'X-Hub-Signature-256';
const sigHashAlg = 'sha256';

app.use(
  express.json({
    verify: (req: Request, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || ('utf8' as any));
      }
    },
  }),
);

function verifyPostData(req: Request, res: Response, next: NextFunction) {
  if (!req.rawBody) {
    return next('Request body empty');
  }

  const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
  const hmac = crypto.createHmac(sigHashAlg, process.env.WEBHOOK_SECRET);
  const digest = Buffer.from(sigHashAlg + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8');
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`);
  }

  return next();
}

app.post('/', verifyPostData, function (req, res) {
  deployApps();
  res.status(200).send('Ok');
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err) console.error(err);
  res.status(403).send('Request body was not signed or verification failed');
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.info('Starting listening');
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
