from collections import defaultdict, deque


class HistoryManager:
    """
    Stores the latest sensor readings for every machine.
    """

    def __init__(self, max_history=24):
        self.max_history = max_history

        self.history = defaultdict(
            lambda: deque(maxlen=max_history)
        )

    def add_reading(self, machine_id, reading):
        """
        Add one sensor reading.
        """
        self.history[machine_id].append(reading)

    def get_history(self, machine_id):
        """
        Return all stored readings.
        """
        return list(self.history[machine_id])

    def history_length(self, machine_id):
        return len(self.history[machine_id])

    def update_last_reading(self, machine_id, updates):
        """
        Merge prediction results into the latest stored reading.
        """

        if not self.history[machine_id]:
            return None

        current = self.history[machine_id][-1]
        merged = {
            **current,
            **updates,
        }
        self.history[machine_id][-1] = merged
        return merged


history_manager = HistoryManager()
