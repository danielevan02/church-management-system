-- CreateTable
CREATE TABLE "volunteer_team_defaults" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_team_defaults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "volunteer_team_defaults_memberId_idx" ON "volunteer_team_defaults"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_team_defaults_teamId_positionId_key" ON "volunteer_team_defaults"("teamId", "positionId");

-- AddForeignKey
ALTER TABLE "volunteer_team_defaults" ADD CONSTRAINT "volunteer_team_defaults_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "volunteer_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_team_defaults" ADD CONSTRAINT "volunteer_team_defaults_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "volunteer_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_team_defaults" ADD CONSTRAINT "volunteer_team_defaults_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
