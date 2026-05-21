from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List, Optional

from database import get_db
from models import User, Activity, Registration, ActivityLocation, ActivityStatus, RegistrationStatus
from schemas import (
    ActivityCreate, ActivityResponse, RegistrationResponse, RegistrationDetail,
    RegistrationCreate
)
from utils import get_current_user

router = APIRouter()


@router.get("/api/activities", response_model=dict)
def get_activities(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Activity).options(joinedload(Activity.locations))
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


@router.get("/api/activities/{activity_id}", response_model=ActivityResponse)
def get_activity_detail(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = db.query(Activity).options(joinedload(Activity.locations)).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")

    existing_registration = db.query(Registration).filter(
        and_(
            Registration.user_id == current_user.id,
            Registration.activity_id == activity_id,
            Registration.status == RegistrationStatus.registered
        )
    ).first()

    remaining_spots = activity.volunteer_count - activity.current_participants

    return ActivityResponse(
        id=activity.id,
        title=activity.title,
        description=activity.description,
        start_time=activity.start_time,
        end_time=activity.end_time,
        volunteer_count=activity.volunteer_count,
        max_participants=activity.max_participants,
        current_participants=activity.current_participants,
        status=activity.status,
        created_by=activity.created_by,
        created_at=activity.created_at,
        locations=activity.locations,
        is_registered=existing_registration is not None,
        remaining_spots=remaining_spots if remaining_spots > 0 else 0
    )


@router.post("/api/activities", status_code=status.HTTP_201_CREATED)
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

    for loc_name in activity.locations:
        if loc_name and loc_name.strip():
            location = ActivityLocation(
                activity_id=new_activity.id, 
                location_name=loc_name.strip()
            )
            db.add(location)
    db.commit()

    return {"msg": "活动发布成功", "activity_id": new_activity.id}


@router.post("/api/activities/{activity_id}/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_activity(
    activity_id: int,
    reg_data: RegistrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")

    existing_registration = db.query(Registration).filter(
        and_(
            Registration.user_id == current_user.id,
            Registration.activity_id == activity_id,
            Registration.status == RegistrationStatus.registered
        )
    ).first()
    if existing_registration:
        raise HTTPException(status_code=400, detail="您已报名该活动")

    if activity.current_participants >= activity.volunteer_count:
        raise HTTPException(status_code=400, detail="志愿者名额已满")

    new_registration = Registration(
        user_id=current_user.id,
        activity_id=activity_id,
        student_id=reg_data.student_id,
        class_name=reg_data.class_name,
        contact=reg_data.contact,
        status=RegistrationStatus.registered
    )
    activity.current_participants += 1
    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)
    return new_registration


@router.delete("/api/activities/{activity_id}/register")
def cancel_registration(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registration = db.query(Registration).filter(
        and_(
            Registration.user_id == current_user.id,
            Registration.activity_id == activity_id,
            Registration.status == RegistrationStatus.registered
        )
    ).first()

    if not registration:
        raise HTTPException(status_code=404, detail="未找到该报名记录")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if activity and activity.current_participants > 0:
        activity.current_participants -= 1

    registration.status = RegistrationStatus.cancelled
    db.commit()

    return {"message": "取消报名成功"}


@router.get("/api/my-activities", response_model=List[ActivityResponse])
def get_my_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activities = db.query(Activity).options(joinedload(Activity.locations)).filter(Activity.created_by == current_user.id).all()
    return activities


@router.get("/api/my-activities/{activity_id}/registrations")
def get_activity_registrations(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")

    if activity.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="只有活动创建者才能查看报名名单")

    registrations = db.query(Registration).filter(
        and_(
            Registration.activity_id == activity_id,
            Registration.status == RegistrationStatus.registered
        )
    ).all()

    result = []
    for reg in registrations:
        user = db.query(User).filter(User.id == reg.user_id).first()
        result.append(RegistrationDetail(
            registration_id=reg.id,
            user_id=user.id,
            email=user.email,
            student_id=reg.student_id,
            class_name=reg.class_name,
            contact=reg.contact,
            registered_at=reg.registered_at
        ))

    return result


@router.get("/api/my-registrations")
def get_my_registrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registrations = db.query(Registration).filter(
        and_(
            Registration.user_id == current_user.id,
            Registration.status == RegistrationStatus.registered
        )
    ).all()

    return [
        {
            "id": reg.id,
            "user_id": reg.user_id,
            "activity_id": reg.activity_id,
            "student_id": reg.student_id,
            "class_name": reg.class_name,
            "contact": reg.contact,
            "status": reg.status,
            "registered_at": reg.registered_at,
            "cancelled_at": reg.cancelled_at,
        }
        for reg in registrations
    ]


@router.delete("/api/registrations/{registration_id}")
def delete_registration(
    registration_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registration = db.query(Registration).filter(Registration.id == registration_id).first()

    if not registration:
        raise HTTPException(status_code=404, detail="报名记录不存在")

    if registration.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="只能删除自己的报名记录")

    activity = db.query(Activity).filter(Activity.id == registration.activity_id).first()
    if activity and activity.current_participants > 0:
        activity.current_participants -= 1

    db.delete(registration)
    db.commit()

    return {"message": "删除报名记录成功"}
