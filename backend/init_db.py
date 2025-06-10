import sys
import os
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent))

from app.database import engine, SessionLocal, Base
from app.models import User, Job, Category
from app.security import pwd_context
from datetime import datetime, timedelta
import random

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Check if we already have data
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping initialization.")
            return
        
        print("Initializing database with sample data...")
        
        # Create categories
        categories = [
            Category(name="Software Development"),
            Category(name="Data Science"),
            Category(name="DevOps"),
            Category(name="Product Management"),
            Category(name="UX/UI Design"),
            Category(name="Marketing"),
            Category(name="Sales"),
            Category(name="Customer Support"),
        ]
        db.add_all(categories)
        db.commit()
        
        # Create a test user
        test_user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=pwd_context.hash("password123"),
            first_name="Test",
            last_name="User",
            bio="This is a test user account for the Job Tracker application.",
            location="Remote"
        )
        db.add(test_user)
        db.commit()
        
        # Create sample jobs
        companies = ["Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Spotify", "Twitter", "LinkedIn", "Airbnb"]
        locations = ["Remote", "New York, NY", "San Francisco, CA", "Seattle, WA", "Austin, TX", "Boston, MA", "London, UK", "Berlin, Germany", "Paris, France"]
        statuses = ["applied", "interview", "offer", "rejected"]
        
        sample_jobs = []
        for i in range(20):
            # Generate a random date within the last 30 days
            days_ago = random.randint(0, 30)
            post_date = datetime.utcnow() - timedelta(days=days_ago)
            
            job = Job(
                title=f"{random.choice(['Junior', 'Senior', 'Lead', 'Principal'])} {random.choice(['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Data'])} {random.choice(['Developer', 'Engineer', 'Architect'])}",
                company=random.choice(companies),
                location=random.choice(locations),
                description=f"This is a sample job description for job #{i+1}. It includes responsibilities, requirements, and benefits.",
                salary=f"${random.randint(70, 180)}k - ${random.randint(90, 200)}k",
                url=f"https://example.com/jobs/{i+1}",
                date_posted=post_date,
                status=random.choice(statuses),
                notes=f"Sample notes for job application #{i+1}",
                category_id=random.randint(1, len(categories)),
                owner_id=test_user.id
            )
            sample_jobs.append(job)
        
        db.add_all(sample_jobs)
        db.commit()
        
        print(f"✅ Database initialized with:")
        print(f"  - {len(categories)} categories")
        print(f"  - {len(sample_jobs)} sample jobs")
        print(f"  - Test user: username='testuser', password='password123'")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()