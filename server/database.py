# server/database.py
from supabase_client import supabase

def get_teacher_classes(teacher_id: str):
    return supabase.table("classes").select("*").eq("teacher_id", teacher_id).execute()

def get_class_by_id(class_id: str):
    return supabase.table("classes").select("*").eq("id", class_id).single().execute()

def get_students_in_class(class_id: str):
    return supabase.rpc("get_students_in_class", {"class_id": class_id}).execute()

def log_attendance_record(student_id: str, class_id: str):
    data = {
        "student_id": student_id,
        "class_id": class_id,
        "ble_verified": False,
        "face_verified": False,
        "final_status": "pending"
    }
    return supabase.table("attendance_records").insert(data).execute()
