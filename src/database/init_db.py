from src.database.base import Base
from src.database.connection import engine

# Import models so SQLAlchemy knows about them
from src.models.machine import Machine
from src.models.sensor_reading import SensorReading
from src.models.prediction import Prediction


def init_database():
    Base.metadata.create_all(bind=engine)