-- AddForeignKey
ALTER TABLE "authentications" ADD CONSTRAINT "authentications_project_reference_fkey" FOREIGN KEY ("project_reference") REFERENCES "projects"("reference") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authentications" ADD CONSTRAINT "authentications_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_project_reference_fkey" FOREIGN KEY ("project_reference") REFERENCES "projects"("reference") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_reference_fkey" FOREIGN KEY ("project_reference") REFERENCES "projects"("reference") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_authentication_id_fkey" FOREIGN KEY ("authentication_id") REFERENCES "authentications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
