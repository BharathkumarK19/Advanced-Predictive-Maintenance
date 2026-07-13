from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.services.mqtt_service import MQTTService
from api.services.telemetry_handler import handle_telemetry
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from api.websocket import manager
import asyncio
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
mqtt_service = MQTTService()

@app.on_event("startup")
async def startup():

    logger.info("=" * 60)
    manager.set_event_loop(asyncio.get_running_loop())
    logger.info("Starting Predictive Maintenance API")

    predictor.load()

    logger.info("Prediction model loaded successfully.")

    mqtt_service.set_message_callback(handle_telemetry)

    mqtt_service.start()

    logger.info("MQTT Subscriber Started")

    logger.info("API startup completed.")
    logger.info("=" * 60)

@app.on_event("shutdown")
def shutdown():

    mqtt_service.stop()
    logger.info("Predictive Maintenance API stopped.")

app.include_router(health_router)
app.include_router(predict_router)
app.include_router(history_router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await manager.connect(websocket)

    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket disconnected")
    except Exception:
        logger.exception("WebSocket endpoint failed")
        manager.disconnect(websocket)


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
