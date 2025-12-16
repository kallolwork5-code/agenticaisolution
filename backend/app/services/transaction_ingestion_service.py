from sqlalchemy.orm import Session
from app.db.models import AcquirerTransaction
import pandas as pd


def _normalize_date_column(df: pd.DataFrame, column: str):
    """
    Convert a DataFrame column to python datetime.date or None.
    """
    if column not in df.columns:
        return df

    df[column] = pd.to_datetime(df[column], errors="coerce").dt.date
    return df


def ingest_transactions(df: pd.DataFrame, db: Session):
    # -----------------------------------
    # 1. Normalize DATE columns FIRST
    # -----------------------------------
    df = _normalize_date_column(df, "transaction_date")
    df = _normalize_date_column(df, "settlement_date")

    records = []

    # -----------------------------------
    # 2. Build ORM objects
    # -----------------------------------
    for _, r in df.iterrows():
        records.append(
            AcquirerTransaction(
                acquirer_name=r.get("acquirer_name"),
                merchant_id=r.get("merchant_id"),

                transaction_date=r.get("transaction_date"),
                settlement_date=r.get("settlement_date"),

                card_number=r.get("card_number"),
                card_classification=r.get("card_classification"),
                card_category=r.get("card_category"),
                card_network=r.get("card_network"),
                card_subtype=r.get("card_subtype"),

                terminal_id=r.get("terminal_id"),
                transaction_type=r.get("transaction_type"),

                transaction_amount=r.get("transaction_amount"),
                transaction_currency=r.get("transaction_currency"),

                settlement_currency=r.get("settlement_currency"),
                gross_settlement_amount=r.get("gross_settlement_amount"),

                mdr_percentage=r.get("mdr_percentage"),
                mdr_amount=r.get("mdr_amount"),
            )
        )

    # -----------------------------------
    # 3. Persist
    # -----------------------------------
    if records:
        db.bulk_save_objects(records)
        db.commit()
