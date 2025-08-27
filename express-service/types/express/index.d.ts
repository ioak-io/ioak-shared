import { JwtClaims } from "../JwtClaimTypes";

declare global {
  namespace Express {
    interface Request {
      claims?: JwtClaims;
    }
  }
}
