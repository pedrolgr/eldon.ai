/*
  Warnings:

  - You are about to drop the column `owner_id` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the `bot_config` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `discord_channel_id` to the `servers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `servers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bot_config" DROP CONSTRAINT "bot_config_server_id_fkey";

-- DropForeignKey
ALTER TABLE "servers" DROP CONSTRAINT "servers_owner_id_fkey";

-- AlterTable
ALTER TABLE "servers" DROP COLUMN "owner_id",
ADD COLUMN     "discord_channel_id" TEXT NOT NULL,
ADD COLUMN     "discord_channel_name" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "bot_config";
