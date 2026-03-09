-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN "emailHash" TEXT;

-- CreateTable
CREATE TABLE "public"."AuthRateLimit" (
  "id" TEXT NOT NULL,
  "failCount" INTEGER NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailHash_key" ON "public"."User" ("emailHash");

-- CreateIndex
CREATE INDEX "AuthRateLimit_blockedUntil_idx" ON "public"."AuthRateLimit" ("blockedUntil");
