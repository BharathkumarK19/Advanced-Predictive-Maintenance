import os
from pathlib import Path

import dagshub
import mlflow

from dotenv import load_dotenv
load_dotenv()

USERNAME = os.getenv("DAGSHUB_USERNAME")
TOKEN = os.getenv("DAGSHUB_TOKEN")

dagshub.init(
    repo_owner="BharathkumarK19",
    repo_name="Advanced-Predictive-Maintenance",
    mlflow=True
)
mlflow.set_experiment(
    "Predictive-Maintenance"
)
def start_run(run_name=None):
    return mlflow.start_run(run_name=run_name)
def log_parameters(params: dict):

    mlflow.log_params(params)
def log_metrics(metrics: dict):

    mlflow.log_metrics(metrics)
def log_artifact(path):

    mlflow.log_artifact(path)
def log_model(model):

    mlflow.sklearn.log_model(
        model,
        artifact_path="model"
    )
def end_run():

    mlflow.end_run()
