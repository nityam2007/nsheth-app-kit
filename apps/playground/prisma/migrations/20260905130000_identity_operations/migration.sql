-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "disabledAt" TIMESTAMP(3),
ADD COLUMN     "githubId" TEXT;

-- CreateTable
CREATE TABLE "OauthAttempt" (
    "stateHash" TEXT NOT NULL,
    "verifier" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OauthAttempt_pkey" PRIMARY KEY ("stateHash")
);

-- CreateTable
CREATE TABLE "RequestThrottle" (
    "key" TEXT NOT NULL,
    "hits" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestThrottle_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PrivacyRequest" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivacyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestThrottle_expiresAt_idx" ON "RequestThrottle"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
