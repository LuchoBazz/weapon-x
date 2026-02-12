-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "permissions" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentications" (
    "id" UUID NOT NULL,
    "project_reference" VARCHAR(100) NOT NULL,
    "role_id" UUID NOT NULL,
    "secret_key" VARCHAR(512) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expiration_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "removed_at" TIMESTAMPTZ,
    CONSTRAINT "authentications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "authentications_secret_key_key" ON "authentications"("secret_key");

-- CreateIndex
CREATE INDEX "authentications_project_reference_idx" ON "authentications"("project_reference");

-- CreateIndex
CREATE INDEX "authentications_role_id_idx" ON "authentications"("role_id");
