# server/face_recognition.py
import face_recognition
import numpy as np
from PIL import Image
import io
import base64
from supabase_client import supabase
import logging

logging.basicConfig(level=logging.INFO)

def decode_image(image_data: str) -> np.ndarray:
    """Decode base64 image string to numpy array"""
    try:
        header, encoded = image_data.split(",", 1)
        decoded = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(decoded)).convert("RGB")
        return np.array(image)
    except Exception as e:
        logging.error(f"Image decode error: {e}")
        return None

def get_known_face_encoding(student_id: str) -> np.ndarray:
    """Fetch stored face encoding from Supabase storage"""
    try:
        # In production: store encodings in DB or fetch image and encode
        response = supabase.storage.from_("student_faces").download(f"{student_id}.jpg")
        img = Image.open(io.BytesIO(response))
        img_array = np.array(img)
        encodings = face_recognition.face_encodings(img_array)
        return encodings[0] if len(encodings) > 0 else None
    except Exception as e:
        logging.error(f"Could not load known face: {e}")
        return None

def verify_face(student_id: str, image_data: str) -> dict:
    """
    Verify incoming webcam image matches registered face
    Returns: { "verified": True/False, "confidence": 0.0–1.0 }
    """
    unknown_img = decode_image(image_data)
    if unknown_img is None:
        return {"verified": False, "confidence": 0.0}

    try:
        unknown_encodings = face_recognition.face_encodings(unknown_img)
        if not unknown_encodings:
            return {"verified": False, "confidence": 0.0}

        known_face = get_known_face_encoding(student_id)
        if known_face is None:
            return {"verified": False, "confidence": 0.0}

        results = face_recognition.compare_faces([known_face], unknown_encodings[0], tolerance=0.6)
        distance = face_recognition.face_distance([known_face], unknown_encodings[0]).tolist()[0]
        confidence = max(0, 1 - distance)

        return {
            "verified": results[0],
            "confidence": round(confidence, 3)
        }
    except Exception as e:
        logging.error(f"Face verification failed: {e}")
        return {"verified": False, "confidence": 0.0}
