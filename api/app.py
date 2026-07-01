from fastapi import FastAPI

from api.predictor import predictor
from api.routers.predict import router as predict_router
from api.routers.health import router as health_router
from api.routers.history import router as history_router
from src.logger import get_logger

app = FastAPI(
    title="Advanced Predictive Maintenance API",
    description="Industrial IoT Predictive Maintenance",
    version="1.0.0"
)

logger = get_logger()


@app.on_event("startup")
def startup():
    predictor.load()
    logger.info("Predictor loaded successfully.")


app.include_router(health_router)
app.include_router(predict_router)
app.include_router(history_router)


@app.get("/")
def home():
    return {
        "message": "Predictive Maintenance API is running"
    }
