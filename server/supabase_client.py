# server/supabase_client.py
from supabase import create_client
import os

SUPABASE_URL = os.getenv("https://egvyuoyhulufkkceyomm.supabase.coL")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVndnl1b3lodWx1ZmtrY2V5b21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEyNTg3OCwiZXhwIjoyMDczNzAxODc4fQ.EMdvFR112YocJICqVpNcL9kdbwstW8aHserD1IugQbo")  # Service Role Key (full access)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
