import cv2
import time
import threading 
import requests 
from flask import Flask,request,jsonify
from ultralytics import YOLO

app= Flask(__name__)

AI_STATE ={
    "mode":"IDLE",
    "expected_entries": 0,
    "current_entries":0,
    "gateId":"GATE_1",
    "start_time":None,
    "timewindow": 30
}

@app.route("/ai/instruction", methods=["POST"])
dwf