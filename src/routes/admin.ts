// routes/admin.ts
import { Router } from 'express';
import { exec } from 'child_process';

const adminRouter = Router();

adminRouter.post('/migrate', (req, res) => {
  exec('npx prisma migrate deploy', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send(`exec error: ${error}`);
      return;
    }
    res.send(`stdout: ${stdout}\nstderr: ${stderr}`);
  });
});

adminRouter.post('/process-invoices', (req, res) => {
  exec('npx ts-node src/utils/extractAndStore.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send(`exec error: ${error}`);
      return;
    }
    res.send(`stdout: ${stdout}\nstderr: ${stderr}`);
  });
});

export default adminRouter;
