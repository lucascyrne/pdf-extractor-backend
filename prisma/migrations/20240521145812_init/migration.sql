-- CreateTable
CREATE TABLE "PDFData" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "PDFData_pkey" PRIMARY KEY ("id")
);
