from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import get_db
from models import User
from schemas import UserCreate

router = APIRouter()

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


@router.post("/api/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user_by_email = db.query(User).filter(User.email == user.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="该邮箱已被注册")

    db_user_by_student_id = db.query(User).filter(User.student_id == user.student_id).first()
    if db_user_by_student_id:
        raise HTTPException(status_code=400, detail="该学号已被注册")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        student_id=user.student_id,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "msg": "注册成功",
        "user_id": new_user.id
    }
