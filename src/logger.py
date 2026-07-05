import logging
import os
import sys


def get_logger():

    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    os.makedirs("logs", exist_ok=True)

    logger = logging.getLogger("predictive-maintenance")

    logger.setLevel(
        getattr(logging, log_level, logging.INFO)
    )

    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    # Console Logs (kubectl logs)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # File Logs
    file_handler = logging.FileHandler(
        "logs/pipeline.log",
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    logger.propagate = False

    return logger