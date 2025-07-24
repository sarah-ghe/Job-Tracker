from fastapi import HTTPException
from sqlalchemy import or_, desc
from sqlalchemy.orm import Session
from . import models, schemas
from .security import pwd_context
from typing import List, Optional
from datetime import datetime


# Fonctions pour les utilisateurs
def get_user(db: Session, user_id: int):
    return get_user_by_id(db, user_id)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        bio=user.bio,
        location=user.location,
        is_active=True,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Mettre à jour les champs modifiables
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    
    db_user.updated_at = datetime.now()
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# Job operations
def get_jobs(db: Session, skip: int = 0, limit: int = 10, user_id: Optional[int] = None):
    query = db.query(models.Job)
    
    # Filter by user if user_id is provided
    if user_id:
        query = query.filter(models.Job.owner_id == user_id)
    
    total = query.count()
    items = query.order_by(desc(models.Job.created_at)).offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

def get_job_by_id(db: Session, job_id: int):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def create_job(db: Session, job: schemas.JobCreate, user_id: int):
    db_job = models.Job(
        title=job.title,
        company=job.company,
        location=job.location,
        description=job.description,
        salary=job.salary,
        url=job.url,
        status=job.status,
        notes=job.notes,
        category_id=job.category_id,
        owner_id=user_id,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(db: Session, job_id: int, job_update: schemas.JobCreate):
    db_job = get_job_by_id(db, job_id)
    if not db_job:
        return None
    
    # Mettre à jour tous les champs
    db_job.title = job_update.title
    db_job.company = job_update.company
    db_job.location = job_update.location
    db_job.description = job_update.description
    db_job.salary = job_update.salary
    db_job.url = job_update.url
    db_job.status = job_update.status
    db_job.notes = job_update.notes
    db_job.category_id = job_update.category_id
    db_job.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: int):
    db_job = get_job_by_id(db, job_id)
    if not db_job:
        return None
    
    db.delete(db_job)
    db.commit()
    return db_job

# Category operations
def get_categories(db: Session):
    return db.query(models.Category).all()

def get_category_by_id(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category_data: schemas.CategoryCreate):
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        return None
    
    db_category.name = category_data.name
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        return None
    
    db.delete(db_category)
    db.commit()
    return db_category

def search_jobs(db: Session, title: str = None, company: str = None, search: str = None):
    query = db.query(models.Job)

    if title:
        query = query.filter(models.Job.title.ilike(f"%{title}%"))
    if company:
        query = query.filter(models.Job.company.ilike(f"%{company}%"))
    if search:
        query = query.filter(
            or_(
                models.Job.title.ilike(f"%{search}%"),
                models.Job.company.ilike(f"%{search}%")
            )
        )
    return query.all()