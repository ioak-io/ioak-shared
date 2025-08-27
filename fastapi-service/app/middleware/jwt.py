from fastapi import Request, HTTPException, Depends
from typing import Callable, Optional
import jwt # From PyJWT

from app.types.JwtClaimTypes import JwtClaims

# NOTE: For simplicity, we are not verifying the token signature here.
# This assumes an API Gateway (e.g., Kong) has already validated the JWT.
# If direct verification is needed, you would need to implement JWKS retrieval
# and signature verification using PyJWT or a similar library.


async def get_claims(request: Request) -> JwtClaims:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No Authorization header")

    try:
        token_type, token = auth_header.split(" ")
        if token_type.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    try:
        # Just decode the JWT without verifying (trust Kong did the verification)
        decoded_token = jwt.decode(token, options={"verify_signature": False}, algorithms=["RS256"])
        if not decoded_token:
            raise HTTPException(status_code=400, detail="Failed to decode JWT")
        return JwtClaims(**decoded_token)
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=400, detail=f"Error decoding token: {e}")
