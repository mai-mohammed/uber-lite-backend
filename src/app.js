import express from 'express';
import { userRoutes } from './routes/index.js';
const app = express();


app.use(express.json());

app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;