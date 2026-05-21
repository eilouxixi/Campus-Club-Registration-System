from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List
from models import UserRole, ActivityStatus, RegistrationStatus
import re


class UserBase(BaseModel):
    email: EmailStr
    student_id: str


class UserCreate(BaseModel):
    email: str
    student_id: str
    password: str

    @field_validator('email')
    @classmethod
    def email_must_be_qq(cls, v: str) -> str:
        if not v.endswith('@qq.com'):
            raise ValueError('邮箱必须以 @qq.com 结尾')
        return v

    @field_validator('student_id')
    @classmethod
    def student_id_must_be_valid(cls, v: str) -> str:
        if not re.match(r'^(212506|212406|212306|212206|212106)\d{3}$', v):
            raise ValueError('学号必须是9位数字且以212506、212406、212306、212206或212106开头')
        return v


class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    volunteer_count: int
    max_participants: int


class ActivityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    locations: List[str]
    volunteer_count: int
    start_time: datetime
    end_time: datetime
    max_participants: int


class ActivityLocationResponse(BaseModel):
    id: int
    location_name: str

    class Config:
        from_attributes = True


class ActivityResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    volunteer_count: int
    max_participants: int
    current_participants: int
    status: ActivityStatus
    created_by: int
    created_at: datetime
    locations: List[ActivityLocationResponse] = []
    is_registered: bool = False
    remaining_spots: int = 0

    class Config:
        from_attributes = True


class RegistrationCreate(BaseModel):
    activity_id: int
    student_id: str
    class_name: str
    contact: str


class RegistrationResponse(BaseModel):
    id: int
    user_id: int
    activity_id: int
    student_id: str
    class_name: str
    contact: str
    status: RegistrationStatus
    registered_at: datetime
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RegistrationDetail(BaseModel):
    registration_id: int
    user_id: int
    email: str
    student_id: str
    class_name: str
    contact: str
    registered_at: datetime
