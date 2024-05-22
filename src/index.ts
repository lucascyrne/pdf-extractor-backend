import express from 'express';
import { PrismaClient } from '@prisma/client';
import routes from './routes';
import cors from 'cors';

const app = express();

// app.use((req, res, next) => {
//   console.log('CORS middleware called');
//   next();
// });

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
