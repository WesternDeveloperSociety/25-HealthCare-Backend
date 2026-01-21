/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'JPG', 'PNG', 'JPEG', 'HEIC');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('MEDICAL_HISTORY', 'MEDICATIONS', 'LAB_RESULTS', 'IMAGING', 'PRESCRIPTIONS', 'REPORTS', 'INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicalSpecialty" AS ENUM ('CARDIOLOGY', 'DERMATOLOGY', 'ENDOCRINOLOGY', 'FAMILY_MEDICINE', 'GASTROENTEROLOGY', 'NEUROLOGY', 'OBSTETRICS_GYNECOLOGY', 'ONCOLOGY', 'OPHTHALMOLOGY', 'ORTHOPEDICS', 'PEDIATRICS', 'PSYCHIATRY', 'RADIOLOGY', 'SURGERY', 'UROLOGY', 'OTHER');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('IN_PERSON', 'TELEMEDICINE', 'EMERGENCY', 'FOLLOW_UP', 'ROUTINE_CHECKUP', 'SPECIALIST_CONSULTATION');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('ABNORMAL_RESULT', 'TREND_IMPROVEMENT', 'TREND_DECLINE', 'MEDICATION_REMINDER', 'SCREENING_DUE', 'FOLLOW_UP_NEEDED', 'GENERAL_TIP');

-- CreateEnum
CREATE TYPE "InsightSeverity" AS ENUM ('INFO', 'WARNING', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('USER', 'PROVIDER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('HOSPITAL', 'EMERGENCY_ROOM', 'URGENT_CARE', 'CLINIC', 'LAB', 'IMAGING_CENTER', 'PHARMACY', 'SPECIALIST_OFFICE');

-- CreateEnum
CREATE TYPE "WaitTimeSource" AS ENUM ('CROWD_SOURCED', 'OFFICIAL', 'PREDICTED');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profileImage" TEXT;

-- CreateTable
CREATE TABLE "medical_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "ocrText" TEXT,
    "ocrProcessed" BOOLEAN NOT NULL DEFAULT false,
    "ocrConfidence" DOUBLE PRECISION,
    "category" "DocumentCategory" NOT NULL,
    "specialty" "MedicalSpecialty",
    "documentDate" TIMESTAMP(3),
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_tags" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,
    "tagValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_medical_data" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "extractedFields" JSONB NOT NULL,
    "testName" TEXT,
    "testValue" TEXT,
    "referenceRange" TEXT,
    "doctorName" TEXT,
    "clinicName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracted_medical_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "visitType" "VisitType" NOT NULL,
    "providerId" TEXT,
    "chiefComplaint" TEXT,
    "summaryGenerated" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "keyFindings" TEXT[],
    "hasAbnormalFindings" BOOLEAN NOT NULL DEFAULT false,
    "newMedications" BOOLEAN NOT NULL DEFAULT false,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "oxygenSaturation" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testCode" TEXT,
    "resultValue" TEXT NOT NULL,
    "resultUnit" TEXT,
    "referenceMin" DOUBLE PRECISION,
    "referenceMax" DOUBLE PRECISION,
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "flags" TEXT[],
    "testDate" TIMESTAMP(3) NOT NULL,
    "labName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prescriberId" TEXT,
    "refillsRemaining" INTEGER,
    "nextRefillDate" TIMESTAMP(3),
    "adherenceRate" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_adherence" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "takenDate" TIMESTAMP(3),
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_adherence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "InsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "InsightSeverity" NOT NULL,
    "relatedDataType" TEXT,
    "relatedDataId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "screeningType" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedDate" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screening_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "healthcare_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" "MedicalSpecialty",
    "npi" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "faxNumber" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "healthcare_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_providers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "relationship" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT,
    "senderType" "SenderType" NOT NULL,
    "recipientProviderId" TEXT,
    "senderProviderId" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "attachments" TEXT[],
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facilityType" "FacilityType" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "services" TEXT[],
    "hoursOfOperation" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wait_times" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "currentWaitMinutes" INTEGER NOT NULL,
    "estimatedWaitMinutes" INTEGER,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "WaitTimeSource" NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hourOfDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wait_times_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medical_documents_userId_category_idx" ON "medical_documents"("userId", "category");

-- CreateIndex
CREATE INDEX "medical_documents_documentDate_idx" ON "medical_documents"("documentDate");

-- CreateIndex
CREATE INDEX "document_tags_documentId_idx" ON "document_tags"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "extracted_medical_data_documentId_key" ON "extracted_medical_data"("documentId");

-- CreateIndex
CREATE INDEX "visits_userId_visitDate_idx" ON "visits"("userId", "visitDate");

-- CreateIndex
CREATE INDEX "diagnoses_visitId_idx" ON "diagnoses"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "vital_signs_visitId_key" ON "vital_signs"("visitId");

-- CreateIndex
CREATE INDEX "lab_results_userId_testDate_idx" ON "lab_results"("userId", "testDate");

-- CreateIndex
CREATE INDEX "lab_results_testName_idx" ON "lab_results"("testName");

-- CreateIndex
CREATE INDEX "medications_userId_isActive_idx" ON "medications"("userId", "isActive");

-- CreateIndex
CREATE INDEX "medication_adherence_medicationId_scheduledDate_idx" ON "medication_adherence"("medicationId", "scheduledDate");

-- CreateIndex
CREATE INDEX "health_insights_userId_isRead_idx" ON "health_insights"("userId", "isRead");

-- CreateIndex
CREATE INDEX "screening_reminders_userId_dueDate_idx" ON "screening_reminders"("userId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "healthcare_providers_npi_key" ON "healthcare_providers"("npi");

-- CreateIndex
CREATE UNIQUE INDEX "user_providers_userId_providerId_key" ON "user_providers"("userId", "providerId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_recipientProviderId_idx" ON "messages"("recipientProviderId");

-- CreateIndex
CREATE INDEX "health_facilities_facilityType_city_state_idx" ON "health_facilities"("facilityType", "city", "state");

-- CreateIndex
CREATE INDEX "health_facilities_latitude_longitude_idx" ON "health_facilities"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "wait_times_facilityId_reportedAt_idx" ON "wait_times"("facilityId", "reportedAt");

-- AddForeignKey
ALTER TABLE "medical_documents" ADD CONSTRAINT "medical_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_documents" ADD CONSTRAINT "medical_documents_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "healthcare_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_tags" ADD CONSTRAINT "document_tags_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "medical_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_medical_data" ADD CONSTRAINT "extracted_medical_data_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "medical_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "healthcare_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_prescriberId_fkey" FOREIGN KEY ("prescriberId") REFERENCES "healthcare_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_adherence" ADD CONSTRAINT "medication_adherence_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_insights" ADD CONSTRAINT "health_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_reminders" ADD CONSTRAINT "screening_reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_providers" ADD CONSTRAINT "user_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_providers" ADD CONSTRAINT "user_providers_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "healthcare_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientProviderId_fkey" FOREIGN KEY ("recipientProviderId") REFERENCES "healthcare_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderProviderId_fkey" FOREIGN KEY ("senderProviderId") REFERENCES "healthcare_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wait_times" ADD CONSTRAINT "wait_times_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "health_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
