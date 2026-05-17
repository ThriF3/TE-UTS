from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid

from services.nominal_detector import detect_nominal
from services.authenticity_detector import detect_authenticity

app = FastAPI(title="Currency Detection ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {
        "message": "Currency Detection ML Service is running"
    }


@app.post("/detect-currency")
async def detect_currency(file: UploadFile = File(...)):
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    nominal_result = detect_nominal(file_path)
    authenticity_result = detect_authenticity(file_path)

    os.remove(file_path)

    return {
        "success": True,
        "nominal": nominal_result["nominal"],
        "nominal_detected": nominal_result["detected"],
        "confidence": nominal_result["confidence"],
        "authenticity": authenticity_result["authenticity"],
        "is_authentic": authenticity_result["is_authentic"],
        "blob_count": authenticity_result["blob_count"]
    }