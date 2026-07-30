from sqlalchemy.orm import Session

from app.modules.vehicles.model import Vehicle
from app.modules.vehicles.schema import VehicleCreate
from app.modules.vehicles.schema import VehicleUpdate
from sqlalchemy import select, func
from app.modules.vehicles.model import Vehicle
from fastapi import HTTPException, status



def create_vehicle(db: Session, vehicle: VehicleCreate):
    db_vehicle = Vehicle(**vehicle.model_dump())

    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)

    return db_vehicle


from app.modules.vehicles.enums import (
    Category,
    FuelType,
    Transmission,
)

def get_all_vehicles(
    db: Session,
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
    skip: int = 0,
    limit: int = 10,
    sort_by: str | None = None,
    order: str = "asc",
):
    query = select(Vehicle)

    if make:
        query = query.where(Vehicle.make.ilike(f"%{make}%"))

    if model:
        query = query.where(Vehicle.model.ilike(f"%{model}%"))

    if category:
        query = query.where(Vehicle.category == category)

    if fuel_type:
        query = query.where(Vehicle.fuel_type == fuel_type)

    if transmission:
        query = query.where(Vehicle.transmission == transmission)

    if year:
        query = query.where(Vehicle.year == year)

    if min_price is not None:
        query = query.where(Vehicle.price >= min_price)

    if max_price is not None:
        query = query.where(Vehicle.price <= max_price)

    if search:
        like = f"%{search}%"
        query = query.where(
            Vehicle.make.ilike(like) | Vehicle.model.ilike(like)
        )

    if min_year is not None:
        query = query.where(Vehicle.year >= min_year)

    if max_year is not None:
        query = query.where(Vehicle.year <= max_year)

    if in_stock:
        query = query.where(Vehicle.quantity > 0)

    if sort_by:
        column = getattr(Vehicle, sort_by)

        if order == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

    query = query.offset(skip).limit(limit)

    return db.scalars(query).all()


def count_all_vehicles(
    db: Session,
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
):
    query = select(func.count()).select_from(Vehicle)

    if make:
        query = query.where(Vehicle.make.ilike(f"%{make}%"))

    if model:
        query = query.where(Vehicle.model.ilike(f"%{model}%"))

    if category:
        query = query.where(Vehicle.category == category)

    if fuel_type:
        query = query.where(Vehicle.fuel_type == fuel_type)

    if transmission:
        query = query.where(Vehicle.transmission == transmission)

    if year:
        query = query.where(Vehicle.year == year)

    if min_price is not None:
        query = query.where(Vehicle.price >= min_price)

    if max_price is not None:
        query = query.where(Vehicle.price <= max_price)

    if search:
        like = f"%{search}%"
        query = query.where(
            Vehicle.make.ilike(like) | Vehicle.model.ilike(like)
        )

    if min_year is not None:
        query = query.where(Vehicle.year >= min_year)

    if max_year is not None:
        query = query.where(Vehicle.year <= max_year)

    if in_stock:
        query = query.where(Vehicle.quantity > 0)

    return db.scalar(query) or 0


def get_vehicle_by_id(db: Session, vehicle_id: int):
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()


def update_vehicle(
    db: Session,
    vehicle_id: int,
    vehicle: VehicleUpdate,
):
    db_vehicle = get_vehicle_by_id(db, vehicle_id)

    if not db_vehicle:
        return None

    update_data = vehicle.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_vehicle, key, value)

    db.commit()
    db.refresh(db_vehicle)

    return db_vehicle


def delete_vehicle(db: Session, vehicle_id: int):
    db_vehicle = get_vehicle_by_id(db, vehicle_id)

    if not db_vehicle:
        return None

    db.delete(db_vehicle)
    db.commit()

    return db_vehicle

def purchase_vehicle(
    db: Session,
    vehicle_id: int,
    quantity: int,
):
    vehicle = db.get(Vehicle, vehicle_id)

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    if vehicle.quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock",
        )

    vehicle.quantity -= quantity

    db.commit()
    db.refresh(vehicle)

    return vehicle

def restock_vehicle(
    db: Session,
    vehicle_id: int,
    quantity: int,
):
    vehicle = db.get(Vehicle, vehicle_id)

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    vehicle.quantity += quantity

    db.commit()
    db.refresh(vehicle)

    return vehicle

def get_inventory_stats(db: Session):
    total_vehicle_models = db.scalar(
        select(func.count(Vehicle.id))
    )

    total_stock = db.scalar(
        select(func.sum(Vehicle.quantity))
    ) or 0

    inventory_value = db.scalar(
        select(func.sum(Vehicle.price * Vehicle.quantity))
    ) or 0

    out_of_stock = db.scalar(
        select(func.count(Vehicle.id)).where(Vehicle.quantity == 0)
    ) or 0

    return {
        "total_vehicle_models": total_vehicle_models,
        "total_stock": total_stock,
        "inventory_value": inventory_value,
        "out_of_stock": out_of_stock,
    }

def get_low_stock_vehicles(
    db: Session,
    threshold: int = 5,
):
    query = (
        select(Vehicle)
        .where(Vehicle.quantity <= threshold)
        .order_by(Vehicle.quantity.asc())
    )

    return db.scalars(query).all()