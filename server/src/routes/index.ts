import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { RuleController } from '../controllers/rule.controller';
import { EvaluateController } from '../controllers/evaluate.controller';
import { ProjectController } from '../controllers/project.controller';
import { RoleController } from '../controllers/role.controller';
import { AuthenticationController } from '../controllers/authentication.controller';
import { validate, createConfigSchema, createRuleSchema, evaluateSchema, createProjectSchema, updateProjectSchema, createRoleSchema2, updateRoleSchema, createAuthenticationSchema, updateAuthenticationSchema } from '../middleware/validation';
import { authorize } from '../middleware/authorization';
import { IAuthenticationRepository } from '../repository/authentication/interfaces';

export function createRouter(
  configController: ConfigController,
  ruleController: RuleController,
  evaluateController: EvaluateController,
  projectController: ProjectController,
  roleController: RoleController,
  authenticationController: AuthenticationController,
  authRepo: IAuthenticationRepository
): Router {
  const router = Router();

  // Project routes
  router.post('/v1/admin/projects', authorize(authRepo, ['projects:write']), validate(createProjectSchema), projectController.create);
  router.get('/v1/admin/projects', authorize(authRepo, ['projects:read']), projectController.list);
  router.get('/v1/admin/projects/:reference', authorize(authRepo, ['projects:read']), projectController.getOne);
  router.put('/v1/admin/projects/:reference', authorize(authRepo, ['projects:write']), validate(updateProjectSchema), projectController.update);
  router.delete('/v1/admin/projects/:reference', authorize(authRepo, ['projects:write']), projectController.remove);

  // Role routes
  router.post('/v1/admin/roles', authorize(authRepo, ['roles:write']), validate(createRoleSchema2), roleController.create);
  router.get('/v1/admin/roles', authorize(authRepo, ['roles:read']), roleController.list);
  router.get('/v1/admin/roles/:id', authorize(authRepo, ['roles:read']), roleController.getOne);
  router.put('/v1/admin/roles/:id', authorize(authRepo, ['roles:write']), validate(updateRoleSchema), roleController.update);
  router.delete('/v1/admin/roles/:id', authorize(authRepo, ['roles:write']), roleController.remove);

  // Authentication / Token routes
  router.post('/v1/admin/authentications', authorize(authRepo, ['authentications:write']), validate(createAuthenticationSchema), authenticationController.create);
  router.get('/v1/admin/authentications/:id', authorize(authRepo, ['authentications:read']), authenticationController.getOne);
  router.get('/v1/admin/projects/:projectReference/authentications', authorize(authRepo, ['authentications:read']), authenticationController.listByProject);
  router.put('/v1/admin/authentications/:id', authorize(authRepo, ['authentications:write']), validate(updateAuthenticationSchema), authenticationController.update);
  router.delete('/v1/admin/authentications/:id', authorize(authRepo, ['authentications:write']), authenticationController.remove);

  // Token introspection (no authorization middleware – validates the token itself)
  router.post('/v1/auth/introspect', authenticationController.introspect);

  // Config routes
  router.post('/v1/admin/configs', authorize(authRepo, ['configs:write']), validate(createConfigSchema), configController.create);
  router.post('/v1/admin/configs/:key/rules', authorize(authRepo, ['rules:write']), validate(createRuleSchema), ruleController.assign);

  // Evaluate route
  router.post('/v1/evaluate', authorize(authRepo, ['configs:read']), validate(evaluateSchema), evaluateController.evaluate);

  return router;
}
