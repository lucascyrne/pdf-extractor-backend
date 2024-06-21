import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InvoiceData {
  clientNumber: string;
  referenceMonth: string;
  energyElectricityQty: number;
  energyElectricityValue: number;
  energySCEEEQty: number;
  energySCEEEValue: number;
  energyCompensatedQty: number;
  energyCompensatedValue: number;
  publicLightingValue: number;
  fileName: string;
}

const extractPDFData = async (filePath: string): Promise<InvoiceData> => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;

  // No DO CLIENTE
  const clientNumberMatch = text.match(/Nº DO CLIENTE\s+Nº DA INSTALAÇÃO\s+(\d{10})/);
  const clientNumber = clientNumberMatch ? clientNumberMatch[1] : '';

  // Mês de referência
  const referenceMonthMatch = text.match(/Vencimento\s+\s+Valor a pagar \(R\$\)\s+(\w+\/\d{4})/);
  const referenceMonth = referenceMonthMatch ? referenceMonthMatch[1] : '';

  // Energia Elétrica
  const energyElectricityMatch = text.match(/Energia ElétricakWh\s+(\d+)\s+[\d.,]+\s+([\d.,]+)/);
  const energyElectricityQty = energyElectricityMatch ? parseFloat(energyElectricityMatch[1].replace(',', '.')) : 0;
  const energyElectricityValue = energyElectricityMatch ? parseFloat(energyElectricityMatch[2].replace('.', '').replace(',', '.')) : 0;

  // Energia SCEE s/ ICMS
  const energySCEEEMatch = text.match(/Energia SCEE s\/ ICMSkWh\s+([\d.,]+)\s+[\d.,]+\s+([\d.,]+)/);
  const energySCEEEQty = energySCEEEMatch ? parseFloat(energySCEEEMatch[1].replace('.', '').replace(',', '.')) : 0;
  const energySCEEEValue = energySCEEEMatch ? parseFloat(energySCEEEMatch[2].replace('.', '').replace(',', '.')) : 0;

  // Energia Compensada GD I
  const energyCompensatedMatch = text.match(/Energia compensada GD IkWh\s+([\d.,]+)\s+[\d.,]+\s+(-?[\d.,]+)/);
  const energyCompensatedQty = energyCompensatedMatch ? parseFloat(energyCompensatedMatch[1].replace('.', '').replace(',', '.')) : 0;
  const energyCompensatedValue = energyCompensatedMatch ? parseFloat(energyCompensatedMatch[2].replace('.', '').replace(',', '.')) : 0;

  // Contrib Ilum Publica Municipal
  const publicLightingMatch = text.match(/Contrib Ilum Publica Municipal\s+([\d.,]+)/);
  const publicLightingValue = publicLightingMatch ? parseFloat(publicLightingMatch[1].replace(',', '.')) : 0;

  return {
    clientNumber,
    referenceMonth,
    energyElectricityQty,
    energyElectricityValue,
    energySCEEEQty,
    energySCEEEValue,
    energyCompensatedQty,
    energyCompensatedValue,
    publicLightingValue,
    fileName: path.basename(filePath)
  };
};

const processInvoices = async () => {
  const baseDir = path.resolve(__dirname, '../faturas');
  const installations = fs.readdirSync(baseDir);

  for (const installation of installations) {
    const installationDir = path.join(baseDir, installation);
    const files = fs.readdirSync(installationDir);

    for (const file of files) {
      if (path.extname(file) === '.pdf') {
        const filePath = path.join(installationDir, file);
        const invoiceData = await extractPDFData(filePath);

        await prisma.invoice.create({
          data: invoiceData,
        });

        console.log(`Processed ${file}`);
      }
    }
  }

  await prisma.$disconnect();
};

processInvoices()
  .then(() => console.log('Finished processing invoices'))
  .catch(error => console.error(error));
