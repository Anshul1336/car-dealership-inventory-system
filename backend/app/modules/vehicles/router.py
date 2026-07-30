from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from typing import Literal
from app.modules.vehicles.schema import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
)
from app.modules.vehicles.enums import (
    Category,
    FuelType,
    Transmission,
)

from app.modules.vehicles.service import (
    create_vehicle,
    get_all_vehicles,
    get_vehicle_by_id,
    update_vehicle,
    delete_vehicle,
)
from app.modules.auth.dependencies import require_admin
from app.modules.auth.model import User

router = APIRouter(
    prefix="/api/v1/vehicles",
    tags=["Vehicles"],
)


@router.get(
    "/",
    response_model=list[VehicleResponse],
)
def list_vehicles(
    make: str | None = None,
    model: str | None = None,
    category: Category | None = None,
    fuel_type: FuelType | None = None,
    transmission: Transmission | None = None,
    year: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort_by: Literal["make", "model", "year", "price", "quantity"] | None = None,
    order: Literal["asc", "desc"] = "asc",
    db: Session = Depends(get_db),
):
    return get_all_vehicles(
        db=db,
        make=make,
        model=model,
        category=category,
        fuel_type=fuel_type,
        transmission=transmission,
        year=year,
        min_price=min_price,
        max_price=max_price,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )

@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponse,
)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
):
    vehicle = get_vehicle_by_id(db, vehicle_id)

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    return vehicle



@router.post(
    "/",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return create_vehicle(db, vehicle)

@router.put(
    "/{vehicle_id}",
    response_model=VehicleResponse,
)
def edit_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    updated_vehicle = update_vehicle(db, vehicle_id, vehicle)

    if updated_vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    return updated_vehicle

@router.delete("/{vehicle_id}")
def remove_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    deleted_vehicle = delete_vehicle(db, vehicle_id)

    if deleted_vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    return {"message": "Vehicle deleted successfully"}