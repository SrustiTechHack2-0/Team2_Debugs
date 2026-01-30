import express from 'express';
import { PORT } from './config/env.js';
import connectToDatabase from './database/db.js';
import authRouter from './routes/auth.routes.js';
import aiRouter from './routes/ai.routes.js';

const app = express();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/ai', aiRouter)

app.get('/', (req, res) => {
    res.send('Welcome to SentinelFlow\'s backend.');
});

app.listen(PORT, async () => {
    console.log(`Backend is running on http//:localhost:${PORT}`);

    await connectToDatabase();
});

export default app;