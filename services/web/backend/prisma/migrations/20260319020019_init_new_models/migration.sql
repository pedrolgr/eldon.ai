/*
  Warnings:

  - You are about to drop the column `alert_webhook_url` on the `bot_config` table. All the data in the column will be lost.
  - You are about to drop the column `auto_transcribe` on the `bot_config` table. All the data in the column will be lost.
  - You are about to drop the column `keyword_filters` on the `bot_config` table. All the data in the column will be lost.
  - You are about to drop the column `sensitivity_level` on the `bot_config` table. All the data in the column will be lost.
  - You are about to drop the column `audio_url` on the `flagged_messages` table. All the data in the column will be lost.
  - You are about to drop the column `confidence_score` on the `flagged_messages` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `flagged_messages` table. All the data in the column will be lost.
  - You are about to drop the column `can_configure` on the `server_admins` table. All the data in the column will be lost.
  - You are about to drop the column `can_view_logs` on the `server_admins` table. All the data in the column will be lost.
  - You are about to drop the column `discord_role_id` on the `server_admins` table. All the data in the column will be lost.
  - You are about to drop the column `granted_at` on the `server_admins` table. All the data in the column will be lost.
  - You are about to drop the column `icon_url` on the `servers` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `discriminator` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "flagged_messages_severity_idx";

-- AlterTable
ALTER TABLE "bot_config" DROP COLUMN "alert_webhook_url",
DROP COLUMN "auto_transcribe",
DROP COLUMN "keyword_filters",
DROP COLUMN "sensitivity_level";

-- AlterTable
ALTER TABLE "flagged_messages" DROP COLUMN "audio_url",
DROP COLUMN "confidence_score",
DROP COLUMN "severity";

-- AlterTable
ALTER TABLE "server_admins" DROP COLUMN "can_configure",
DROP COLUMN "can_view_logs",
DROP COLUMN "discord_role_id",
DROP COLUMN "granted_at";

-- AlterTable
ALTER TABLE "servers" DROP COLUMN "icon_url";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar_url",
DROP COLUMN "discriminator";

-- DropEnum
DROP TYPE "Severity";
