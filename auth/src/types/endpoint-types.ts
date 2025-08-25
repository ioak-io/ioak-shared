import { User } from './index';

// --- General API Response ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Admin Endpoints ---

// POST /admin/:realm/team/:teamName
export interface CreateTeamPathParams {
  realm: string;
  teamName: string;
}

export interface GroupPayload {
  name: string;
  roles: string[];
}

export interface CreateTeamRequestBody {
  clientId: string;
  roles: string[];
  groups: GroupPayload[];
}

export interface GroupResponse {
  name: string;
  roles: string[];
}

export interface CreateTeamResponseBody {
  data: string;
  createdRoles: string[];
  createdGroups: GroupResponse[];
}

// DELETE /admin/:realm/team/:teamName
export interface DeleteTeamPathParams {
  realm: string;
  teamName: string;
}

export interface DeleteTeamRequestBody {
  clientId: string;
}

export interface DeleteTeamResponseBody {
  data: string;
  deletedGroups: string[];
  deletedRoles: string[];
}

// POST /admin/:realm/team/:teamName/users/:userId
// DELETE /admin/:realm/team/:teamName/users/:userId
export interface ManageUserToTeamPathParams {
  realm: string;
  teamName: string;
  userId: string;
}

export type AddUserToTeamRequestBody = string[]; // Array of group names

export interface AddUserToTeamResponseBody {
  data: string;
}

export type RemoveUserFromTeamRequestBody = string[]; // Array of group names

export interface RemoveUserFromTeamResponseBody {
  data: string;
}

// --- User Endpoints ---

export interface RealmParams {
  realm: string;
}

// POST /user/:realm/signup
export type SignupRequestBody = User; // Uses the existing User interface

export interface SignupResponseBody {
  data: string;
}

// POST /user/:realm/login
export interface LoginRequestBody {
  username: string;
  password: string;
  client_id: string;
  client_secret: string;
}

export interface LoginResponseBody {
  data: any; // Keycloak token response can be complex
}

// POST /user/:realm/refresh
export interface RefreshRequestBody {
  refresh_token: string;
  client_id: string;
  client_secret: string;
}

export interface RefreshResponseBody {
  data: any; // Keycloak token response can be complex
}

// POST /user/:realm/logout
export interface LogoutRequestBody {
  refresh_token: string;
  client_id: string;
  client_secret: string;
}

export interface LogoutResponseBody {
  data: string;
}

// POST /user/:realm/change-password
export interface ChangePasswordRequestBody {
  userId: string;
  password: string;
}

export interface ChangePasswordResponseBody {
  error: string;
}

// GET /user/:realm/me
export interface MeResponseBody {
  data: any; // User info response can be complex
}
