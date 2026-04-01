-- AlterTable
ALTER TABLE "flagged_messages" ADD COLUMN "audio_mp3" BYTEA;

-- Backfill existing rows before setting NOT NULL
UPDATE "flagged_messages"
SET "audio_mp3" = E'\\x'
WHERE "audio_mp3" IS NULL;

-- Enforce required audio payload for new records
ALTER TABLE "flagged_messages" ALTER COLUMN "audio_mp3" SET NOT NULL;
