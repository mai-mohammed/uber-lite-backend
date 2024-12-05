import express from 'express';
import { userRoutes, fareRoutes, rideRoutes } from './routes/index.js';
const app = express();


app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/rides', rideRoutes);

app.use((err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';

    console.error(err);

    res.status(err.status || 500).json(
        isDev
            ? { error: { message: err.message || 'Internal Server Error', stack: err.stack } }
            : { error: 'Internal Server Error' }
    );
});

export default app;
