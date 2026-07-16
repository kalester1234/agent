import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models.models import Base

# Path to SQLite DB (same as used elsewhere)
DB_PATH = os.getenv('SQLITE_DB_PATH', 'reports.db')

engine = create_engine(f'sqlite:///{DB_PATH}', connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure all tables are created (including new ones)
def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
