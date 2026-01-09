"""Authentication router."""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from bson import ObjectId

from app.models.user import (
    UserCreate, UserLogin, UserResponse, Token, UserInDB, UserUpdate,
    ForgotPasswordRequest, ResetPasswordRequest, OTPVerification
)
from app.services.auth_service import (
    get_password_hash, verify_password, create_access_token, get_current_user
)
from app.database.connection import get_database
from app.database.collections import USERS

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    """Register a new user."""
    db = get_database()
    
    # Check if user exists
    existing_user = await db[USERS].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_in_db = UserInDB(
        email=user.email,
        name=user.name,
        company=user.company,
        phone=user.phone,
        role=user.role,
        hashed_password=get_password_hash(user.password),
        created_at=datetime.utcnow()
    )
    
    result = await db[USERS].insert_one(user_in_db.model_dump())
    
    return UserResponse(
        id=str(result.inserted_id),
        email=user.email,
        name=user.name,
        company=user.company,
        phone=user.phone,
        role=user.role,
        created_at=user_in_db.created_at
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token."""
    db = get_database()
    
    user = await db[USERS].find_one({"email": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"]}
    )
    
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current authenticated user info."""
    db = get_database()
    
    user = await db[USERS].find_one({"_id": ObjectId(current_user.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        company=user.get("company"),
        phone=user.get("phone"),
        role=user.get("role", "user"),
        created_at=user["created_at"]
    )


@router.put("/me", response_model=UserResponse)
async def update_user_profile(user_update: UserUpdate, current_user = Depends(get_current_user)):
    """Update current user profile."""
    db = get_database()
    
    # Check if user exists
    user = await db[USERS].find_one({"_id": ObjectId(current_user.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare update data
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    
    if update_data:
        await db[USERS].update_one(
            {"_id": ObjectId(current_user.user_id)},
            {"$set": update_data}
        )
        
        # Verify update by fetching updated user
        user = await db[USERS].find_one({"_id": ObjectId(current_user.user_id)})
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        company=user.get("company"),
        phone=user.get("phone"),
        role=user.get("role", "user"),
        created_at=user["created_at"]
    )
