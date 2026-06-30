from fastapi import APIRouter

from api.history import history_manager

router = APIRouter(
    tags=["History"]
)


@router.get("/history/{machine_id}")
def get_history(machine_id: int):

    history = history_manager.get_history(machine_id)

    return {
        "machineID": machine_id,
        "history_size": len(history),
        "history": history
    }