import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Route to get all invoices
router.get('/invoices', async (req, res) => {
  const invoices = await prisma.invoice.findMany();
  res.json(invoices);
});

// Route to download an invoice
router.get('/invoices/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const baseDir = path.join(__dirname, '../src/faturas');

  // Function to recursively search for the file in subdirectories
  const findFileInSubdirectories = (dir: string, file: string, depth: number = 0): string | null => {
    if (depth > 10) { // Limite de profundidade para evitar loops infinitos
      console.error(`Reached max directory depth at ${dir}`);
      return null;
    }

    try {
      const files = fs.readdirSync(dir);
      for (const fileOrDir of files) {
        const fullPath = path.join(dir, fileOrDir);
        if (fs.lstatSync(fullPath).isDirectory()) {
          const found = findFileInSubdirectories(fullPath, file, depth + 1);
          if (found) return found;
        } else if (fileOrDir === file) {
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

  if (filePath) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

export default router;
