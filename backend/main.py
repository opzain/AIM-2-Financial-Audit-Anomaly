import os
import uuid
import io
import traceback
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import pandas as pd
import numpy as np

from ml_engine import AuditEngine
from llm_utils import generate_ai_memo

# --- Database ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./audit.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Upload(Base):
    __tablename__ = "uploads"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    status = Column(String, default="uploaded")
    created_at = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, index=True)
    upload_id = Column(String, index=True)
    txn_id = Column(String)
    date = Column(String)
    vendor = Column(String)
    amount = Column(Float)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String)
    evidence = Column(Text)
    anomaly_types = Column(Text)

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Initialize ML Engine ---
print("🔧 Loading ML Engine...")
try:
    engine_ml = AuditEngine()
    if os.path.exists('model.pkl'):
        print("✅ model.pkl found. Engine ready.")
    else:
        print("⚠️ model.pkl NOT found. Will train on first upload.")
except Exception as e:
    print(f"❌ Engine init error: {e}")

def clean_columns(df):
    df.columns = df.columns.str.strip().str.lower()
    return df

# --- Create Router with /api prefix ---
router = APIRouter(prefix="/api")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        try:
            df = pd.read_csv(io.BytesIO(content), encoding='utf-8-sig')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.BytesIO(content), encoding='utf-16')
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(content), encoding='latin1')
        
        df = clean_columns(df)
        print(f"📋 Columns found: {df.columns.tolist()}")
        
        required = ['txn_id', 'date', 'vendor', 'amount']
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise HTTPException(400, f"Missing columns: {missing}. Found: {df.columns.tolist()}")
        
        if 'posting_date' not in df.columns:
            df['posting_date'] = df['date']
        
        upload_id = str(uuid.uuid4())
        db_upload = Upload(id=upload_id, filename=file.filename, status="processing")
        db.add(db_upload)
        
        for _, row in df.iterrows():
            txn = Transaction(
                id=str(uuid.uuid4()),
                upload_id=upload_id,
                txn_id=str(row.get('txn_id', '')),
                date=str(row.get('date', '')),
                vendor=str(row.get('vendor', 'Unknown')),
                amount=float(row.get('amount', 0)),
                risk_score=0,
                risk_level='Pending',
                evidence='',
                anomaly_types=''
            )
            db.add(txn)
        db.commit()
        
        print(f"📊 Analyzing {len(df)} transactions...")
        result_df = engine_ml.analyze(df)
        
        txns = db.query(Transaction).filter(Transaction.upload_id == upload_id).all()
        for i, txn in enumerate(txns):
            if i < len(result_df):
                txn.risk_score = int(result_df.iloc[i]['risk_score'])
                txn.risk_level = str(result_df.iloc[i]['risk_level'])
                txn.evidence = str(result_df.iloc[i]['evidence'])
                txn.anomaly_types = str(result_df.iloc[i]['anomaly_types'])
        
        db.commit()
        upload = db.query(Upload).filter(Upload.id == upload_id).first()
        upload.status = "completed"
        db.commit()
        
        print(f"✅ Upload {upload_id} completed.")
        return {"upload_id": upload_id, "status": "completed"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(500, detail=f"Internal error: {str(e)}")

@router.get("/dashboard/{upload_id}")
def dashboard(upload_id: str, db: Session = Depends(get_db)):
    txns = db.query(Transaction).filter(Transaction.upload_id == upload_id).all()
    if not txns:
        raise HTTPException(404, "No transactions found")
    total = len(txns)
    critical = sum(1 for t in txns if t.risk_level == 'Critical')
    high = sum(1 for t in txns if t.risk_level == 'High')
    total_risk = sum(t.amount for t in txns if t.risk_score > 60)
    top = sorted(txns, key=lambda x: x.risk_score, reverse=True)[:10]
    return {
        "total": total,
        "critical": critical,
        "high": high,
        "total_risk_amount": total_risk,
        "top_transactions": [
            {
                "txn_id": t.txn_id,
                "vendor": t.vendor,
                "amount": t.amount,
                "risk_score": t.risk_score,
                "risk_level": t.risk_level,
                "evidence": t.evidence
            } for t in top
        ]
    }

@router.get("/txn/{txn_id}")
def txn_detail(txn_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.txn_id == txn_id).first()
    if not txn:
        raise HTTPException(404, "Transaction not found")
    memo = generate_ai_memo({
        "txn_id": txn.txn_id,
        "vendor": txn.vendor,
        "amount": txn.amount,
        "risk_level": txn.risk_level,
        "evidence": txn.evidence,
        "anomaly_types": txn.anomaly_types
    })
    return {
        "txn_id": txn.txn_id,
        "vendor": txn.vendor,
        "amount": txn.amount,
        "risk_score": txn.risk_score,
        "risk_level": txn.risk_level,
        "evidence": txn.evidence,
        "anomaly_types": txn.anomaly_types,
        "ai_memo": memo
    }

# Include the router
app.include_router(router)

# Keep health endpoint without prefix for testing
@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)