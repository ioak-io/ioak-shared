"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_jwt_1 = require("express-jwt");
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const user_1 = __importDefault(require("./routes/user"));
const admin_1 = __importDefault(require("./routes/admin"));
dotenv_1.default.config();
const databaseUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
mongoose_1.default.connect(databaseUri, {});
const app = (0, express_1.default)();
// Middleware setup
app.use(express_1.default.json({ limit: 5000000 }));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*",
}));
app.use(express_1.default.urlencoded({
    extended: true,
}));
const realmFromParams = (req) => req.params.realm;
const checkJwt = (req, res, next) => {
    const realm = realmFromParams(req);
    if (!realm) {
        return res.status(400).json({ success: false, error: 'Realm parameter missing' });
    }
    const jwtMiddleware = (0, express_jwt_1.expressjwt)({
        secret: jwks_rsa_1.default.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/certs`
        }),
        audience: 'account',
        issuer: `${process.env.KEYCLOAK_URL}/realms/${realm}`,
        algorithms: ['RS256']
    });
    jwtMiddleware(req, res, next);
};
app.use('/user/:realm', user_1.default);
app.use('/admin/:realm', checkJwt, admin_1.default);
// 404 Handler
app.use((_, res) => {
    res.status(404);
    res.send("Not found");
    res.end();
});
// Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).send(process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.stack);
});
// Start Server
const PORT = process.env.PORT || 2010;
app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}`);
});
