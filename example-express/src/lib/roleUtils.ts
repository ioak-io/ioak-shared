import { JwtClaims } from "../types/JwtClaimTypes";

export const getUserRoles = (claims: JwtClaims | undefined, realm: string): string[] => {
    if (claims?.resource_access?.[realm]?.roles) {
        return claims.resource_access[realm].roles;
    }
    return [];
};
