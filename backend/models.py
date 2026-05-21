from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


class ActivityStatus(str, enum.Enum):
    open = "open"
    upcoming = "upcoming"
    ongoing = "ongoing"
    ended = "ended"


class RegistrationStatus(str, enum.Enum):
    registered = "registered"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    student_id = Column(String(20), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    activities = relationship("Activity", back_populates="creator", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="user", cascade="all, delete-orphan")


class ActivityLocation(Base):
    __tablename__ = "activity_locations"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    location_name = Column(String(100), nullable=False)

    activity = relationship("Activity", back_populates="locations")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    volunteer_count = Column(Integer, nullable=False)
    max_participants = Column(Integer, nullable=False)
    current_participants = Column(Integer, default=0)
    status = Column(Enum(ActivityStatus), default=ActivityStatus.open)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="activities")
    registrations = relationship("Registration", back_populates="activity", cascade="all, delete-orphan")
    locations = relationship("ActivityLocation", back_populates="activity", cascade="all, delete-orphan")


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    student_id = Column(String(20), nullable=False)
    class_name = Column(String(100), nullable=False)
    contact = Column(String(50), nullable=False)
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.registered)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint('user_id', 'activity_id', 'status', name='uq_user_activity_registered'),
    )

    user = relationship("User", back_populates="registrations")
    activity = relationship("Activity", back_populates="registrations")
