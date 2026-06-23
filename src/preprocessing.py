from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "raw"


def _resolve_data_path(path: str | Path) -> Path:
    """
    Resolve a data path relative to the repo, with a fallback to data/raw.

    This keeps the function usable from the repo root, from notebooks, and
    from tests that still pass legacy paths like ``data/PdM_telemetry.csv``.
    """
    candidate = Path(path)
    if candidate.is_file():
        return candidate

    repo_candidate = PROJECT_ROOT / candidate
    if repo_candidate.is_file():
        return repo_candidate

    raw_candidate = DATA_DIR / candidate.name
    if raw_candidate.is_file():
        return raw_candidate

    raise FileNotFoundError(f"Could not find data file: {path}")


def load_data(
    telemetry_path: str | Path = DATA_DIR / "PdM_telemetry.csv",
    machines_path: str | Path = DATA_DIR / "PdM_machines.csv",
):
    telemetry_file = _resolve_data_path(telemetry_path)
    machines_file = _resolve_data_path(machines_path)

    telemetry = pd.read_csv(telemetry_file)
    machines = pd.read_csv(machines_file)

    return telemetry, machines


def preprocess_data(telemetry, machines):
    telemetry = telemetry.copy()
    machines = machines.copy()

    telemetry["datetime"] = pd.to_datetime(telemetry["datetime"])

    master_df = telemetry.merge(
        machines,
        on="machineID",
        how="left",
    )

    master_df = master_df.sort_values(["machineID", "datetime"]).reset_index(drop=True)

    return master_df
