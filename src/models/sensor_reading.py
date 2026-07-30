from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer

from src.database.base import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)

    machine_id = Column(
        Integer,
        ForeignKey("machines.machine_id"),
        nullable=False,
    )

    timestamp = Column(DateTime, nullable=False)

    volt = Column(Float)
    rotate = Column(Float)
    pressure = Column(Float)
    vibration = Column(Float)

    error_flag = Column(Integer)