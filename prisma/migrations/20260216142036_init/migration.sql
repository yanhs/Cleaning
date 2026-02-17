-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "CleanerAvailability" AS ENUM ('available', 'on_job', 'unavailable', 'day_off', 'sick_leave');

-- CreateEnum
CREATE TYPE "CleaningSpecialization" AS ENUM ('residential', 'commercial', 'deep_clean', 'move_in_out', 'post_construction', 'carpet', 'window', 'sanitization');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('cleared', 'pending', 'expired');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('residential', 'commercial');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'assigned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'reassigning');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "RecurrencePattern" AS ENUM ('one_time', 'weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'partial', 'paid', 'refunded');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('order_assigned', 'order_cancelled', 'order_completed', 'cleaner_cancelled', 'replacement_found', 'replacement_failed', 'shift_reminder', 'rating_received', 'system_alert');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('in_app', 'sms', 'email', 'push');

-- CreateEnum
CREATE TYPE "AssignmentRuleType" AS ENUM ('proximity', 'availability', 'specialization', 'rating', 'overtime_prevention', 'client_preference', 'workload_balance', 'cost_optimization');

-- CreateTable
CREATE TABLE "cleaners" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "availability" "CleanerAvailability" NOT NULL DEFAULT 'available',
    "specializations" "CleaningSpecialization"[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "backgroundCheckDate" TIMESTAMP(3),
    "backgroundCheckStatus" "BackgroundCheckStatus" NOT NULL DEFAULT 'pending',
    "homeLatitude" DOUBLE PRECISION,
    "homeLongitude" DOUBLE PRECISION,
    "homeAddress" TEXT,
    "homeCity" TEXT,
    "homeState" TEXT,
    "homeZipCode" TEXT,
    "serviceRadius" INTEGER NOT NULL DEFAULT 10,
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "zone" TEXT NOT NULL,
    "hoursWorkedThisWeek" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursWorkedThisMonth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "overtimeRate" DOUBLE PRECISION NOT NULL,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancellationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preferredDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "preferredStartTime" TEXT NOT NULL DEFAULT '08:00',
    "preferredEndTime" TEXT NOT NULL DEFAULT '18:00',
    "maxHoursPerWeek" INTEGER NOT NULL DEFAULT 40,
    "noGoZones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "lastOrderDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cleaners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClientType" NOT NULL DEFAULT 'residential',
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "preferredCleanerId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastServiceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "type" "CleaningSpecialization" NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "specialInstructions" TEXT,
    "estimatedDuration" INTEGER NOT NULL,
    "squareFootage" INTEGER,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledStartTime" TEXT NOT NULL,
    "scheduledEndTime" TEXT NOT NULL,
    "actualStartTime" TEXT,
    "actualEndTime" TEXT,
    "recurrence" "RecurrencePattern" NOT NULL DEFAULT 'one_time',
    "assignedCleanerId" TEXT,
    "assignedCleanerName" TEXT,
    "previousCleanerIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "autoAssigned" BOOLEAN NOT NULL DEFAULT false,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "priority" "OrderPriority" NOT NULL DEFAULT 'normal',
    "cancellationReason" TEXT,
    "cancellationTime" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "clientRating" INTEGER,
    "clientFeedback" TEXT,
    "cleanerNotes" TEXT,
    "beforePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "afterPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "channels" "NotificationChannel"[],
    "relatedOrderId" TEXT,
    "relatedCleanerId" TEXT,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 50,
    "type" "AssignmentRuleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_logs" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "triggerReason" TEXT NOT NULL,
    "candidatesContacted" INTEGER NOT NULL DEFAULT 0,
    "candidatesResponded" INTEGER NOT NULL DEFAULT 0,
    "selectedCleanerId" TEXT,
    "selectedCleanerName" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "candidateScores" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cleaners_email_key" ON "cleaners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_clientId_idx" ON "orders"("clientId");

-- CreateIndex
CREATE INDEX "orders_assignedCleanerId_idx" ON "orders"("assignedCleanerId");

-- CreateIndex
CREATE INDEX "orders_scheduledDate_idx" ON "orders"("scheduledDate");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_relatedOrderId_idx" ON "notifications"("relatedOrderId");

-- CreateIndex
CREATE INDEX "assignment_logs_orderId_idx" ON "assignment_logs"("orderId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_assignedCleanerId_fkey" FOREIGN KEY ("assignedCleanerId") REFERENCES "cleaners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_relatedOrderId_fkey" FOREIGN KEY ("relatedOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_relatedCleanerId_fkey" FOREIGN KEY ("relatedCleanerId") REFERENCES "cleaners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_logs" ADD CONSTRAINT "assignment_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_logs" ADD CONSTRAINT "assignment_logs_selectedCleanerId_fkey" FOREIGN KEY ("selectedCleanerId") REFERENCES "cleaners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
