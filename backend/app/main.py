from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, sessionmaker
from .database import engine, SessionLocal
from . import models, schemas, crud
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware


# Créer les tables dans la base de données
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 autorise TOUTES les origines (pendant développement)
    allow_credentials=True,
    allow_methods=["*"],  # 👈 autorise toutes les méthodes : GET, POST, PUT, DELETE...
    allow_headers=["*"],  # 👈 autorise tous les headers
)

@app.get("/")
def root():
    return {"message": "Bienvenue sur ton premier projet FastAPI 🚀"}

# Dependency pour la session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ CREATE JOB
@app.post("/jobs/", response_model=schemas.Job)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    # Vérifie que la catégorie existe
    category = crud.get_category_by_id(db, job.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.create_job(db, job)

# ✅ READ JOBS
@app.get("/jobs/", response_model=schemas.JobList)
def read_jobs(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_jobs(db, skip=skip, limit=limit)

# ✅ GET JOB BY ID
@app.get("/jobs/{job_id}", response_model=schemas.Job)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = crud.get_job_by_id(db, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# ✅ DELETE JOB
@app.delete("/jobs/{job_id}", response_model=schemas.Message)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = crud.delete_job(db, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": f"Job with id {job_id} deleted successfully"}

# ✅ UPDATE JOB
@app.put("/jobs/{job_id}", response_model=schemas.Job)
def update_job(job_id: int, job: schemas.JobCreate, db: Session = Depends(get_db)):
    # Vérifie que la nouvelle catégorie existe
    category = crud.get_category_by_id(db, job.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_job = crud.update_job(db, job_id, job)
    if updated_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return updated_job

@app.get("/jobs/search", response_model=List[schemas.Job])
def search_jobs(
    title: str = None,
    company: str = None,
    search: str = None,
    sort_by: str = Query(default="id", enum=["id", "title", "company"]),
    sort_order: str = Query(default="asc", enum=["asc", "desc"]),
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(models.Job)

    if search:
        query = query.filter(
            or_(
                models.Job.title.ilike(f"%{search}%"),
                models.Job.company.ilike(f"%{search}%")
            )
        )
    if title:
        query = query.filter(models.Job.title.ilike(f"%{title}%"))
    if company:
        query = query.filter(models.Job.company.ilike(f"%{company}%"))

    sort_column = getattr(models.Job, sort_by)
    if sort_order == "desc":
        sort_column = sort_column.desc()
    query = query.order_by(sort_column)

    query = query.offset(skip).limit(limit)
    return query.all()


@app.get("/jobs/count")
def count_jobs(
    title: str = None,
    company: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Job)

    if search:
        query = query.filter(
            or_(
                models.Job.title.ilike(f"%{search}%"),
                models.Job.company.ilike(f"%{search}%")
            )
        )
    if title:
        query = query.filter(models.Job.title.ilike(f"%{title}%"))
    if company:
        query = query.filter(models.Job.company.ilike(f"%{company}%"))

    total = query.count()
    return {"total_jobs": total}


@app.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, category)


@app.get("/categories/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@app.get("/categories/{category_id}", response_model=schemas.Category)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category_by_id(db, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@app.delete("/categories/{category_id}", response_model=schemas.Message)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.delete_category(db, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": f"Category with id {category_id} deleted successfully"}


@app.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category_data: schemas.CategoryCreate, db: Session = Depends(get_db)):
    updated_category = crud.update_category(db, category_id, category_data)
    if updated_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category
