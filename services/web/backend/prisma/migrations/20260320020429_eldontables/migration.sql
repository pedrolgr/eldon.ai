/*
  Warnings:

  - You are about to drop the `server_admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "server_admins" DROP CONSTRAINT "server_admins_server_id_fkey";

-- DropForeignKey
ALTER TABLE "server_admins" DROP CONSTRAINT "server_admins_user_id_fkey";

-- DropTable
DROP TABLE "server_admins";
