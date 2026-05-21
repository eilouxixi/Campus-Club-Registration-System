from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from init_db import init_database
from database import engine, get_db, Base
from models import User, Activity, Registration, ActivityStatus, RegistrationStatus, ActivityLocation
from schemas import UserCreate, UserResponse, Token, ActivityCreate, ActivityResponse, RegistrationResponse
from utils import verify_password, get_password_hash, create_access_token, get_current_user, get_current_admin_user
from api.auth import router as auth_router
from api.activities import router as activities_router

print("正在初始化数据库...")
init_database()
Base.metadata.create_all(bind=engine)
print("数据库初始化完成！")

app = FastAPI(title="校园社团活动报名系统API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(activities_router)


@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={
        "sub": user.email,
        "user_id": user.id,
        "email": user.email,
        "role": user.role.value if hasattr(user.role, 'value') else user.role
    })
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "role": user.role.value if hasattr(user.role, 'value') else user.role
    }


@app.get("/api/activities", response_model=dict)
def get_activities(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[ActivityStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Activity)
    if status:
        query = query.filter(Activity.status == status)
    
    total = query.count()
    activities = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "list": activities
    }


@app.get("/api/activities/{activity_id}", response_model=ActivityResponse)
def get_activity_detail(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    return activity


@app.post("/api/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_activity = Activity(
        title=activity.title,
        description=activity.description,
        start_time=activity.start_time,
        end_time=activity.end_time,
        volunteer_count=activity.volunteer_count,
        max_participants=activity.max_participants,
        status=ActivityStatus.open,
        created_by=current_user.id
    )
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    
    # 保存活动地点到 activity_locations 表
    for location_name in activity.locations:
        if location_name and location_name.strip():
            location = ActivityLocation(
                activity_id=new_activity.id,
                location_name=location_name.strip()
            )
            db.add(location)
    db.commit()
    db.refresh(new_activity)
    
    return new_activity


@app.post("/api/registrations", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    existing_registration = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.activity_id == activity_id,
        Registration.status == RegistrationStatus.registered
    ).first()
    if existing_registration:
        raise HTTPException(status_code=400, detail="您已报名该活动")
    
    if activity.current_participants >= activity.max_participants:
        raise HTTPException(status_code=400, detail="活动人数已满")
    
    new_registration = Registration(
        user_id=current_user.id,
        activity_id=activity_id,
        status=RegistrationStatus.registered
    )
    activity.current_participants += 1
    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)
    return new_registration


@app.delete("/api/registrations", response_model=dict)
def cancel_registration(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registration = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.activity_id == activity_id,
        Registration.status == RegistrationStatus.registered
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="未找到该报名记录")
    
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if activity and activity.current_participants > 0:
        activity.current_participants -= 1
    
    registration.status = RegistrationStatus.cancelled
    registration.cancelled_at = datetime.utcnow()
    db.commit()
    
    return {"message": "取消报名成功"}


@app.get("/api/my-registrations", response_model=List[RegistrationResponse])
def get_my_registrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registrations = db.query(Registration).filter(
        Registration.user_id == current_user.id
    ).all()
    return registrations


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
