from sqlalchemy import Column, Integer, String

from src.database.base import Base


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, unique=True, nullable=False)
    model = Column(String(50))
    age = Column(Integer)