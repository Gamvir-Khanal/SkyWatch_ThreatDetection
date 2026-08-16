import cv2
import numpy as np
from ultralytics import YOLO

model = YOLO("yolov8n.pt")
cap = cv2.VideoCapture(r"c:\Users\nirma\OneDrive\Desktop\SkyWatch\backend\public\mission_footagee.mp4")
if not cap.isOpened():
    print("Could not open video.")
    exit(1)

frame_count = 0
boxes_found = 0

for _ in range(50):
    ret, frame = cap.read()
    if not ret:
        break
    results = model.predict(frame, conf=0.35, verbose=False)
    for r in results:
        boxes_found += len(r.boxes)
    frame_count += 1

print(f"Frames processed: {frame_count}")
print(f"Boxes found: {boxes_found}")
