import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Invite endpoint
app.post('/api/invite', async (req, res) => {
    try {
        const { email, inviterId } = req.body ?? {};
        if (typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email' });
        }
        if (!inviterId || typeof inviterId !== 'string') {
            return res.status(400).json({ message: 'Invalid inviterId' });
        }

        const smtpConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT || 465),
            secure: String(process.env.SMTP_SECURE || 'true') === 'true',
            auth: {
                user: process.env.SMTP_USER || 'atom@levelingupdata.com',
                pass: process.env.SMTP_PASS || 'tblmdineodbegxge',
            },
            from: process.env.SMTP_FROM || 'hello@levelingupdata.com',
        };

        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            auth: smtpConfig.auth,
        });

        const loginUrl = process.env.INVITE_LOGIN_URL || 'https://starfish.levelingupdata.com/';
        const subject = `You're invited to join`;
        const textBody = `You've been invited. Click the link to sign up or log in: ${loginUrl}`;
        const htmlBody = `
		  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6;">
			<h2>You're invited</h2>
			<p>You have been invited by user <strong>${email}</strong>.</p>
			<p>Click the button below to sign up or log in:</p>
			<p>
			  <a href="${loginUrl}"
				 style="display:inline-block;background:#111827;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
				Open Login / Signup
			  </a>
			</p>
			<p>If the button doesn't work, copy and paste this URL into your browser:<br/>
			  <a href="${loginUrl}">${loginUrl}</a>
			</p>
		  </div>
		`;

        await transporter.sendMail({
            from: smtpConfig.from,
            to: email,
            subject,
            text: textBody,
            html: htmlBody,
        });

        res.json({ status: 'sent', email, inviterId, timestamp: new Date().toISOString() });
    } catch (err) {
        const message = err?.message || 'Invite failed';
        res.status(500).json({ message });
    }
});

// Serve static built frontend
const publicDir = path.join(__dirname, 'dist', 'public');
app.use(express.static(publicDir));

// SPA fallback (non-API requests)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    res.status(200).send('<!doctype html><title>LUD-SaaS</title><h1>Build not found</h1>');
});

app.listen({ port, host: '0.0.0.0' }, () => {
    console.log(`[express] serving on http://0.0.0.0:${port}`);
});
