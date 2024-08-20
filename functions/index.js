import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';

const app = express();

app.get('/hello-world', (req, res) => {
  res.send('Hello, World!');
});

export const api = onRequest(app);
