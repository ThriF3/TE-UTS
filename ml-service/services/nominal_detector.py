from ultralytics import YOLO
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")

model = YOLO(MODEL_PATH)


def detect_nominal(image_path: str):
    results = model.predict(image_path, conf=0.25, verbose=False)

    if not results or len(results[0].boxes) == 0:
        return {
            "nominal": None,
            "confidence": 0,
            "detected": False
        }

    boxes = results[0].boxes
    best_box = max(boxes, key=lambda box: float(box.conf[0]))

    class_id = int(best_box.cls[0])
    confidence = float(best_box.conf[0])
    class_name = model.names[class_id]

    return {
        "nominal": class_name,
        "confidence": round(confidence, 4),
        "detected": True
    }