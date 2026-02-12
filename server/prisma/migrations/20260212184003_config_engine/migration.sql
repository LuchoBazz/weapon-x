-- CreateTable
CREATE TABLE "configurations" (
    "id" UUID NOT NULL,
    "project_reference" VARCHAR(100) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "ConfigType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "default_value" JSONB NOT NULL,
    "validation_schema" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "conditions" JSONB NOT NULL,
    "return_value" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "rollout_percentage" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "configurations_project_reference_idx" ON "configurations"("project_reference");

-- CreateIndex
CREATE INDEX "configurations_key_idx" ON "configurations"("key");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_project_reference_key_key" ON "configurations"("project_reference", "key");

-- CreateIndex
CREATE INDEX "rules_configuration_id_idx" ON "rules"("configuration_id");
