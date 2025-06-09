from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .database import engine, SessionLocal
from . import models, schemas, crud, security
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta

# Créer les tables dans la base de données
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 autorise TOUTES les origines (pendant développement)
    allow_credentials=True,
    allow_methods=["*"],  # 👈 autorise toutes les méthodes : GET, POST, PUT, DELETE...
    allow_headers=["*"],  # 👈 autorise tous les headers
)

# Configuration OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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

# Dependency pour obtenir l'utilisateur actuel
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = security.verify_token(token, credentials_exception)
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# Endpoints d'authentification
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user_email = crud.get_user_by_email(db, email=user.email)
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user_username = crud.get_user_by_username(db, username=user.username)
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.User)
async def update_user(user_update: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    updated_user = crud.update_user(db, user_id=current_user.id, user_update=user_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

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
