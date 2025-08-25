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
const jwt_decode_1 = require("jwt-decode");
const router = (0, express_1.Router)({ mergeParams: true });
// Function to extract token from request
const getTokenFromHeader = (req) => {
    const authorization = req.headers.authorization;
    if (authorization && authorization.split(' ')[0] === 'Bearer') {
        return authorization.split(' ')[1];
    }
    return null;
};
// isAdmin check middleware
const isAdmin = (req, res, next) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const decoded = (0, jwt_decode_1.jwtDecode)(token);
        if (decoded.realm_access && decoded.realm_access.roles.includes('admin')) {
            next();
        }
        else {
            res.status(403).send('Forbidden');
        }
    }
    catch (error) {
        res.status(401).send('Unauthorized');
    }
};
router.use(isAdmin);
router.post('/teams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ success: true, data: 'Team created successfully' });
}));
router.delete('/teams/:teamName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ success: true, data: 'Team deleted successfully' });
}));
router.post('/teams/:teamName/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ success: true, data: 'User added to team successfully' });
}));
router.delete('/teams/:teamName/users/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ success: true, data: 'User removed from team successfully' });
}));
router.post('/users/:userId/roles', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ success: true, data: 'Role assigned successfully' });
}));
router.delete('/users/:userId/roles/:roleName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ success: true, data: 'Role removed successfully' });
}));
exports.default = router;
