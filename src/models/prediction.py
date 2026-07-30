from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer

from src.database.base import Base
from sqlalchemy import String



class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    machine_id = Column(
        Integer,
        ForeignKey("machines.machine_id"),
        nullable=False,
    )
    risk_level = Column(String(20))
    timestamp = Column(DateTime, nullable=False)

    anomaly_score = Column(Float)

    anomaly_label = Column(Integer)