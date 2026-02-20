import type { AxiosInstance } from 'axios';
import { createHttpClient } from './http';
import type {
  WeaponXClientOptions,
  CreateConfigRequest,
  CreateRuleRequest,
  Config,
  Rule,
  ApiDataResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  Authentication,
  CreateAuthenticationRequest,
  UpdateAuthenticationRequest,
  IntrospectResponse,
  Environment,
  CreateEnvironmentRequest,
  UpdateEnvironmentRequest,
} from './types';

export class AdminClient {
  private http: AxiosInstance;

  constructor(options: WeaponXClientOptions) {
    this.http = createHttpClient(options);
  }

  async createConfig(data: CreateConfigRequest): Promise<Config> {
    const { data: res } = await this.http.post<ApiDataResponse<Config>>('/v1/admin/configs', data);
    return res.data;
  }

  async assignRule(configKey: string, data: CreateRuleRequest): Promise<Rule> {
    const { data: res } = await this.http.post<ApiDataResponse<Rule>>(
      `/v1/admin/configs/${encodeURIComponent(configKey)}/rules`,
      data,
    );
    return res.data;
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const { data: res } = await this.http.post<ApiDataResponse<Project>>('/v1/admin/projects', data);
    return res.data;
  }

  async getProject(reference: string): Promise<Project> {
    const { data: res } = await this.http.get<ApiDataResponse<Project>>(
      `/v1/admin/projects/${encodeURIComponent(reference)}`,
    );
    return res.data;
  }

  async listProjects(): Promise<Project[]> {
    const { data: res } = await this.http.get<ApiDataResponse<Project[]>>('/v1/admin/projects');
    return res.data;
  }

  async updateProject(reference: string, data: UpdateProjectRequest): Promise<Project> {
    const { data: res } = await this.http.put<ApiDataResponse<Project>>(
      `/v1/admin/projects/${encodeURIComponent(reference)}`,
      data,
    );
    return res.data;
  }

  async deleteProject(reference: string): Promise<void> {
    await this.http.delete(`/v1/admin/projects/${encodeURIComponent(reference)}`);
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    const { data: res } = await this.http.post<ApiDataResponse<Role>>('/v1/admin/roles', data);
    return res.data;
  }

  async getRole(id: string): Promise<Role> {
    const { data: res } = await this.http.get<ApiDataResponse<Role>>(
      `/v1/admin/roles/${encodeURIComponent(id)}`,
    );
    return res.data;
  }

  async listRoles(): Promise<Role[]> {
    const { data: res } = await this.http.get<ApiDataResponse<Role[]>>('/v1/admin/roles');
    return res.data;
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const { data: res } = await this.http.put<ApiDataResponse<Role>>(
      `/v1/admin/roles/${encodeURIComponent(id)}`,
      data,
    );
    return res.data;
  }

  async deleteRole(id: string): Promise<void> {
    await this.http.delete(`/v1/admin/roles/${encodeURIComponent(id)}`);
  }

  async createAuthentication(data: CreateAuthenticationRequest): Promise<Authentication> {
    const { data: res } = await this.http.post<ApiDataResponse<Authentication>>('/v1/admin/authentications', data);
    return res.data;
  }

  async getAuthentication(id: string): Promise<Authentication> {
    const { data: res } = await this.http.get<ApiDataResponse<Authentication>>(
      `/v1/admin/authentications/${encodeURIComponent(id)}`,
    );
    return res.data;
  }

  async listAuthenticationsByProject(projectReference: string): Promise<Authentication[]> {
    const { data: res } = await this.http.get<ApiDataResponse<Authentication[]>>(
      `/v1/admin/projects/${encodeURIComponent(projectReference)}/authentications`,
    );
    return res.data;
  }

  async updateAuthentication(id: string, data: UpdateAuthenticationRequest): Promise<Authentication> {
    const { data: res } = await this.http.put<ApiDataResponse<Authentication>>(
      `/v1/admin/authentications/${encodeURIComponent(id)}`,
      data,
    );
    return res.data;
  }

  async deleteAuthentication(id: string): Promise<void> {
    await this.http.delete(`/v1/admin/authentications/${encodeURIComponent(id)}`);
  }

  async introspect(token: string): Promise<IntrospectResponse> {
    try {
      const { data } = await this.http.post<IntrospectResponse>('/v1/auth/introspect', undefined, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch {
      return { active: false };
    }
  }

  // ── Environments ──

  async createEnvironment(data: CreateEnvironmentRequest): Promise<Environment> {
    const { data: res } = await this.http.post<ApiDataResponse<Environment>>('/v1/admin/environments', data);
    return res.data;
  }

  async getEnvironment(id: string): Promise<Environment> {
    const { data: res } = await this.http.get<ApiDataResponse<Environment>>(
      `/v1/admin/environments/${encodeURIComponent(id)}`,
    );
    return res.data;
  }

  async listEnvironments(): Promise<Environment[]> {
    const { data: res } = await this.http.get<ApiDataResponse<Environment[]>>('/v1/admin/environments', {
      headers: { Authorization: `Bearer nothing` },
    });
    return res.data;
  }

  async updateEnvironment(id: string, data: UpdateEnvironmentRequest): Promise<Environment> {
    const { data: res } = await this.http.put<ApiDataResponse<Environment>>(
      `/v1/admin/environments/${encodeURIComponent(id)}`,
      data,
    );
    return res.data;
  }

  async deleteEnvironment(id: string): Promise<void> {
    await this.http.delete(`/v1/admin/environments/${encodeURIComponent(id)}`);
  }
}
