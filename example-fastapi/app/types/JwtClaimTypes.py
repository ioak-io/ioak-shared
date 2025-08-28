from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field

class RealmAccess(BaseModel):
    roles: List[str]

class ResourceAccessEntry(BaseModel):
    roles: List[str]

class ResourceAccess(BaseModel):
    # This will allow arbitrary keys for resource access, e.g., {"account": {"roles": ["manage-account"]}}
    model_config = {"extra": "allow"} 
    # resource: Dict[str, ResourceAccessEntry] # Cannot define like this directly, use model_config

class JwtClaims(BaseModel):
    exp: int # expiration (epoch)
    iat: int # issued at (epoch)
    jti: str # unique token id
    iss: str # issuer
    aud: Union[str, List[str]] # audience
    sub: str # subject (user id)
    typ: Optional[str] = None # token type (Bearer)
    azp: Optional[str] = None # authorized party (client id)
    sid: Optional[str] = None # session id
    acr: Optional[str] = None # authentication context class
    allowed_origins: Optional[List[str]] = Field(None, alias="allowed-origins")
    realm_access: Optional[RealmAccess] = None
    resource_access: Optional[ResourceAccess] = None
    scope: Optional[str] = None
    email_verified: Optional[bool] = None
    name: Optional[str] = None
    preferred_username: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    email: Optional[str] = None
