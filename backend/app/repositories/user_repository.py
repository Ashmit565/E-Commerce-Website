from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserRegister, UserUpdate
from app.utils.security import hash_password

class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email.ilike(email.strip())).first()

    @staticmethod
    def create(db: Session, user_in: UserRegister, role: str = "customer") -> User:
        db_user = User(
            email=user_in.email.strip().lower(),
            hashed_password=hash_password(user_in.password),
            full_name=user_in.full_name.strip(),
            phone_number=user_in.phone_number.strip() if user_in.phone_number else None,
            role=role,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update(db: Session, db_user: User, user_in: UserUpdate) -> User:
        if user_in.full_name is not None:
            db_user.full_name = user_in.full_name.strip()
        if user_in.phone_number is not None:
            db_user.phone_number = user_in.phone_number.strip()
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update_password(db: Session, db_user: User, new_hashed_password: str) -> User:
        db_user.hashed_password = new_hashed_password
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, role: Optional[str] = None):
        query = db.query(User)
        if search:
            query = query.filter(
                (User.full_name.ilike(f"%{search}%")) |
                (User.email.ilike(f"%{search}%")) |
                (User.phone_number.ilike(f"%{search}%"))
            )
        if role:
            query = query.filter(User.role == role)
        
        total = query.count()
        users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
        return users, total

