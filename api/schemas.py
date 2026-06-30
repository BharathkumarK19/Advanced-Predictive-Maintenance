from pydantic import BaseModel


class PredictionRequest(BaseModel):

    machineID: int

    volt: float

    rotate: float

    pressure: float

    vibration: float

    age: int

    model: str

    error_flag: int


class PredictionResponse(BaseModel):

    anomaly: bool

    anomaly_label: int

    anomaly_score: float

    risk_level: str