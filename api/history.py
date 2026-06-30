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


history_manager = HistoryManager()