import cv2
import time
import threading
import requests
from flask import Flask, request, jsonify
from ultralytics import YOLO

app = Flask(__name__)

AI_STATE = {
    "mode": "IDLE",
    "expected_entries": 0,
    "current_entries": 0,
    "gateId": "GATE_1",
    "start_time": None,
    "timeWindow": 30
}

@app.route("/ai/instruction", methods=["POST"])
def receive_instruction():
    data = request.json

    print("\n📦 RAW DATA RECEIVED:", data)

    AI_STATE["mode"] = "ACTIVE_ENTRY"
    AI_STATE["expected_entries"] = data.get("allowedPersons", 0)
    AI_STATE["current_entries"] = 0
    AI_STATE["gateId"] = data.get("gateId", "GATE_1")
    AI_STATE["timeWindow"] = data.get("timeWindow", 30)
    AI_STATE["start_time"] = time.time()

    print("\n🔐 AUTH RECEIVED FROM BACKEND:", data)
    print("✅ AI_STATE UPDATED:", AI_STATE, "\n")

    return jsonify({"status": "AI instruction accepted"}), 200


def run_api():
    print("🚀 AI SERVICE STARTED ON PORT 8000")
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False)


api_thread = threading.Thread(target=run_api)
api_thread.daemon = True
api_thread.start()

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(1)

GATE_LINE_X = 500
OFFSET = 10

previous_centers = []

BACKEND_URL = "http://localhost:5500"


def async_post(url, payload):
    def task():
        try:
            requests.post(url, json=payload, timeout=0.5)
        except:
            pass
    threading.Thread(target=task, daemon=True).start()

def send_event(event_type, data):
    async_post(f"{BACKEND_URL}/ai/event", {
        "type": event_type,
        "data": data
    })

def send_alert(data):
    async_post(f"{BACKEND_URL}/ai/alert", data)




while True:
    ret, frame = cap.read()
    if not ret:
        break

    current_centers = []

    results = model(frame, stream=True, verbose=False)

    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])

            if cls == 0 and conf > 0.5:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cx = int((x1 + x2) / 2)
                cy = int((y1 + y2) / 2)

                current_centers.append((cx, cy))

                cv2.rectangle(frame, (x1,y1), (x2,y2), (0,255,0), 1)
                cv2.circle(frame, (cx, cy), 5, (0,0,255), -2)

    cv2.line(frame, (GATE_LINE_X, 0), (GATE_LINE_X, frame.shape[0]), (255,0,0), 1)


    for (cx, cy) in current_centers:
        for (px, py) in previous_centers:
            if abs(cy - py) < 50:
                if px < GATE_LINE_X and cx > GATE_LINE_X:
                    if AI_STATE["mode"] == "ACTIVE_ENTRY":
                        AI_STATE["current_entries"] += 1
                        print(f"➡️ Entry detected: {AI_STATE['current_entries']}")
                    
                    elif AI_STATE["mode"] == "IDLE":
                        print("🚨 UNAUTHORIZED ENTRY DETECTED")

                        send_alert({
                            "gateId": AI_STATE["gateId"],
                            "type": "UNAUTHORIZED",
                            "current": 1,
                            "allowed": 0,
                            "timestamp": time.time()
                        })

                        AI_STATE["mode"] = "VIOLATION"

    previous_centers = current_centers.copy()


    if AI_STATE["mode"] == "ACTIVE_ENTRY":
        elapsed = time.time() - AI_STATE["start_time"]

        if AI_STATE["current_entries"] == AI_STATE["expected_entries"]:
            print("✅ ENTRY COMPLETED")

            send_event("COMPLETED", {
                "gateId": AI_STATE["gateId"],
                "count": AI_STATE["current_entries"]
            })

            AI_STATE["mode"] = "COMPLETED"

        elif AI_STATE["current_entries"] > AI_STATE["expected_entries"]:
            print("🚨 TAILGATING DETECTED")

            send_alert({
                "gateId": AI_STATE["gateId"],
                "type": "TAILGATING",
                "current": AI_STATE["current_entries"],
                "allowed": AI_STATE["expected_entries"]
            })

            AI_STATE["mode"] = "VIOLATION"

        elif elapsed > AI_STATE["timeWindow"]:
            print("⏱️ TIME WINDOW EXPIRED")
            AI_STATE["mode"] = "COMPLETED"


    if AI_STATE["mode"] == "COMPLETED":
        print("🔁 Resetting system")
        AI_STATE["mode"] = "IDLE"
        AI_STATE["expected_entries"] = 0
        AI_STATE["current_entries"] = 0

    if AI_STATE["mode"] == "VIOLATION":
        print("🚨 ALERT SENT → Resetting system")
        AI_STATE["mode"] = "IDLE"
        AI_STATE["expected_entries"] = 0
        AI_STATE["current_entries"] = 0

    cv2.putText(frame, f"MODE: {AI_STATE['mode']}", (20,40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
    cv2.putText(frame, f"Expected: {AI_STATE['expected_entries']}", (20,80),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
    cv2.putText(frame, f"Current: {AI_STATE['current_entries']}", (20,120),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)

    cv2.imshow("SentinelFlow - Intelligent Entry AI", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


cap.release()
cv2.destroyAllWindows()