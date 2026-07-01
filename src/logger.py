import logging
import os


def get_logger():

    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    os.makedirs(
        "logs",
        exist_ok=True
    )

    logging.basicConfig(
        filename="logs/pipeline.log",
        level=getattr(logging, log_level, logging.INFO),
        format="%(asctime)s - %(levelname)s - %(message)s"
    )

    return logging.getLogger(__name__)
