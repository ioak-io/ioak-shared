import { Router, Request, Response } from 'express';
import axios from 'axios';
import { KeycloakAdminClient } from '../services/KeycloakAdminClient';
import { User } from '../types';
import {
  ApiResponse,
  RealmParams,
  SignupRequestBody,
  SignupResponseBody,
  LoginRequestBody,
  LoginResponseBody,
  RefreshRequestBody,
  RefreshResponseBody,
  LogoutRequestBody,
  LogoutResponseBody,
  ChangePasswordRequestBody,
  ChangePasswordResponseBody,
  MeResponseBody,
} from '../types/endpoint-types';

type RealmRequest<P = RealmParams, ResBody = any, ReqBody = any> = Request<P, ResBody, ReqBody>;

const router = Router({ mergeParams: true });
const keycloakAdminClient = new KeycloakAdminClient();

router.post('/signup', async (req: RealmRequest<RealmParams, {}, SignupRequestBody>, res: Response<ApiResponse<SignupResponseBody>>) => {
  const { realm } = req.params;
  const user: User = req.body;
  try {
    await keycloakAdminClient.createUser(realm, user);
    res.json({ success: true, data: { data: 'User created successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'User creation failed' : error.message });
  }
});

router.post('/login', async (req: RealmRequest<RealmParams, {}, LoginRequestBody>, res: Response<ApiResponse<LoginResponseBody>>) => {
  const { realm } = req.params;
  const { username, password, client_id, client_secret } = req.body;
  // Consider Keycloak's public client type or a Backend-for-Frontend (BFF) pattern to avoid sending client_secret from client-side.
  const params = new URLSearchParams();
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);
  params.append('username', username);
  params.append('password', password);
  params.append('grant_type', 'password');
  params.append('scope', 'openid profile email');

  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/token`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Authentication failed' : error.response?.data || error.message });
  }
});

router.post('/refresh', async (req: RealmRequest<RealmParams, {}, RefreshRequestBody>, res: Response<ApiResponse<RefreshResponseBody>>) => {
  const { realm } = req.params;
  const { refresh_token, client_id, client_secret } = req.body;
  // Consider Keycloak's public client type or a Backend-for-Frontend (BFF) pattern to avoid sending client_secret from client-side.
  const params = new URLSearchParams();
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);
  params.append('refresh_token', refresh_token);
  params.append('grant_type', 'refresh_token');

  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/token`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Token refresh failed' : error.response?.data || error.message });
  }
});

router.post('/logout', async (req: RealmRequest<RealmParams, {}, LogoutRequestBody>, res: Response<ApiResponse<LogoutResponseBody>>) => {
  const { realm } = req.params;
  const { refresh_token, client_id, client_secret } = req.body;
  // Consider Keycloak's public client type or a Backend-for-Frontend (BFF) pattern to avoid sending client_secret from client-side.
  const params = new URLSearchParams();
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);
  params.append('refresh_token', refresh_token);

  try {
    await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/logout`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json({ success: true, data: { data: 'Logged out successfully' } });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Logout failed' : error.response?.data || error.message });
  }
});

router.post('/change-password', async (req: RealmRequest<RealmParams, {}, ChangePasswordRequestBody>, res: Response<ApiResponse<ChangePasswordResponseBody>>) => {
  // This requires getting the user id from the token, which should be done in a middleware.
  // For now, we'll assume the user id is passed in the request body.
  const { userId, password } = req.body;
  try {
    // Implement a secure user-initiated password change flow using Keycloak's APIs.
    // Directly using the admin client to reset a user's password from a user-facing endpoint
    // is a security risk. Consider Keycloak's account management API or email-based password reset flows.
    res.status(501).json({ success: false, error: 'Password change not implemented securely.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Password change failed' : error.message });
  }
});

router.get('/me', async (req: RealmRequest<RealmParams, {}, {}>, res: Response<ApiResponse<MeResponseBody>>) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  const { realm } = req.params;

  try {
    const userinfoResponse = await axios.get(
      `${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/userinfo`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const roles = {
      realm_access: decodedToken.realm_access,
      resource_access: decodedToken.resource_access
    };

    res.json({ success: true, data: { ...userinfoResponse.data, roles } });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Failed to fetch user info' : error.response?.data || error.message });
  }
});

export default router;