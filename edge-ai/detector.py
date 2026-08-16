"""
SkyWatch Edge-AI YOLOv8 Drone Feed Threat & Geofence Breach Detector
- Processes video feed using YOLOv8n and OpenCV
- Detects threats based on categories and geofence
- Records 5-second incident clips for Level 2+ threats
- Sends HTTP POST payload to backend on breach
"""

import os
import sys
import time
import logging
import threading
import requests
import numpy as np
import cv2
from collections import deque
import tempfile
from ultralytics import YOLO
from flask import Flask, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

STREAM_WIDTH = 540
STREAM_HEIGHT = 960

global_frame_bytes = None
global_frame_id = 0
global_frame_lock = threading.Lock()

def get_placeholder():
    import numpy as np
    img = np.zeros((STREAM_HEIGHT, STREAM_WIDTH, 3), dtype=np.uint8)
    cv2.putText(img, "INITIALIZING SENSORS...", (60, STREAM_HEIGHT // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 70])
    return buffer.tobytes()

def gen_frames():
    global global_frame_bytes, global_frame_id
    last_id = -1
    placeholder = get_placeholder()
    while True:
        with global_frame_lock:
            frame = global_frame_bytes
            current_id = global_frame_id
            
        if frame is None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + placeholder + b'\r\n')
            time.sleep(0.2)
            continue
            
        if current_id == last_id:
            time.sleep(0.01)
            continue
            
        last_id = current_id
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("SkyWatch-EdgeAI")

GEOFENCE_RATIO = [0.0, 0.0, 1.0, 1.0]
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:8080")



base_dir = os.path.dirname(os.path.abspath(__file__))
VIDEO_PATH = os.getenv(
    "VIDEO_PATH",
    os.path.abspath(os.path.join(base_dir, "..", "backend_code", "public", "mission_footagee.mp4"))
)

DRONE_ID = "SKYW-KOL-01"
DRONE_API_KEY = os.getenv("DRONE_API_KEY", "dev-drone-key-change-me")

def scale_geofence(ratio_bbox, frame_width, frame_height):
    rx1, ry1, rx2, ry2 = ratio_bbox
    return [
        int(rx1 * frame_width),
        int(ry1 * frame_height),
        int(rx2 * frame_width),
        int(ry2 * frame_height),
    ]


TARGET_CLASSES = {
    0: "PERSON",
    2: "VEHICLE_CAR",
    3: "VEHICLE_MOTORCYCLE",
    4: "AEROPLANE",
    5: "VEHICLE_BUS",
    7: "VEHICLE_TRUCK",
    43: "WEAPON_KNIFE", 
}

def determine_threat(cls_id, box, geofence, frame_width, frame_height):
    """
    Evaluates the threat level based on object class and geofence proximity.
    Returns (threat_level, threat_name, severity) or None.
    """
    if cls_id not in TARGET_CLASSES:
        return None
        
    obj_name = TARGET_CLASSES[cls_id]
    bx1, by1, bx2, by2 = box
    gx1, gy1, gx2, gy2 = geofence
    cx = (bx1 + bx2) / 2
    cy = (by1 + by2) / 2
    
    in_geofence = (gx1 <= cx <= gx2 and gy1 <= cy <= gy2)
    
    
    margin_x = frame_width * 0.1
    margin_y = frame_height * 0.1
    near_geofence = (gx1 - margin_x <= cx <= gx2 + margin_x and gy1 - margin_y <= cy <= gy2 + margin_y)
    
    
    if cls_id in [4, 43]: 
        return (4, obj_name, "SEVERE")
        
    
    if cls_id == 0: 
        if in_geofence:
            return (3, obj_name, "CRITICAL")
        
    
    if cls_id in [2, 3, 5, 7]: 
        if near_geofence or in_geofence:
            return (2, obj_name, "WARNING") 
        else:
            return (1, obj_name, "INFO")    
            
    return None

def process_incident(frames, meta, fps):
    """
    Encodes the 5-second frame buffer to .mp4 and uploads to the backend.
    Runs in a daemon thread to avoid blocking the video feed.
    """
    def task():
        temp_path = None
        try:
            fd, temp_path = tempfile.mkstemp(suffix='.mp4')
            os.close(fd)
            
            
            out_width, out_height = 1280, 720
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(temp_path, fourcc, fps, (out_width, out_height))
            for f in frames:
                resized = cv2.resize(f, (out_width, out_height))
                out.write(resized)
            out.release()
            
            payload = {
                "droneId": DRONE_ID,
                "objectType": meta["target_type"],
                "confidence": str(meta["confidence"]),
                "severity": meta["severity"],
                "sector": "KOLKATA-EAST",
                "lat": str(22.5726 + float(np.random.uniform(-0.003, 0.003))),
                "lng": str(88.3639 + float(np.random.uniform(-0.003, 0.003)))
            }
            
            logger.info(f"🔒 DISPATCHING ALERT & VIDEO INCIDENT: {payload['objectType']} (Severity: {payload['severity']})")
            
            with open(temp_path, 'rb') as f:
                files = {"file": ("incident.mp4", f, "video/mp4")}
                headers = {"x-drone-api-key": DRONE_API_KEY}
                res = requests.post(f"{SERVER_URL}/api/alerts/upload-incident", data=payload, files=files, headers=headers, timeout=15.0)
                
            if res.status_code in [200, 201]:
                logger.info(f"✅ Backend acknowledged breach alert: HTTP {res.status_code}")
                
                intercept_payload = {
                    "status": "INTERCEPTING",
                    "targetCoordinates": {"lat": float(payload["lat"]), "lng": float(payload["lng"])}
                }
                requests.post(f"{SERVER_URL}/api/drones/{DRONE_ID}/mode", json=intercept_payload, headers={"Content-Type": "application/json"}, timeout=3.0)
            else:
                logger.warning(f"⚠️ Backend returned HTTP {res.status_code}: {res.text}")
                
        except Exception as e:
            logger.error(f"❌ Failed to reach backend API ({SERVER_URL}): {e}")
            import traceback
            with open("error_log.txt", "a") as f:
                f.write(str(e) + "\n")
                traceback.print_exc(file=f)
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass
                
    threading.Thread(target=task, daemon=True).start()

def telemetry_daemon():
    """Background thread to ping backend with live telemetry"""
    logger.info("📡 Starting background telemetry daemon...")
    battery = 100.0
    start_time = time.time()
    
    
    base_lat = 22.5726
    base_lng = 88.3639
    
    while True:
        try:
            battery = max(0, battery - 0.02)
            
            elapsed = time.time() - start_time
            
            lat_offset = 0.003 * np.sin(elapsed / 10.0)
            lng_offset = 0.003 * np.cos(elapsed / 15.0)
            lat = base_lat + lat_offset + float(np.random.uniform(-0.0001, 0.0001))
            lng = base_lng + lng_offset + float(np.random.uniform(-0.0001, 0.0001))
            
            payload = {
                "status": "PATROLLING",
                "battery": round(battery, 1),
                "altitude": int(120 + 5 * np.sin(elapsed / 5.0)),
                "speed": int(50 + 10 * np.cos(elapsed / 3.0)),
                "location": {"lat": lat, "lng": lng}
            }
            
            headers = {"x-drone-api-key": DRONE_API_KEY, "Content-Type": "application/json"}
            requests.post(f"{SERVER_URL}/api/drones/{DRONE_ID}/telemetry", json=payload, headers=headers, timeout=1.0)
        except Exception:
            pass
        time.sleep(0.5)

def create_sample_video_if_missing(filepath, width=1024, height=720, duration_secs=8, fps=30):
    """Generates synthetic tactical video feed if footage does not exist."""
    if os.path.exists(filepath):
        return
    logger.info(f"Generating synthetic drone feed video at '{filepath}'...")
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, fps, (width, height))

    total_frames = duration_secs * fps
    for i in range(total_frames):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (18, 22, 28)
        
        for x in range(0, width, 64):
            cv2.line(frame, (x, 0), (x, height), (30, 36, 46), 1)
        for y in range(0, height, 64):
            cv2.line(frame, (0, y), (width, y), (30, 36, 46), 1)

        progress = i / total_frames
        vx = int(100 + progress * 600)
        vy = int(100 + progress * 400)
        cv2.rectangle(frame, (vx - 30, vy - 20), (vx + 30, vy + 20), (60, 120, 240), -1)
        cv2.putText(frame, "SIMULATED_TARGET", (vx - 40, vy - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)

        px = int(350 + 100 * np.sin(i * 0.1))
        py = int(250 + 80 * np.cos(i * 0.1))
        cv2.circle(frame, (px, py), 15, (50, 220, 120), -1)

        out.write(frame)
    out.release()
    logger.info(f"Synthetic video generated: {filepath}")


inference_lock = threading.Lock()
latest_frame_for_inference = None
latest_boxes = []
latest_threat_level = 0
latest_threat_meta = None
geofence_breached_global = False

def inference_worker(model, frame_width, frame_height, geofence_bbox):
    global latest_frame_for_inference, latest_boxes, latest_threat_level, latest_threat_meta, geofence_breached_global
    while True:
        frame = None
        with inference_lock:
            if latest_frame_for_inference is not None:
                frame = latest_frame_for_inference.copy()
                latest_frame_for_inference = None
        
        if frame is None:
            time.sleep(0.01)
            continue
            
        results = model.predict(frame, conf=0.35, verbose=False)
        
        boxes = []
        highest_level = 0
        current_meta = None
        breached = False
        
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                b_coords = box.xyxy[0].cpu().numpy()
                
                threat = determine_threat(cls_id, b_coords, geofence_bbox, frame_width, frame_height)
                t_level, t_name, t_severity = (0, "", "")
                if threat:
                    t_level, t_name, t_severity = threat
                    if t_level > highest_level:
                        highest_level = t_level
                        current_meta = {
                            "target_type": t_name,
                            "severity": t_severity,
                            "confidence": confidence,
                            "level": t_level
                        }
                    if t_level >= 2:
                        breached = True
                        
                boxes.append({
                    "coords": b_coords,
                    "level": t_level,
                    "name": t_name,
                    "confidence": confidence,
                    "severity": t_severity
                })
                
        with inference_lock:
            latest_boxes = boxes
            latest_threat_level = highest_level
            latest_threat_meta = current_meta
            geofence_breached_global = breached

def run_detector(video_source=VIDEO_PATH, headless=True):
    global latest_frame_for_inference, current_mjpeg_frame, global_frame_bytes, global_frame_id
    create_sample_video_if_missing(video_source)

    logger.info("Initializing YOLOv8n model...")
    model = YOLO("yolov8n.pt")
    logger.info("YOLOv8n model loaded successfully.")

    t_thread = threading.Thread(target=telemetry_daemon, daemon=True)
    t_thread.start()

    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        logger.error(f"Failed to open video source: {video_source}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    geofence_bbox = scale_geofence(GEOFENCE_RATIO, frame_width, frame_height)
    
    
    inf_thread = threading.Thread(target=inference_worker, args=(model, frame_width, frame_height, geofence_bbox), daemon=True)
    inf_thread.start()
    
    
    buffer_size = int(fps * 2.5)
    pre_buffer = deque(maxlen=buffer_size)
    
    is_recording = False
    record_frames_left = 0
    incident_frames = []
    incident_meta = None
    last_incident_time = 0
    
    logger.info(f"Processing '{video_source}' at {fps} FPS | Geofence: {geofence_bbox}")

    frame_time = 1.0 / fps

    try:
        while cap.isOpened():
            start_loop_time = time.time()
            ret, frame = cap.read()
            if not ret:
                logger.info("Reached end of video feed. Looping playback...")
                cap.release()
                cap = cv2.VideoCapture(video_source)
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.1)
                    continue

            gx1, gy1, gx2, gy2 = geofence_bbox

            
            with inference_lock:
                latest_frame_for_inference = frame
                
            
            with inference_lock:
                current_boxes = latest_boxes
                highest_threat_level = latest_threat_level
                current_threat_meta = latest_threat_meta
                geofence_breached = geofence_breached_global

            
            for b in current_boxes:
                bx1, by1, bx2, by2 = [int(v) for v in b["coords"]]
                t_level = b["level"]
                t_name = b["name"]
                confidence = b["confidence"]
                t_severity = b["severity"]
                
                box_color = (0, 0, 255) if t_level >= 2 else (0, 255, 0)
                cv2.rectangle(frame, (bx1, by1), (bx2, by2), box_color, 2)
                
                if t_level > 0:
                    label = f"{t_name} {confidence:.2f}"
                    if t_level >= 2:
                        label += f" [{t_severity}]"
                    cv2.putText(frame, label, (bx1, max(15, by1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 2)

            
            geo_color = (0, 0, 255) if geofence_breached else (0, 255, 120)
            cv2.rectangle(frame, (gx1, gy1), (gx2, gy2), geo_color, 2)
            
            
            
            
            pre_buffer.append(cv2.resize(frame, (640, 360)))
            
            stream_frame = cv2.resize(frame, (STREAM_WIDTH, STREAM_HEIGHT))
            _ret, buffer = cv2.imencode('.jpg', stream_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if _ret:
                with global_frame_lock:
                    global_frame_bytes = buffer.tobytes()
                    global_frame_id += 1
            
            
            if highest_threat_level >= 2:
                if not is_recording and (time.time() - last_incident_time > 10):
                    is_recording = True
                    record_frames_left = buffer_size
                    incident_meta = current_threat_meta
                elif is_recording:
                    
                    if incident_meta and current_threat_meta["level"] > incident_meta["level"]:
                        incident_meta = current_threat_meta

            
            if is_recording:
                incident_frames.append(cv2.resize(frame, (640, 360)))
                record_frames_left -= 1
                if record_frames_left <= 0:
                    
                    full_incident_frames = list(pre_buffer) + incident_frames
                    process_incident(full_incident_frames, incident_meta, fps)
                    is_recording = False
                    incident_frames = []
                    incident_meta = None
                    last_incident_time = time.time()

            if not headless:
                cv2.imshow("SkyWatch Edge AI - Tactical ISR Feed", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
            elapsed = time.time() - start_loop_time
            sleep_time = frame_time - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)

    except KeyboardInterrupt:
        logger.info("Detector stopped by user.")
    finally:
        cap.release()
        if not headless:
            cv2.destroyAllWindows()

if __name__ == "__main__":
    is_headless = "--gui" not in sys.argv
    t = threading.Thread(target=run_detector, kwargs={'headless': is_headless}, daemon=True)
    t.start()
    logger.info("Starting MJPEG Flask server on port 5050...")
    app.run(host='0.0.0.0', port=5050, debug=False, use_reloader=False, threaded=True)
