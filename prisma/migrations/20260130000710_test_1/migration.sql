/*
  Warnings:

  - You are about to drop the column `encrypted` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `recipientProviderId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderProviderId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderType` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `diagnoses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `extracted_medical_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `health_facilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `health_insights` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `healthcare_providers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lab_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medical_documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medication_adherence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `screening_reminders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_providers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `visits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vital_signs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wait_times` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recipientId` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Made the column `senderId` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `clerkId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `dateOfBirth` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Province" AS ENUM ('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT');

-- AlterEnum
ALTER TYPE "MedicalSpecialty" ADD VALUE 'INTERNAL_MEDICINE';

-- DropForeignKey
ALTER TABLE "diagnoses" DROP CONSTRAINT "diagnoses_visitId_fkey";

-- DropForeignKey
ALTER TABLE "document_tags" DROP CONSTRAINT "document_tags_documentId_fkey";

-- DropForeignKey
ALTER TABLE "extracted_medical_data" DROP CONSTRAINT "extracted_medical_data_documentId_fkey";

-- DropForeignKey
ALTER TABLE "health_insights" DROP CONSTRAINT "health_insights_userId_fkey";

-- DropForeignKey
ALTER TABLE "lab_results" DROP CONSTRAINT "lab_results_userId_fkey";

-- DropForeignKey
ALTER TABLE "medical_documents" DROP CONSTRAINT "medical_documents_providerId_fkey";

-- DropForeignKey
ALTER TABLE "medical_documents" DROP CONSTRAINT "medical_documents_userId_fkey";

-- DropForeignKey
ALTER TABLE "medication_adherence" DROP CONSTRAINT "medication_adherence_medicationId_fkey";

-- DropForeignKey
ALTER TABLE "medications" DROP CONSTRAINT "medications_prescriberId_fkey";

-- DropForeignKey
ALTER TABLE "medications" DROP CONSTRAINT "medications_userId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipientProviderId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderProviderId_fkey";

-- DropForeignKey
ALTER TABLE "screening_reminders" DROP CONSTRAINT "screening_reminders_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_providers" DROP CONSTRAINT "user_providers_providerId_fkey";

-- DropForeignKey
ALTER TABLE "user_providers" DROP CONSTRAINT "user_providers_userId_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_providerId_fkey";

-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_userId_fkey";

-- DropForeignKey
ALTER TABLE "vital_signs" DROP CONSTRAINT "vital_signs_visitId_fkey";

-- DropForeignKey
ALTER TABLE "wait_times" DROP CONSTRAINT "wait_times_facilityId_fkey";

-- DropIndex
DROP INDEX "messages_recipientProviderId_idx";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "encrypted",
DROP COLUMN "recipientProviderId",
DROP COLUMN "senderProviderId",
DROP COLUMN "senderType",
ADD COLUMN     "recipientId" TEXT NOT NULL,
ALTER COLUMN "senderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailNotifications",
DROP COLUMN "passwordHash",
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL,
ALTER COLUMN "dateOfBirth" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL;

-- DropTable
DROP TABLE "diagnoses";

-- DropTable
DROP TABLE "document_tags";

-- DropTable
DROP TABLE "extracted_medical_data";

-- DropTable
DROP TABLE "health_facilities";

-- DropTable
DROP TABLE "health_insights";

-- DropTable
DROP TABLE "healthcare_providers";

-- DropTable
DROP TABLE "lab_results";

-- DropTable
DROP TABLE "medical_documents";

-- DropTable
DROP TABLE "medication_adherence";

-- DropTable
DROP TABLE "medications";

-- DropTable
DROP TABLE "screening_reminders";

-- DropTable
DROP TABLE "user_providers";

-- DropTable
DROP TABLE "visits";

-- DropTable
DROP TABLE "vital_signs";

-- DropTable
DROP TABLE "wait_times";

-- DropEnum
DROP TYPE "DocumentCategory";

-- DropEnum
DROP TYPE "FacilityType";

-- DropEnum
DROP TYPE "FileType";

-- DropEnum
DROP TYPE "InsightSeverity";

-- DropEnum
DROP TYPE "InsightType";

-- DropEnum
DROP TYPE "SenderType";

-- DropEnum
DROP TYPE "VisitType";

-- DropEnum
DROP TYPE "WaitTimeSource";

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialty" "MedicalSpecialty" NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "province" "Province" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_licenseNumber_province_key" ON "doctors"("licenseNumber", "province");

-- CreateIndex
CREATE UNIQUE INDEX "patients_userId_key" ON "patients"("userId");

-- CreateIndex
CREATE INDEX "messages_recipientId_idx" ON "messages"("recipientId");

-- CreateIndex
CREATE INDEX "messages_isRead_idx" ON "messages"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE INDEX "users_clerkId_idx" ON "users"("clerkId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
