/*
  Warnings:

  - Added the required column `userId` to the `InstagramOAuthAccount` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InstagramOAuthAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "instagramUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "accessTokenEnc" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InstagramOAuthAccount" ("accessTokenEnc", "createdAt", "id", "instagramUserId", "lastError", "profilePictureUrl", "tokenExpiresAt", "updatedAt", "username") SELECT "accessTokenEnc", "createdAt", "id", "instagramUserId", "lastError", "profilePictureUrl", "tokenExpiresAt", "updatedAt", "username" FROM "InstagramOAuthAccount";
DROP TABLE "InstagramOAuthAccount";
ALTER TABLE "new_InstagramOAuthAccount" RENAME TO "InstagramOAuthAccount";
CREATE INDEX "InstagramOAuthAccount_userId_createdAt_idx" ON "InstagramOAuthAccount"("userId", "createdAt");
CREATE UNIQUE INDEX "InstagramOAuthAccount_userId_instagramUserId_key" ON "InstagramOAuthAccount"("userId", "instagramUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
