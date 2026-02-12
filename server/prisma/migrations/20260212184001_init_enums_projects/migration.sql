-- CreateEnum
CREATE TYPE "ConfigType" AS ENUM ('BOOLEAN', 'JSON', 'STRING', 'SECRET');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('CONFIGURATION', 'RULE');

-- CreateTable
CREATE TABLE "projects" (
    "reference" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("reference")
);
