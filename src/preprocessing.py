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
    errors_path: str | Path = DATA_DIR / "PdM_errors.csv",
):
    telemetry_file = _resolve_data_path(telemetry_path)
    machines_file = _resolve_data_path(machines_path)
    errors_file = _resolve_data_path(errors_path)

    telemetry = pd.read_csv(telemetry_file)
    machines = pd.read_csv(machines_file)
    errors = pd.read_csv(errors_file)

    return telemetry, machines, errors


def preprocess_data(telemetry, machines, errors=None):
    telemetry = telemetry.copy()
    machines = machines.copy()

    telemetry["datetime"] = pd.to_datetime(telemetry["datetime"])

    master_df = telemetry.merge(
        machines,
        on="machineID",
        how="left",
    )

    if errors is not None:
        errors = errors.copy()
        errors["datetime"] = pd.to_datetime(errors["datetime"])

        # Collapse error rows down to one flag per machine/timestamp so the
        # telemetry grain stays one row per observation.
        error_events = (
            errors[["datetime", "machineID"]]
            .drop_duplicates()
            .assign(error_flag=1)
        )

        master_df = master_df.merge(
            error_events,
            on=["datetime", "machineID"],
            how="left",
        )

        master_df["error_flag"] = (
            master_df["error_flag"]
            .fillna(0)
            .astype(int)
        )
    else:
        master_df["error_flag"] = 0

    master_df = (
        master_df.sort_values(["machineID", "datetime"])
        .reset_index(drop=True)
    )

    return master_df
