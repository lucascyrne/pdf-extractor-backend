import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [
        'https://pdf-extractor-app.uc.r.appspot.com',
        'https://pdf-extractor-react-d87ce.web.app',
      ]
    : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
