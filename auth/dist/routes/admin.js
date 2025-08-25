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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const KeycloakAdminClient_1 = require("../services/KeycloakAdminClient");
const router = (0, express_1.Router)({ mergeParams: true });
const keycloakAdminClient = new KeycloakAdminClient_1.KeycloakAdminClient();
// Placeholder admin check middleware
const isAdmin = (req, res, next) => {
    // In a real app, you would validate the JWT and check for an admin role.
    // For now, we'll just assume the user is an admin.
    next();
};
router.use(isAdmin);
router.post('/teams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { realm } = req.params;
    const { name, clientId } = req.body;
    try {
        yield keycloakAdminClient.createGroup(realm, name);
        yield keycloakAdminClient.createRole(realm, clientId, name);
        res.json({ success: true, data: 'Team created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
router.delete('/teams/:teamName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { realm, teamName } = req.params;
    const { name, clientId } = req.body;
    try {
        const group = yield keycloakAdminClient.getGroupByName(realm, teamName);
        yield keycloakAdminClient.deleteGroup(realm, group.id);
        yield keycloakAdminClient.deleteRole(realm, clientId, name);
        res.json({ success: true, data: 'Team deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
router.post('/teams/:teamName/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { realm, teamName, userId } = req.params;
    const { roleName, clientId } = req.body;
    try {
        const group = yield keycloakAdminClient.getGroupByName(realm, teamName);
        yield keycloakAdminClient.assignUserToGroup(realm, userId, group.id);
        yield keycloakAdminClient.assignRoleToUser(realm, clientId, userId, roleName);
        res.json({ success: true, data: 'User added to team successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
router.delete('/teams/:teamName/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { realm, teamName, userId } = req.params;
    const { roleName, clientId } = req.body;
    try {
        const group = yield keycloakAdminClient.getGroupByName(realm, teamName);
        yield keycloakAdminClient.removeUserFromGroup(realm, userId, group.id);
        yield keycloakAdminClient.removeRoleFromUser(realm, clientId, userId, roleName);
        res.json({ success: true, data: 'User removed from team successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
router.post('/users/:userId/roles', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { realm, userId } = req.params;
    const { roleName, clientId } = req.body;
    try {
        yield keycloakAdminClient.assignRoleToUser(realm, clientId, userId, roleName);
        res.json({ success: true, data: 'Role assigned successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
router.delete('/users/:userId/roles/:roleName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { realm, userId, roleName } = req.params;
    const { clientId } = req.body;
    try {
        yield keycloakAdminClient.removeRoleFromUser(realm, clientId, userId, roleName);
        res.json({ success: true, data: 'Role removed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
exports.default = router;
