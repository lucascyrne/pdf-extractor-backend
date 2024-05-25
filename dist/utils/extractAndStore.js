"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const extractPDFData = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const dataBuffer = fs_1.default.readFileSync(filePath);
    const data = yield (0, pdf_parse_1.default)(dataBuffer);
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
        fileName: path_1.default.basename(filePath)
    };
});
const processInvoices = () => __awaiter(void 0, void 0, void 0, function* () {
    const baseDir = path_1.default.resolve(__dirname, '../faturas');
    const installations = fs_1.default.readdirSync(baseDir);
    for (const installation of installations) {
        const installationDir = path_1.default.join(baseDir, installation);
        const files = fs_1.default.readdirSync(installationDir);
        for (const file of files) {
            if (path_1.default.extname(file) === '.pdf') {
                const filePath = path_1.default.join(installationDir, file);
                const invoiceData = yield extractPDFData(filePath);
                yield prisma.invoice.create({
                    data: invoiceData,
                });
                console.log(`Processed ${file}`);
            }
        }
    }
    yield prisma.$disconnect();
});
processInvoices()
    .then(() => console.log('Finished processing invoices'))
    .catch(error => console.error(error));
