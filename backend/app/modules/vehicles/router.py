from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from typing import Literal
from app.modules.vehicles.schema import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    PurchaseRequest,
    InventoryStatsResponse,
)
from app.modules.vehicles.enums import (
    Category,
    FuelType,
    Transmission,
)

from app.modules.vehicles.service import (
    create_vehicle,
    get_all_vehicles,
    count_all_vehicles,
    get_vehicle_by_id,
    update_vehicle,
    delete_vehicle,
    purchase_vehicle,
    restock_vehicle,
    get_inventory_stats,
    get_low_stock_vehicles,
)
from app.modules.auth.dependencies import require_admin
from app.modules.auth.model import User

from app.modules.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/api/v1/vehicles",
    tags=["Vehicles"],
)

@router.get(
    "/stats",
    response_model=InventoryStatsResponse,
)
def inventory_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return get_inventory_stats(db)

@router.get(
    "/low-stock",
    response_model=list[VehicleResponse],
)
def low_stock_vehicles(
    threshold: int = Query(5, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return get_low_stock_vehicles(
        db=db,
        threshold=threshold,
    )

@router.get(
    "/search",
    response_model=list[VehicleResponse],
)
def search_vehicles(
    make: str | None = None,
    model: str | None = None,
    category: Category | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    response: Response = None,
):
    """Dedicated search endpoint: by make, model, category, or price range."""
    filters = dict(
        make=make,
        model=model,
        category=category,
        min_price=min_price,
        max_price=max_price,
    )

    total = count_all_vehicles(db=db, **filters)
    response.headers["X-Total-Count"] = str(total)

    return get_all_vehicles(db=db, **filters, skip=skip, limit=limit)


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
    search: str | None = None,
    min_year: int | None = None,
    max_year: int | None = None,
    in_stock: bool | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort_by: Literal["make", "model", "year", "price", "quantity", "created_at"] | None = None,
    order: Literal["asc", "desc"] = "asc",
    db: Session = Depends(get_db),
    response: Response = None,
):
    filters = dict(
        make=make,
        model=model,
        category=category,
        fuel_type=fuel_type,
        transmission=transmission,
        year=year,
        min_price=min_price,
        max_price=max_price,
        search=search,
        min_year=min_year,
        max_year=max_year,
        in_stock=in_stock,
    )

    total = count_all_vehicles(db=db, **filters)
    response.headers["X-Total-Count"] = str(total)

    return get_all_vehicles(
        db=db,
        **filters,
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


@router.post(
    "/{vehicle_id}/purchase",
    response_model=VehicleResponse,
)
def purchase(
    vehicle_id: int,
    request: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return purchase_vehicle(
        db=db,
        vehicle_id=vehicle_id,
        quantity=request.quantity,
    )


@router.post(
    "/{vehicle_id}/restock",
    response_model=VehicleResponse,
)
def restock(
    vehicle_id: int,
    request: PurchaseRequest,   # or QuantityRequest if you renamed it
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return restock_vehicle(
        db=db,
        vehicle_id=vehicle_id,
        quantity=request.quantity,
    )

