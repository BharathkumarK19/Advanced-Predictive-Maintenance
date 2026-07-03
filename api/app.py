from fastapi import FastAPI

from api.predictor import predictor
from api.routers.predict import router as predict_router
from api.routers.health import router as health_router
from api.routers.history import router as history_router
from src.logger import get_logger
import time

from prometheus_client import generate_latest
from prometheus_client import CONTENT_TYPE_LATEST
from fastapi.responses import Response

from api.metrics import (
    REQUEST_COUNT,
    REQUEST_LATENCY,
    IN_PROGRESS
)

app = FastAPI(
    title="Advanced Predictive Maintenance API",
    description="Industrial IoT Predictive Maintenance",
    version="1.0.0"
)
@app.middleware("http")
async def metrics_middleware(request, call_next):

    IN_PROGRESS.inc()

    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path
    ).inc()

    REQUEST_LATENCY.labels(
        endpoint=request.url.path
    ).observe(duration)

    IN_PROGRESS.dec()

    return response

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
@app.get("/metrics")
def metrics():

    return Response(
        generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )