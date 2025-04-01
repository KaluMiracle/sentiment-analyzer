/*
  Warnings:

  - A unique constraint covering the columns `[facebookId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platform` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "platform" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "facebookId" TEXT,
ALTER COLUMN "instagramId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_facebookId_key" ON "User"("facebookId");
