from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.vehicles.schema import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
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
    db: Session = Depends(get_db),
):
    return get_all_vehicles(db)

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