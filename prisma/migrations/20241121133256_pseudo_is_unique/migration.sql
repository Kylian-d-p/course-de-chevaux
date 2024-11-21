/*
  Warnings:

  - A unique constraint covering the columns `[pseudo]` on the table `players` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `players_pseudo_key` ON `players`(`pseudo`);
