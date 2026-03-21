-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "discord_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "locale" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servers" (
    "id" TEXT NOT NULL,
    "discord_server_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discord_channel_id" TEXT NOT NULL,
    "discord_channel_name" TEXT,
    "bot_active" BOOLEAN NOT NULL DEFAULT false,
    "bot_added_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flagged_messages" (
    "id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "discord_user_id" TEXT NOT NULL,
    "discord_username" TEXT NOT NULL,
    "discord_channel_id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "reason" TEXT,
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
CREATE INDEX "flagged_messages_server_id_idx" ON "flagged_messages"("server_id");

-- CreateIndex
CREATE INDEX "flagged_messages_created_at_idx" ON "flagged_messages"("created_at");

-- CreateIndex
CREATE INDEX "flagged_messages_reviewed_idx" ON "flagged_messages"("reviewed");

-- AddForeignKey
ALTER TABLE "flagged_messages" ADD CONSTRAINT "flagged_messages_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flagged_messages" ADD CONSTRAINT "flagged_messages_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
