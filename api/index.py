import sys
import os
from pathlib import Path

# Add backend directory to sys.path so app modules resolve seamlessly on Vercel
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the FastAPI instance
from app.main import app

# Export for Vercel Serverless Function
export_app = app

