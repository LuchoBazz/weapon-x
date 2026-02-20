-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "environment_id" VARCHAR(100);

-- CreateTable
CREATE TABLE "environments" (
    "id" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "region" VARCHAR(100) NOT NULL,
    "api_base_url" VARCHAR(500) NOT NULL,
    "api_key" VARCHAR(512) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "environments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_environment_id_idx" ON "projects"("environment_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
