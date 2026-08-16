import os
import cv2
from ultralytics import YOLO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_PATH = os.getenv(
    "VIDEO_PATH",
    os.path.abspath(
        os.path.join(
            BASE_DIR,
            "..",
            "backend",
            "public",
            "mission_footagee.mp4",
        )
    ),
)

model = YOLO(os.path.join(BASE_DIR, "yolov8n.pt"))

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    raise FileNotFoundError(f"Could not open video: {VIDEO_PATH}")

ret, frame = cap.read()
cap.release()

if not ret:
    raise RuntimeError(f"Could not read a frame from: {VIDEO_PATH}")

results = model.predict(frame, conf=0.35, verbose=False)

for result in results:
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        print("DETECTED CLASS:", cls_id)
