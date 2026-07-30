from enum import Enum


class Category(str, Enum):
    SEDAN = "Sedan"
    HATCHBACK = "Hatchback"
    SUV = "SUV"
    COMPACT_SUV = "Compact SUV"
    MUV = "MUV"
    COUPE = "Coupe"
    CONVERTIBLE = "Convertible"
    PICKUP = "Pickup"
    VAN = "Van"
    SPORTS = "Sports"
    LUXURY = "Luxury"


class FuelType(str, Enum):
    PETROL = "Petrol"
    DIESEL = "Diesel"
    ELECTRIC = "Electric"
    HYBRID = "Hybrid"
    CNG = "CNG"


class Transmission(str, Enum):
    MANUAL = "Manual"
    AUTOMATIC = "Automatic"
