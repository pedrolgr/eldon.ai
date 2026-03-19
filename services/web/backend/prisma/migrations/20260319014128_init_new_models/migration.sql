-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "discord_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "email" TEXT,
    "avatar_url" TEXT,
    "locale" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servers" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "discord_server_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT,
    "bot_active" BOOLEAN NOT NULL DEFAULT false,
    "bot_added_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_admins" (
    "id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "discord_role_id" TEXT,
    "can_configure" BOOLEAN NOT NULL DEFAULT false,
    "can_view_logs" BOOLEAN NOT NULL DEFAULT true,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "server_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_config" (
    "id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "discord_channel_id" TEXT NOT NULL,
    "discord_channel_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sensitivity_level" INTEGER NOT NULL DEFAULT 3,
    "auto_transcribe" BOOLEAN NOT NULL DEFAULT true,
    "keyword_filters" TEXT[],
    "alert_webhook_url" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flagged_messages" (
    "id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "discord_user_id" TEXT NOT NULL,
    "discord_username" TEXT NOT NULL,
    "discord_channel_id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "audio_url" TEXT,
    "reason" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'LOW',
    "confidence_score" DOUBLE PRECISION,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flagged_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_discord_id_key" ON "users"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "servers_discord_server_id_key" ON "servers"("discord_server_id");

-- CreateIndex
CREATE UNIQUE INDEX "server_admins_server_id_user_id_key" ON "server_admins"("server_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bot_config_server_id_key" ON "bot_config"("server_id");

-- CreateIndex
CREATE INDEX "flagged_messages_server_id_idx" ON "flagged_messages"("server_id");

-- CreateIndex
CREATE INDEX "flagged_messages_created_at_idx" ON "flagged_messages"("created_at");

-- CreateIndex
CREATE INDEX "flagged_messages_severity_idx" ON "flagged_messages"("severity");

-- CreateIndex
CREATE INDEX "flagged_messages_reviewed_idx" ON "flagged_messages"("reviewed");

-- AddForeignKey
ALTER TABLE "servers" ADD CONSTRAINT "servers_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_admins" ADD CONSTRAINT "server_admins_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "server_admins" ADD CONSTRAINT "server_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_config" ADD CONSTRAINT "bot_config_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagged_messages" ADD CONSTRAINT "flagged_messages_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagged_messages" ADD CONSTRAINT "flagged_messages_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
