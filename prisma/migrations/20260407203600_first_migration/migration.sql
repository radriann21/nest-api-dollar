-- CreateEnum
CREATE TYPE "Trend" AS ENUM ('UP', 'DOWN', 'STABLE');

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "trend" "Trend" NOT NULL,
    "variantion" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sources" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastPrice" DECIMAL(18,4),
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "Sources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
