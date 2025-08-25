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
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const KeycloakAdminClient_1 = require("../services/KeycloakAdminClient");
const router = (0, express_1.Router)();
const keycloakAdminClient = new KeycloakAdminClient_1.KeycloakAdminClient();
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { realm } = req.params;
    const user = req.body;
    try {
        yield keycloakAdminClient.createUser(realm, user);
        res.json({ success: true, data: 'User created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'User creation failed' : error.message });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        const response = yield axios_1.default.post(`${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/token`, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        res.json({ success: true, data: response.data });
    }
    catch (error) {
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Authentication failed' : ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message });
    }
}));
router.post('/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { realm } = req.params;
    const { refresh_token, client_id, client_secret } = req.body;
    // Consider Keycloak's public client type or a Backend-for-Frontend (BFF) pattern to avoid sending client_secret from client-side.
    const params = new URLSearchParams();
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    params.append('refresh_token', refresh_token);
    params.append('grant_type', 'refresh_token');
    try {
        const response = yield axios_1.default.post(`${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/token`, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        res.json({ success: true, data: response.data });
    }
    catch (error) {
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Token refresh failed' : ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message });
    }
}));
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { realm } = req.params;
    const { refresh_token, client_id, client_secret } = req.body;
    // Consider Keycloak's public client type or a Backend-for-Frontend (BFF) pattern to avoid sending client_secret from client-side.
    const params = new URLSearchParams();
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    params.append('refresh_token', refresh_token);
    try {
        yield axios_1.default.post(`${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/logout`, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        res.json({ success: true, data: 'Logged out successfully' });
    }
    catch (error) {
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Logout failed' : ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message });
    }
}));
router.post('/change-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This requires getting the user id from the token, which should be done in a middleware.
    // For now, we'll assume the user id is passed in the request body.
    const { userId, password } = req.body;
    try {
        // Implement a secure user-initiated password change flow using Keycloak's APIs.
        // Directly using the admin client to reset a user's password from a user-facing endpoint
        // is a security risk. Consider Keycloak's account management API or email-based password reset flows.
        res.status(501).json({ success: false, error: 'Password change not implemented securely.' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Password change failed' : error.message });
    }
}));
router.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    const { realm } = req.params;
    try {
        const userinfoResponse = yield axios_1.default.get(`${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/userinfo`, { headers: { Authorization: `Bearer ${token}` } });
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const roles = {
            realm_access: decodedToken.realm_access,
            resource_access: decodedToken.resource_access
        };
        res.json({ success: true, data: Object.assign(Object.assign({}, userinfoResponse.data), { roles }) });
    }
    catch (error) {
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Failed to fetch user info' : ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message });
    }
}));
exports.default = router;
