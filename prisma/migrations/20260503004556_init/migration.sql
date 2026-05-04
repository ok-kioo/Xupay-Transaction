/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QueueMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InstanceStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "QueueMessage" DROP CONSTRAINT "QueueMessage_messageId_fkey";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "QueueMessage";

-- DropEnum
DROP TYPE "QueueStatus";

-- CreateTable
CREATE TABLE "RegistryInstance" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "instanceName" TEXT NOT NULL,
    "status" "InstanceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistryInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistryInstance_instanceName_key" ON "RegistryInstance"("instanceName");
