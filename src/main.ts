/* eslint-disable no-extra-boolean-cast */
import 'source-map-support/register';

import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import { deployApps } from './api';

const app = express();

app.post('/', function (req, res) {
  if (process.env.WEBHOOK_SECRET !== req.headers.WEBHOOK_SECRET) {
    console.log(req.headers.WEBHOOK_SECRET);
    return res.status(400).send('Wrong secret');
  }

  deployApps();
  res.status(200).send('Ok');
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err) console.error(err);
  res.status(500).send('Error');
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.info('Starting listening');
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
