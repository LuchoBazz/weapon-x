-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "project_reference" VARCHAR(100) NOT NULL,
    "authentication_id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity_type" "AuditEntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "actor_email" VARCHAR(255) NOT NULL,
    "previous_value" JSONB NOT NULL DEFAULT '{}',
    "new_value" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_project_reference_idx" ON "audit_logs"("project_reference");

-- CreateIndex
CREATE INDEX "audit_logs_authentication_id_idx" ON "audit_logs"("authentication_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
