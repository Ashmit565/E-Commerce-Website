import re
import uuid
from datetime import datetime

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text

def generate_order_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M")
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"SS-{timestamp}-{unique_suffix}"

def generate_transaction_id(prefix: str = "TXN") -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_hex = uuid.uuid4().hex[:8].upper()
    return f"{prefix}-{timestamp}-{random_hex}"

