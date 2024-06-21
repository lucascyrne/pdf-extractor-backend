/*
  Warnings:

  - You are about to drop the `PDFData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PDFData";

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "clientNumber" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "energyElectricityQty" DOUBLE PRECISION NOT NULL,
    "energyElectricityValue" DOUBLE PRECISION NOT NULL,
    "energySCEEEQty" DOUBLE PRECISION NOT NULL,
    "energySCEEEValue" DOUBLE PRECISION NOT NULL,
    "energyCompensatedQty" DOUBLE PRECISION NOT NULL,
    "energyCompensatedValue" DOUBLE PRECISION NOT NULL,
    "publicLightingValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
