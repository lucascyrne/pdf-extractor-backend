import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const router = Router();
const prisma = new PrismaClient();

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

router.use(cors(corsOptions));

// Route to get all invoices
router.get('/invoices', async (req, res) => {
  const invoices = await prisma.invoice.findMany();
  res.json(invoices);
});

// Route to download an invoice
router.get('/invoices/download/:fileName', cors(corsOptions), (req, res) => {
  const fileName = req.params.fileName;
  const baseDir = path.join(__dirname, '../faturas');

  console.log(`Base directory: ${baseDir}`);
  console.log(`File requested: ${fileName}`);

  const findFileInSubdirectories = (
    dir: string,
    file: string,
    depth: number = 0
  ): string | null => {
    if (depth > 10) {
      console.error(`Reached max directory depth at ${dir}`);
      return null;
    }

    try {
      console.log(`Searching in directory: ${dir}`);
      const files = fs.readdirSync(dir);
      for (const fileOrDir of files) {
        const fullPath = path.join(dir, fileOrDir);
        console.log(`Checking path: ${fullPath}`);
        if (fs.lstatSync(fullPath).isDirectory()) {
          const found = findFileInSubdirectories(fullPath, file, depth + 1);
          if (found) return found;
        } else if (fileOrDir === file) {
          console.log(`File found: ${fullPath}`);
          return fullPath;
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
      return null;
    }
    return null;
  };

  if (!fs.existsSync(baseDir)) {
    console.error(`Base directory ${baseDir} not found`);
    return res.status(404).send('Base directory not found');
  }

  const filePath = findFileInSubdirectories(baseDir, fileName);
  console.log(`File path found: ${filePath}`);

  if (filePath) {
    res.download(filePath, (err) => {
      if (err) {
        console.error(`Error during file download: ${err}`);
        return res.status(500).send('Error during file download');
      }
    });
  } else {
    console.error(`File not found: ${fileName}`);
    res.status(404).send('File not found');
  }
});

export default router;
