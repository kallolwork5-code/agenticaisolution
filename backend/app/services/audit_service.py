from datetime import datetime
import json

def log_agent_decision(state):
    print(json.dumps({
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "IngestionAgent",
        "decision": state
    }, indent=2))
