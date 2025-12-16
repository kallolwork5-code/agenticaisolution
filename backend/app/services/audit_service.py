import logging

logger = logging.getLogger("audit")
logging.basicConfig(level=logging.INFO)

def log_agent_decision(state: dict):
    logger.info(
        f"[AUDIT] file={state.get('file_name')} "
        f"type={state.get('data_type')} "
        f"confidence={state.get('confidence')}"
    )
