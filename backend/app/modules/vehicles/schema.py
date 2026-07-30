from pydantic import BaseModel, Field
from typing import Optional
from app.modules.vehicles.enums import (
    Category,
    FuelType,
    Transmission,
)

class VehicleBase(BaseModel):
    make: str = Field(..., min_length=2, max_length=50)
    model: str = Field(..., min_length=1, max_length=50)
    year: int = Field(..., ge=1900, le=2100)

    category: Category
    fuel_type: FuelType
    transmission: Transmission

    color: str

    price: float = Field(..., gt=0)

    quantity: int = Field(..., ge=0)


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None

    category: Optional[Category] = None
    fuel_type: Optional[FuelType] = None
    transmission: Optional[Transmission] = None

    color: Optional[str] = None

    price: Optional[float] = None

    quantity: Optional[int] = None


class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True