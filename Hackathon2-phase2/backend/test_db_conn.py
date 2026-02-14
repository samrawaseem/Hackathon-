import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"Attempting to connect to: {DATABASE_URL.split('@')[-1] if DATABASE_URL else 'None'}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.fetchone()
        print(f"✅ Connection successful!")
        print(f"Database version: {version[0]}")
except Exception as e:
    print(f"❌ Connection failed!")
    print(f"Error: {e}")
