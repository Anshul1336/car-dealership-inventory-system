from datetime import datetime

from app.modules.vehicles.enums import (
    Category,
    FuelType,
    Transmission,
)

from sqlalchemy import String, Integer, Float, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    make: Mapped[str] = mapped_column(String(50), nullable=False)

    model: Mapped[str] = mapped_column(String(50), nullable=False)

    year: Mapped[int] = mapped_column(Integer, nullable=False)

    category: Mapped[Category] = mapped_column(
        Enum(Category),
        nullable=False,
    )
    fuel_type: Mapped[FuelType] = mapped_column(
        Enum(FuelType),
        nullable=False,
    )
    
    transmission: Mapped[Transmission] = mapped_column(
        Enum(Transmission),
        nullable=False,
    )

    color: Mapped[str] = mapped_column(String(30), nullable=False)

    price: Mapped[float] = mapped_column(Float, nullable=False)

    quantity: Mapped[int] = mapped_column(Integer, default=1)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )