# -*- coding: utf-8 -*-
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String)
    created_at = Column(DateTime, default = datetime.now(datetime.timezone.utc))
    # 🔗 Clé étrangère vers Category
    category_id = Column(Integer, ForeignKey("categories.id"))
    # 🔁 Relation directe : la catégorie associée à ce job
    category = relationship("Category", back_populates="jobs")

class Category():
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    # 🔁 Relation inverse : liste des jobs liés à cette catégorie
    jobs = relationship("Job", back_populates="category")