"""
MedBangla AI - Centralized Logging Configuration
================================================
Configures structured console & rotating file logging for all subsystems:
- logs/app.log: Captures all application events (INFO, WARNING, ERROR)
- logs/error.log: Dedicated error log capturing exceptions and stack traces
"""

import os
import sys
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
LOGS_DIR = BACKEND_DIR / "logs"

# Standard log format with timestamps, logger names, line numbers, and request correlation
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | [%(name)s:%(funcName)s:%(lineno)d] | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


class RequestIdFilter(logging.Filter):
    """
    Injects request_id context into log records if present.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = "-"
        return True


def setup_logging(
    log_level: int = logging.INFO,
    enable_file_logging: bool = True,
    max_bytes: int = 10 * 1024 * 1024,  # 10 MB per file
    backup_count: int = 5,
) -> logging.Logger:
    """
    Initializes and configures the root logger with dual rotating file handlers
    and standard stream output.
    """
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Clear existing handlers to prevent duplicate lines
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
    req_filter = RequestIdFilter()

    # 1. Console Stream Handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    console_handler.addFilter(req_filter)
    root_logger.addHandler(console_handler)

    # 2. General Rotating File Handler (logs/app.log)
    if enable_file_logging:
        app_log_path = LOGS_DIR / "app.log"
        app_file_handler = RotatingFileHandler(
            filename=str(app_log_path),
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding="utf-8",
        )
        app_file_handler.setLevel(log_level)
        app_file_handler.setFormatter(formatter)
        app_file_handler.addFilter(req_filter)
        root_logger.addHandler(app_file_handler)

        # 3. Dedicated Error Rotating File Handler (logs/error.log)
        error_log_path = LOGS_DIR / "error.log"
        error_file_handler = RotatingFileHandler(
            filename=str(error_log_path),
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding="utf-8",
        )
        error_file_handler.setLevel(logging.ERROR)
        error_file_handler.setFormatter(formatter)
        error_file_handler.addFilter(req_filter)
        root_logger.addHandler(error_file_handler)

    # Mute noisy third-party loggers
    for noisy in ["urllib3", "httpx", "httpcore", "passlib", "multipart"]:
        logging.getLogger(noisy).setLevel(logging.WARNING)

    root_logger.info("Centralized logging system initialized. Log dir: %s", LOGS_DIR)
    return root_logger
