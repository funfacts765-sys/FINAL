import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- ALL GITHUB FEATURES PRESERVED ---
  app.get('/api/auth/github/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
    res.json({ url: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user user:email` });
  });

  app.get('/api/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    try {
      const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }, { headers: { Accept: 'application/json' } });

      const userRes = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${tokenRes.data.access_token}` },
      });

      res.cookie('github_user', JSON.stringify(userRes.data), {
        httpOnly: true, secure: true, sameSite: 'none', maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.send('<html><body><script>window.opener.postMessage({type:"GITHUB_AUTH_SUCCESS"}, "*");window.close();</script></body></html>');
    } catch (e) { res.status(500).send('Auth Failed'); }
  });

  app.get('/api/user/github', (req, res) => {
    res.json(req.cookies.github_user ? JSON.parse(req.cookies.github_user) : null);
  });

  app.post('/api/auth/github/logout', (req, res) => {
    res.clearCookie('github_user', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ success: true });
  });

  // --- SERVING FRONTEND ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(Number(PORT), '0.0.0.0');
}

startServer();
export default startServer;