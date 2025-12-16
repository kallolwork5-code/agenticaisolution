"""
Date parsing utilities.

Purpose:
- Convert strings / timestamps to Python date
- Handle None / NaN safely
"""

from datetime import date
import pandas as pd


def parse_date(value):
    """
    Convert input to datetime.date or None.
    """
    if value is None:
        return None

    if isinstance(value, date):
        return value

    if isinstance(value, str):
        try:
            return pd.to_datetime(value).date()
        except Exception:
            return None

    if isinstance(value, pd.Timestamp):
        return value.date()

    return None
