# server/main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from database import get_class_by_id, log_attendance_record
from face_recognition import verify_face
from ble_advertiser import start_ble_broadcast

app = FastAPI(title="EduSphere API", version="1.0")

# CORS - Update with your Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://edusphere-client.vercel.app", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)

class StartAttendanceRequest(BaseModel):
    class_id: str
    teacher_id: str

class VerifyFaceRequest(BaseModel):
    student_id: str
    class_id: str
    image_data: str  # Base64-encoded webcam image

@app.post("/api/start-attendance")
async def start_attendance(request: StartAttendanceRequest, background_tasks: BackgroundTasks):
    try:
        # Validate class exists and belongs to teacher
        class_data = get_class_by_id(request.class_id)
        if not class_data.data or class_data.data["teacher_id"] != request.teacher_id:
            raise HTTPException(status_code=404, detail="Class not found or unauthorized")

        # Update class status
        supabase.table("classes").update({"status": "active"}).eq("id", request.class_id).execute()

        # Broadcast BLE signal in background
        background_tasks.add_task(start_ble_broadcast, request.class_id, request.teacher_id)

        logging.info(f"✅ Attendance started for class {request.class_id}")
        return {"status": "success", "message": "Attendance session started", "class_id": request.class_id}
    except Exception as e:
        logging.error(f"Failed to start attendance: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/verify-face")
async def verify_student_face(request: VerifyFaceRequest):
    try:
        result = verify_face(request.student_id, request.image_data)

        if result["verified"]:
            # Update attendance record
            supabase.table("attendance_records").update({
                "face_verified": True,
                "confidence_score": result["confidence"],
                "final_status": "present"
            }).eq("student_id", request.student_id).eq("class_id", request.class_id).execute()

        return {
            "verified": result["verified"],
            "confidence": result["confidence"]
        }
    except Exception as e:
        logging.error(f"Face verification error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed")

@app.get("/api/test")
async def test_api():
    return {"status": "running", "message": "EduSphere API is live!"}
