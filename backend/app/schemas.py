from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# 🔹 Catégories
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    model_config = {
        "from_attributes": True
    }

# 🔹 Jobs
class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=100, description="Le titre du job")
    company: str = Field(..., min_length=2, max_length=100, description="Le nom de l'entreprise")

class JobCreate(JobBase):
    category_id: int  # 🔗 Lien avec une catégorie

class Job(JobBase):
    id: int
    created_at: datetime
    category_id: int
    category: Category  # 🔁 Retourne l'objet complet de la catégorie

    model_config = {
        "from_attributes": True
    }

# 🔹 Liste paginée de jobs
class JobList(BaseModel):
    total: int
    jobs: List[Job]

# 🔹 Messages simples
class Message(BaseModel):
    message: str

# Schémas pour l'authentification et les utilisateurs
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None

class User(UserBase):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None