-- CreateTable
CREATE TABLE "PrivateInstagramAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordEnc" TEXT NOT NULL,
    "sessionJson" TEXT,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivateInstagramAccount_username_key" ON "PrivateInstagramAccount"("username");
