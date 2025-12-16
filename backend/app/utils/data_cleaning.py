"""
Data cleaning utilities.

Purpose:
- Safely convert tabular rows into embedding-ready text
- Skip NULL / NaN values
- Avoid noisy embeddings
"""

import pandas as pd


def row_to_text(row: dict) -> str:
    """
    Convert a row dictionary into a clean text string.

    Rules:
    - Skip None values
    - Skip NaN values
    - Convert everything else to string
    """

    parts = []

    for key, value in row.items():
        if value is None:
            continue

        # Handle NaN (float)
        if isinstance(value, float) and pd.isna(value):
            continue

        parts.append(f"{key}: {value}")

    return " | ".join(parts)
