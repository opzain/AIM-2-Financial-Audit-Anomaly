import os
import json

def fallback_explain(evidence, anomaly_types):
    lines = ["🔍 Audit Review Note:"]
    lines.append(f"Anomalies: {anomaly_types}")
    lines.append(f"Evidence: {evidence}")
    if "duplicate" in anomaly_types:
        lines.append("👉 Action: Request original invoice and verify goods receipt.")
    if "gst" in anomaly_types:
        lines.append("👉 Action: Recalculate GST liability and check input tax credit.")
    if "backdated" in anomaly_types:
        lines.append("👉 Action: Verify approval dates and cut-off procedures.")
    return "\n".join(lines)

def generate_ai_memo(txn_data):
    # For hackathon, we just use the smart fallback (avoids API key issues for now)
    return fallback_explain(txn_data.get('evidence', ''), txn_data.get('anomaly_types', ''))