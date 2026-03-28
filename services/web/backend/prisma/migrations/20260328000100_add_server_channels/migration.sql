-- CreateTable
CREATE TABLE "server_channels" (
    "id" TEXT NOT NULL,
    "server_id" TEXT NOT NULL,
    "discord_channel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "position" INTEGER,
    "parent_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "server_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "server_channels_server_id_discord_channel_id_key" ON "server_channels"("server_id", "discord_channel_id");

-- CreateIndex
CREATE INDEX "server_channels_server_id_idx" ON "server_channels"("server_id");

-- AddForeignKey
ALTER TABLE "server_channels" ADD CONSTRAINT "server_channels_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
