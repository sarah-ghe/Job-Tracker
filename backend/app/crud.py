from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from . import models, schemas

def get_jobs(db: Session, skip: int = 0, limit: int = 10):
    total = db.query(models.Job).count()  # total jobs
    jobs = db.query(models.Job).offset(skip).limit(limit).all()  # paginated
    return {"total": total, "jobs": jobs}

def get_job_by_id(db: Session, job_id:int):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def create_job(db: Session, job: schemas.JobCreate):
    db_job = models.Job(title=job.title, company=job.company, category_id=job.category_id)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id:int):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job is None:
        return None
    db.delete(job)
    db.commit()
    return job

def update_job(db: Session, job_id: int, job_data: schemas.JobCreate):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job is None:
        return None
    job.title = job_data.title
    job.company = job_data.company
    job.category_id = job_data.category_id
    db.commit()
    db.refresh(job)
    return job

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

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session):
    return db.query(models.Category).all()

def get_category_by_id(db: Session, category_id:int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def delete_category(db: Session, category_id:int):
    category = get_category_by_id(db, category_id)
    if category is None:
        return None
    db.delete(category)
    db.commit()
    return category

def update_category(db: Session, category_id: int, category_data: schemas.CategoryCreate):
    category = get_category_by_id(db, category_id)
    if category is None:
        return None
    category.name = category_data.name
    db.commit()
    db.refresh(category)
    return category