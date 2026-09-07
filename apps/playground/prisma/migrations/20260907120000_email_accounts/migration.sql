ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT, ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
UPDATE "User" SET "emailVerifiedAt" = "createdAt" WHERE "githubId" IS NOT NULL OR "email" = 'admin@demo.local';
CREATE TABLE "AuthChallenge" (
  "tokenHash" TEXT NOT NULL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "kind" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AuthChallenge_userId_kind_idx" ON "AuthChallenge"("userId", "kind");
CREATE INDEX "AuthChallenge_expiresAt_idx" ON "AuthChallenge"("expiresAt");
