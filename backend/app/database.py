from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus

password = quote_plus("admin")
DATABASE_URL = f"postgresql://postgres:{password}@localhost:5432/job_tracker_db"

try:
    engine = create_engine(DATABASE_URL)
    print("✅ Connexion à la base réussie.")
except Exception as e:
    print("❌ Erreur de connexion :", e)

print(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print("SessionLocal:", SessionLocal)

Base = declarative_base()
print("Base:", Base)
