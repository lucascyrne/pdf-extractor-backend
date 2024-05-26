import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { Storage } from '@google-cloud/storage';

const router = Router();
const prisma = new PrismaClient();
const storage = new Storage();

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

// Helper function to find file in subdirectories locally
const findFileInSubdirectoriesLocal = (
  dir: string,
  file: string
): string | null => {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.lstatSync(fullPath).isDirectory()) {
      const found = findFileInSubdirectoriesLocal(fullPath, file);
      if (found) {
        return found;
      }
    } else if (item === file) {
      return fullPath;
    }
  }
  return null;
};

// Helper function to find file in subdirectories in GCS
const findFileInSubdirectoriesGCS = async (
  bucketName: string,
  prefix: string,
  fileName: string
): Promise<string | null> => {
  const [files] = await storage.bucket(bucketName).getFiles({ prefix });
  for (const file of files) {
    if (file.name.endsWith(fileName)) {
      return file.name;
    }
  }
  return null;
};

// Route to download an invoice
router.get(
  '/invoices/download/:fileName',
  cors(corsOptions),
  async (req, res) => {
    const fileName = req.params.fileName;

    if (process.env.NODE_ENV === 'production') {
      const bucketName = 'YOUR_BUCKET_NAME'; // Substitua pelo nome do seu bucket
      const prefix = 'faturas/'; // Prefixo do diretório dentro do bucket
      console.log(
        `Attempting to download file: ${fileName} from bucket: ${bucketName} with prefix: ${prefix}`
      );

      try {
        const filePath = await findFileInSubdirectoriesGCS(
          bucketName,
          prefix,
          fileName
        );
        if (!filePath) {
          console.error(`File not found: ${fileName}`);
          return res.status(404).send('File not found');
        }

        const file = storage.bucket(bucketName).file(filePath);
        const readStream = file.createReadStream();
        readStream.on('error', (err) => {
          console.error(`Error reading file: ${err}`);
          return res.status(500).send('Error reading file');
        });

        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${fileName}`
        );
        readStream.pipe(res);
      } catch (error) {
        console.error(`Error downloading file: ${error}`);
        res.status(500).send('Error downloading file');
      }
    } else {
      const baseDir = path.join(__dirname, '../faturas');

      console.log(`Base directory: ${baseDir}`);
      console.log(`File requested: ${fileName}`);

      if (!fs.existsSync(baseDir)) {
        console.error(`Base directory ${baseDir} not found`);
        return res.status(404).send('Base directory not found');
      }

      const filePath = findFileInSubdirectoriesLocal(baseDir, fileName);
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
    }
  }
);

export default router;
