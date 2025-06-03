from pydantic import BaseModel, Field
from typing import List
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
