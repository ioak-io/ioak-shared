"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakAdminClient = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const keycloakUrl = process.env.KEYCLOAK_URL;
const adminUser = process.env.KEYCLOAK_ADMIN_USER;
const adminPass = process.env.KEYCLOAK_ADMIN_PASS;
class KeycloakAdminClient {
    constructor() {
        this.accessToken = null;
    }
    getAdminAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accessToken) {
                return this.accessToken;
            }
            const params = new URLSearchParams();
            params.append('client_id', 'admin-cli');
            params.append('username', adminUser);
            params.append('password', adminPass);
            params.append('grant_type', 'password');
            const response = yield axios_1.default.post(`${keycloakUrl}/realms/master/protocol/openid-connect/token`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            this.accessToken = response.data.access_token;
            return this.accessToken;
        });
    }
    getClient(realm, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const response = yield axios_1.default.get(`${keycloakUrl}/admin/realms/${realm}/clients?clientId=${clientId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.length === 0) {
                throw new Error(`Client with ID '${clientId}' not found in realm '${realm}'`);
            }
            return response.data[0];
        });
    }
    createUser(realm, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const response = yield axios_1.default.post(`${keycloakUrl}/admin/realms/${realm}/users`, user, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        });
    }
    deleteUser(realm, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            yield axios_1.default.delete(`${keycloakUrl}/admin/realms/${realm}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        });
    }
    createGroup(realm, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const response = yield axios_1.default.post(`${keycloakUrl}/admin/realms/${realm}/groups`, { name }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        });
    }
    getGroupByName(realm, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const response = yield axios_1.default.get(`${keycloakUrl}/admin/realms/${realm}/groups?search=${name}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.length === 0) {
                throw new Error(`Group with name '${name}' not found in realm '${realm}'`);
            }
            return response.data[0];
        });
    }
    deleteGroup(realm, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            yield axios_1.default.delete(`${keycloakUrl}/admin/realms/${realm}/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        });
    }
    createRole(realm, clientId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const client = yield this.getClient(realm, clientId);
            const response = yield axios_1.default.post(`${keycloakUrl}/admin/realms/${realm}/clients/${client.id}/roles`, { name }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        });
    }
    getRole(realm, clientId, roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const client = yield this.getClient(realm, clientId);
            const response = yield axios_1.default.get(`${keycloakUrl}/admin/realms/${realm}/clients/${client.id}/roles/${roleName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        });
    }
    deleteRole(realm, clientId, roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const client = yield this.getClient(realm, clientId);
            yield axios_1.default.delete(`${keycloakUrl}/admin/realms/${realm}/clients/${client.id}/roles/${roleName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        });
    }
    assignUserToGroup(realm, userId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            yield axios_1.default.put(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/groups/${groupId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
        });
    }
    removeUserFromGroup(realm, userId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            yield axios_1.default.delete(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        });
    }
    assignRoleToUser(realm, clientId, userId, roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const client = yield this.getClient(realm, clientId);
            const role = yield this.getRole(realm, clientId, roleName);
            yield axios_1.default.post(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/clients/${client.id}`, [role], {
                headers: { Authorization: `Bearer ${token}` },
            });
        });
    }
    removeRoleFromUser(realm, clientId, userId, roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            const client = yield this.getClient(realm, clientId);
            const role = yield this.getRole(realm, clientId, roleName);
            yield axios_1.default.delete(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/role-mappings/clients/${client.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: [role]
            });
        });
    }
    resetPassword(realm, userId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAdminAccessToken();
            yield axios_1.default.put(`${keycloakUrl}/admin/realms/${realm}/users/${userId}/reset-password`, { type: 'password', value: password, temporary: false }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        });
    }
}
exports.KeycloakAdminClient = KeycloakAdminClient;
