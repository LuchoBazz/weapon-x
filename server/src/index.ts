import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaConfigRepository } from './repository/config/prisma/config.repository';
import { PrismaRuleRepository } from './repository/rule/prisma/rule.repository';
import { PrismaAuthenticationRepository } from './repository/authentication/prisma/authentication.repository';
import { PrismaAuditLogRepository } from './repository/audit/prisma/audit.repository';
import { CreateConfigUseCase } from './usecases/createConfig.usecase';
import { AssignRuleUseCase } from './usecases/assignRule.usecase';
import { EvaluateUseCase } from './usecases/evaluate.usecase';
import { CreateProjectUseCase } from './usecases/createProject.usecase';
import { GetProjectUseCase, ListProjectsUseCase } from './usecases/getProject.usecase';
import { UpdateProjectUseCase } from './usecases/updateProject.usecase';
import { DeleteProjectUseCase } from './usecases/deleteProject.usecase';
import { CreateRoleUseCase } from './usecases/createRole.usecase';
import { GetRoleUseCase, ListRolesUseCase } from './usecases/getRole.usecase';
import { UpdateRoleUseCase } from './usecases/updateRole.usecase';
import { DeleteRoleUseCase } from './usecases/deleteRole.usecase';
import { CreateAuthenticationUseCase } from './usecases/createAuthentication.usecase';
import { GetAuthenticationUseCase, ListAuthenticationsByProjectUseCase } from './usecases/getAuthentication.usecase';
import { UpdateAuthenticationUseCase } from './usecases/updateAuthentication.usecase';
import { DeleteAuthenticationUseCase } from './usecases/deleteAuthentication.usecase';
import { IntrospectAuthenticationUseCase } from './usecases/introspectAuthentication.usecase';
import { AuditService } from './services/audit.service';
import { ConfigController } from './controllers/config.controller';
import { RuleController as RuleCtrl } from './controllers/rule.controller';
import { EvaluateController } from './controllers/evaluate.controller';
import { ProjectController } from './controllers/project.controller';
import { RoleController } from './controllers/role.controller';
import { AuthenticationController } from './controllers/authentication.controller';
import { PrismaProjectRepository } from './repository/project/prisma/project.repository';
import { PrismaRoleRepository } from './repository/role/prisma/role.repository';
import { createRouter } from './routes';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 3001;

// Repositories
const configRepo = new PrismaConfigRepository(prisma);
const ruleRepo = new PrismaRuleRepository(prisma);
const authRepo = new PrismaAuthenticationRepository(prisma);
const projectRepo = new PrismaProjectRepository(prisma);
const roleRepo = new PrismaRoleRepository(prisma);
const auditRepo = new PrismaAuditLogRepository(prisma);

// Services
const auditService = new AuditService(auditRepo);

// Use Cases
const createConfigUseCase = new CreateConfigUseCase(configRepo);
const assignRuleUseCase = new AssignRuleUseCase(configRepo, ruleRepo);
const evaluateUseCase = new EvaluateUseCase(configRepo);
const createProjectUseCase = new CreateProjectUseCase(projectRepo);
const getProjectUseCase = new GetProjectUseCase(projectRepo);
const listProjectsUseCase = new ListProjectsUseCase(projectRepo);
const updateProjectUseCase = new UpdateProjectUseCase(projectRepo);
const deleteProjectUseCase = new DeleteProjectUseCase(projectRepo);
const createRoleUseCase = new CreateRoleUseCase(roleRepo);
const getRoleUseCase = new GetRoleUseCase(roleRepo);
const listRolesUseCase = new ListRolesUseCase(roleRepo);
const updateRoleUseCase = new UpdateRoleUseCase(roleRepo);
const deleteRoleUseCase = new DeleteRoleUseCase(roleRepo);
const createAuthUseCase = new CreateAuthenticationUseCase(authRepo);
const getAuthUseCase = new GetAuthenticationUseCase(authRepo);
const listAuthsByProjectUseCase = new ListAuthenticationsByProjectUseCase(authRepo);
const updateAuthUseCase = new UpdateAuthenticationUseCase(authRepo);
const deleteAuthUseCase = new DeleteAuthenticationUseCase(authRepo);
const introspectAuthUseCase = new IntrospectAuthenticationUseCase(authRepo);

// Controllers
const configController = new ConfigController(createConfigUseCase, auditService);
const ruleCtrl = new RuleCtrl(assignRuleUseCase, auditService);
const evaluateController = new EvaluateController(evaluateUseCase);
const projectController = new ProjectController(createProjectUseCase, getProjectUseCase, listProjectsUseCase, updateProjectUseCase, deleteProjectUseCase);
const roleController = new RoleController(createRoleUseCase, getRoleUseCase, listRolesUseCase, updateRoleUseCase, deleteRoleUseCase);
const authenticationController = new AuthenticationController(createAuthUseCase, getAuthUseCase, listAuthsByProjectUseCase, updateAuthUseCase, deleteAuthUseCase, introspectAuthUseCase);

// App
const app = express();
app.use(cors());
app.use(express.json());
app.use(createRouter(configController, ruleCtrl, evaluateController, projectController, roleController, authenticationController, authRepo));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Weapon-X API running on http://localhost:${PORT}`);
});

export default app;
