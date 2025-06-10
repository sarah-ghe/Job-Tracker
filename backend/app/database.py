from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database credentials from environment variables
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "job_tracker_db")

# Construct database URL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create SQLAlchemy engine
try:
    engine = create_engine(DATABASE_URL)
    print("✅ Connexion à la base réussie.")
except Exception as e:
    print("❌ Erreur de connexion :", e)

print(DATABASE_URL)
# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print("SessionLocal:", SessionLocal)

# Create base class for models
Base = declarative_base()
print("Base:", Base)