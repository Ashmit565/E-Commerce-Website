from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.address import Address
from app.schemas.address import AddressOut, AddressCreate, AddressUpdate
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.get("", response_model=List[AddressOut])
def list_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()

@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_address(
    addr_in: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if addr_in.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})

    address = Address(
        user_id=current_user.id,
        full_name=addr_in.full_name.strip(),
        phone_number=addr_in.phone_number.strip(),
        address_line1=addr_in.address_line1.strip(),
        address_line2=addr_in.address_line2.strip() if addr_in.address_line2 else None,
        city=addr_in.city.strip(),
        state=addr_in.state.strip(),
        postal_code=addr_in.postal_code.strip(),
        country=addr_in.country or "India",
        is_default=addr_in.is_default or False
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

@router.put("/{address_id}", response_model=AddressOut)
def update_address(
    address_id: int,
    addr_in: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    if addr_in.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})

    update_data = addr_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address

@router.delete("/{address_id}")
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(address)
    db.commit()
    return {"message": "Address deleted successfully"}

