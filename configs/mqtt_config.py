from pathlib import Path
import os

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=PROJECT_ROOT / ".env", override=False)


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if value is None:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value.strip().strip('"').strip("'")


MQTT_BROKER = _required_env("MQTT_BROKER")
MQTT_PORT = int(_required_env("MQTT_PORT"))
MQTT_USERNAME = _required_env("MQTT_USERNAME")
MQTT_PASSWORD = _required_env("MQTT_PASSWORD")
MQTT_TOPIC = _required_env("MQTT_TOPIC")
