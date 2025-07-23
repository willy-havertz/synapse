from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import numpy as np
import cv2
import logging

app = Flask(__name__)

# Enable CORS for all routes and all origins
# (for development only—consider locking this down in production)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

def compute_beauty_score(emotions):
    return round(emotions.get("happy", 0) * 10, 1)

@app.route("/photo/analyze", methods=["POST"])
def analyze_photo():
    if "file" not in request.files:
        return jsonify({"error": "no file"}), 400

    # load image
    file = request.files["file"]
    arr  = np.frombuffer(file.read(), np.uint8)
    img  = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    try:
        raw = DeepFace.analyze(
            img,
            actions=["emotion"],           # pare down to just emotion if you like
            enforce_detection=False,
            detector_backend="opencv"
        )
    except Exception as e:
        logging.exception("DeepFace failure")
        return jsonify({"error": str(e)}), 500

    # normalize multi‑face vs single‑face return
    result = raw[0] if isinstance(raw, list) else raw
    em = result.get("emotion", {})
    if not em:
        return jsonify({"error": "no emotion data"}), 500

    # build your response…
    response = {
        "beautyScore": compute_beauty_score(em),
        "confidence":  f"{int(em['happy'] * 100)}%",
        "features":    [["Smile", em["happy"] * 10]],
        "mood":        max(em, key=em.get),
        "recommendations": ["…"]
    }
    return jsonify(response)

if __name__ == "__main__":
    app.run(port=5001, debug=True)
