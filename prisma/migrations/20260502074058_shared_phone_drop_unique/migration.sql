-- DropIndex
DROP INDEX "users_phone_key";

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");
