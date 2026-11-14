from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegister, UserLogin, UserUpdate, ChangePassword
from app.utils.security import verify_password, hash_password, create_access_token
from app.models.user import User

class AuthService:
    @staticmethod
    def register(db: Session, user_in: UserRegister) -> User:
        # Check if email exists
        existing_user = UserRepository.get_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists"
            )

        if user_in.confirm_password and user_in.password != user_in.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        user = UserRepository.create(db, user_in, role="customer")
        return user

    @staticmethod
    def authenticate(db: Session, login_data: UserLogin) -> dict:
        user = UserRepository.get_by_email(db, login_data.email)
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account has been disabled. Please contact support."
            )

        access_token = create_access_token(subject=user.id, role=user.role)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    def change_password(db: Session, user: User, data: ChangePassword) -> None:
        if not verify_password(data.old_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password does not match"
            )

        if data.old_password == data.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password"
            )

        new_hash = hash_password(data.new_password)
        UserRepository.update_password(db, user, new_hash)

