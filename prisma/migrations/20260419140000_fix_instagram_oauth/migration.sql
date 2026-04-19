-- CreateTable
CREATE TABLE "InstagramOAuthAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instagramUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "accessTokenEnc" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "InstagramOAuthAccount_instagramUserId_key" ON "InstagramOAuthAccount"("instagramUserId");
