from sqlalchemy.orm import Session

from app.modules.vehicles.model import Vehicle
from app.modules.vehicles.schema import VehicleCreate
from app.modules.vehicles.schema import VehicleUpdate
from sqlalchemy import select
from app.modules.vehicles.model import Vehicle


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

    if sort_by:
        column = getattr(Vehicle, sort_by)

        if order == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

    query = query.offset(skip).limit(limit)
    
    return db.scalars(query).all()


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