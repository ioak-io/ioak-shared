import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const keycloakUrl = process.env.KEYCLOAK_URL;
const adminUser = process.env.KEYCLOAK_ADMIN_USER;
const adminPass = process.env.KEYCLOAK_ADMIN_PASS;

export class KeycloakAdminClient {
  private accessToken: string | null = null;

  private async getAdminAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const params = new URLSearchParams();
    params.append('client_id', 'admin-cli');
    params.append('username', adminUser!);
    params.append('password', adminPass!);
    params.append('grant_type', 'password');

    const response = await axios.post(
      `${keycloakUrl}/realms/master/protocol/openid-connect/token`,
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    this.accessToken = response.data.access_token;
    return this.accessToken!;
  }

  private async getClient(realm: string, clientId: string) {
    const token = await this.getAdminAccessToken();
    const response = await axios.get(`${keycloakUrl}/admin/realms/${realm}/clients?clientId=${clientId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.length === 0) {
      throw new Error(`Client with ID '${clientId}' not found in realm '${realm}'`);
    }
    return response.data[0];
  }

  async createUser(realm: string, user: any) {
    const token = await this.getAdminAccessToken();
    const response = await axios.post(`${keycloakUrl}/admin/realms/${realm}/users`, user, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async deleteUser(realm: string, userId: string) {
    const token = await this.getAdminAccessToken();
    await axios.delete(`${keycloakUrl}/admin/realms/${realm}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createGroup(realm: string, name: string) {
    const token = await this.getAdminAccessToken();
    const response = await axios.post(`${keycloakUrl}/admin/realms/${realm}/groups`, { name }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getGroupByName(realm: string, name: string) {
    const token = await this.getAdminAccessToken();
    const response = await axios.get(`${keycloakUrl}/admin/realms/${realm}/groups?search=${name}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.length === 0) {
      throw new Error(`Group with name '${name}' not found in realm '${realm}'`);
    }
    return response.data[0];
  }

  async deleteGroup(realm: string, groupId: string) {
    const token = await this.getAdminAccessToken();
    await axios.delete(`${keycloakUrl}/admin/realms/${realm}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createRole(realm: string, clientId: string, name: string) {
    const token = await this.getAdminAccessToken();
    const client = await this.getClient(realm, clientId);
    const response = await axios.post(`${keycloakUrl}/admin/realms/${realm}/clients/${client.id}/roles`, { name }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getRole(realm: string, clientId: string, roleName: string) {
    const token = await this.getAdminAccessToken();
    const client = await this.getClient(realm, clientId);
    const response = await axios.get(`${keycloakUrl}/admin/realms/${realm}/clients/${client.id}/roles/${roleName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async deleteRole(realm: string, clientId: string, roleName: string) {
    const token = await this.getAdminAccessToken();
    const client = await this.getClient(realm, clientId);
    await axios.delete(`${keycloakUrl}/admin/realms/${realm}/clients/${client.id}/roles/${roleName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async assignUserToGroup(realm: string, userId: string, groupId: string) {
    const token = await this.getAdminAccessToken();
    await axios.put(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/groups/${groupId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async removeUserFromGroup(realm: string, userId: string, groupId: string) {
    const token = await this.getAdminAccessToken();
    await axios.delete(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async assignRoleToUser(realm: string, clientId: string, userId: string, roleName: string) {
    const token = await this.getAdminAccessToken();
    const client = await this.getClient(realm, clientId);
    const role = await this.getRole(realm, clientId, roleName);
    await axios.post(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/clients/${client.id}`, [role], {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async removeRoleFromUser(realm: string, clientId: string, userId: string, roleName: string) {
    const token = await this.getAdminAccessToken();
    const client = await this.getClient(realm, clientId);
    const role = await this.getRole(realm, clientId, roleName);
    await axios.delete(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/clients/${client.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: [role]
    });
  }

  async resetPassword(realm: string, userId: string, password: string) {
    const token = await this.getAdminAccessToken();
    await axios.put(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/reset-password`, { type: 'password', value: password, temporary: false }, {
        headers: { Authorization: `Bearer ${token}` },
    });
  }
}
