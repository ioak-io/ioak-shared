from fastapi import FastAPI, Depends, Request
from app.middleware.jwt import get_claims
from app.types.JwtClaimTypes import JwtClaims

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "hello"}

@app.get("/healthcheck/no-verify")
async def healthcheck_no_verify(claims: JwtClaims = Depends(get_claims), request: Request = None):
    return {
        "message": "Claims extracted successfully",
        "claims": claims.model_dump(),
        "headers": dict(request.headers)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3010)
