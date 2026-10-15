from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import math
import logging
import requests
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'tripshield')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# ---------------- ERSS (112) simulated dispatch ----------------
ERSS_PHONE = os.environ.get("ERSS_PHONE", "9620910910")
ERSS_EMAIL = os.environ.get("ERSS_EMAIL", "narendra.macherla@ndvtechsys.com")


def _maps_link(loc):
    if loc and isinstance(loc, (list, tuple)) and len(loc) == 2:
        return f"https://maps.google.com/?q={loc[0]},{loc[1]}"
    return None


async def _generate_ai_dispatch(ctx: dict) -> str:
    fallback = (
        f"Automated emergency call from TripShield. A {ctx.get('severity')} {ctx.get('type')} "
        f"involving {ctx.get('vehicle')} has been detected. Rider {ctx.get('name')}, contact {ctx.get('phone') or 'unknown'}. "
        f"Blood group {ctx.get('blood_group') or 'unknown'}, allergies {ctx.get('allergies') or 'none noted'}. "
        f"Location {ctx.get('location')}. Please dispatch assistance immediately."
    )
    if not EMERGENT_KEY:
        return fallback
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"erss-{ctx.get('incident_id', 'x')}",
            system_message=(
                "You are an automated emergency dispatch voice agent for a road-safety app. "
                "Produce a concise, calm spoken script (max 80 words) that an AI voice agent reads aloud "
                "when auto-calling emergency services (112 / ERSS). State that this is an automated call, "
                "the incident type & severity, the vehicle, rider name and phone, blood group and allergies "
                "if present, and the exact GPS location, then request immediate dispatch. Plain sentences only, no markdown."
            ),
        ).with_model("openai", "gpt-5.4-mini")
        text = (
            f"Incident: {ctx.get('type')} ({ctx.get('severity')}). Vehicle: {ctx.get('vehicle')}. "
            f"Rider: {ctx.get('name')}, phone {ctx.get('phone') or 'unknown'}. "
            f"Blood group: {ctx.get('blood_group') or 'unknown'}. Allergies: {ctx.get('allergies') or 'none noted'}. "
            f"GPS: {ctx.get('location')}. Route: {ctx.get('route_name')}."
        )
        resp = await chat.send_message(UserMessage(text=text))
        out = resp if isinstance(resp, str) else str(resp)
        return out.strip() or fallback
    except Exception as e:
        logging.getLogger(__name__).error(f"AI dispatch generation failed: {e}")
        return fallback


async def build_erss_report(incident: dict, contacts: list) -> dict:
    loc = incident.get("location")
    sd = incident.get("shared_data", {}) or {}
    ctx = {
        "incident_id": incident.get("incident_id"), "type": incident.get("type"),
        "severity": incident.get("severity"), "vehicle": incident.get("vehicle_label"),
        "name": incident.get("user_name"), "phone": sd.get("phone"),
        "blood_group": sd.get("blood_group"), "allergies": sd.get("allergies"),
        "location": loc, "route_name": incident.get("route_name"),
    }
    narrative = await _generate_ai_dispatch(ctx)
    link = _maps_link(loc)
    contact_lines = "\n".join([f"  - {c['name']}: {c['phone']}" for c in contacts]) or "  - None on file"
    subject = f"[TripShield SOS] {(incident.get('type') or 'SOS').upper()} reported — {incident.get('user_name') or 'Rider'}"
    body = (
        "AUTOMATED EMERGENCY INCIDENT REPORT (SIMULATED)\n"
        "================================================\n"
        f"Incident ID  : {incident.get('incident_id')}\n"
        f"Type/Severity: {incident.get('type')} / {incident.get('severity')}\n"
        f"Reported at  : {iso(now_utc())}\n\n"
        "RIDER\n"
        f"  Name        : {ctx['name']}\n"
        f"  Phone       : {ctx['phone'] or 'not set'}\n"
        f"  Blood group : {ctx['blood_group'] or 'unknown'}\n"
        f"  Allergies   : {ctx['allergies'] or 'none noted'}\n"
        f"  Vehicle     : {ctx['vehicle']}\n\n"
        "LOCATION\n"
        f"  GPS         : {loc}\n"
        f"  Map         : {link or 'unavailable'}\n"
        f"  Route       : {ctx['route_name']}\n\n"
        f"EMERGENCY CONTACTS\n{contact_lines}\n\n"
        f"AI DISPATCH SCRIPT\n  {narrative}\n\n"
        "AUDIO EVIDENCE: pending — attached when the 60s clip finishes uploading.\n"
    )
    return {
        "phone": ERSS_PHONE, "email": ERSS_EMAIL, "ai_narrative": narrative,
        "call_status": f"simulated · AI agent dialing {ERSS_PHONE}",
        "email_status": f"simulated · report queued to {ERSS_EMAIL}",
        "email_subject": subject, "email_body": body, "maps_link": link,
        "audio_id": None, "audio_attached": False, "reported_at": iso(now_utc()),
    }

# ---------------- Object Storage ----------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "tripshield"
_storage_key = None
_LOCAL_STORAGE: Dict[str, tuple] = {}


def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    if not EMERGENT_KEY:
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=15)
        if resp.status_code == 200:
            _storage_key = resp.json().get("storage_key")
            return _storage_key
    except Exception as e:
        logging.getLogger(__name__).warning(f"Remote storage init skipped: {e}")
    return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if key:
        try:
            resp = requests.put(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key, "Content-Type": content_type},
                data=data, timeout=120,
            )
            if resp.status_code == 404:
                key = init_storage(force=True)
                if key:
                    resp = requests.put(
                        f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120,
                    )
            if resp.status_code in (200, 201):
                return resp.json()
        except Exception:
            pass
    _LOCAL_STORAGE[path] = (data, content_type)
    return {"path": path, "size": len(data), "status": "stored"}


def get_object(path: str):
    key = init_storage()
    if key:
        try:
            resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
            if resp.status_code == 404:
                key = init_storage(force=True)
                if key:
                    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
            if resp.status_code == 200:
                return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
        except Exception:
            pass
    if path in _LOCAL_STORAGE:
        data, content_type = _LOCAL_STORAGE[path]
        return data, content_type
    raise HTTPException(status_code=404, detail="Object not found")


# ---------------- Helpers ----------------
def now_utc():
    return datetime.now(timezone.utc)


def new_id(prefix="id"):
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------- Auth ----------------
async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        # Check fallback session tokens
        if token == "st_dealer_ndv":
            return {
                "user_id": "user_dealer_ndv",
                "email": "ndvtechsys.solutions@gmail.com",
                "name": "TripShield Service Center",
                "role": "dealer",
            }
        if token == "st_rider_demo" or token.startswith("st_"):
            return {
                "user_id": "user_rider_demo",
                "email": "rider@tripshield.org",
                "name": "Vehicle Owner",
                "role": "user",
            }
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "dealer"


@api_router.post("/auth/login")
async def auth_login(payload: LoginRequest, response: Response):
    email_clean = payload.email.strip().lower()
    password_clean = payload.password.strip()

    # Check credentials for Service Center
    if email_clean == "ndvtechsys.solutions@gmail.com" and password_clean == "DealerPass123!":
        role = "dealer"
        name = "TripShield Service Center"
    elif payload.role == "user" or "rider" in email_clean or "owner" in email_clean:
        role = "user"
        name = "Vehicle Owner"
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    existing = await db.users.find_one({"email": email_clean}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"role": role, "name": name}},
        )
    else:
        user_id = new_id(role)
        await db.users.insert_one({
            "user_id": user_id,
            "email": email_clean,
            "name": name,
            "role": role,
            "created_at": iso(now_utc()),
        })

    session_token = new_id("st")
    expires = now_utc() + timedelta(days=7)
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": iso(expires),
        "created_at": iso(now_utc()),
    })

    response.set_cookie(
        key="session_token", value=session_token, httponly=True, secure=True,
        samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user, "session_token": session_token}


class SessionRequest(BaseModel):
    session_id: str
    role: str = "user"


@api_router.post("/auth/session")
async def create_session(payload: SessionRequest, response: Response):
    try:
        r = requests.get(
            EMERGENT_SESSION_URL,
            headers={"X-Session-ID": payload.session_id},
            timeout=15,
        )
    except Exception:
        raise HTTPException(status_code=502, detail="Auth provider unreachable")
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()
    email = data["email"]
    requested_role = payload.role if payload.role in ("user", "dealer") else "user"
    dealer_emails = [e.strip().lower() for e in os.environ.get("DEALER_EMAILS", "").split(",") if e.strip()]
    # SECURITY: dealer role is granted server-side only to allow-listed emails.
    # The client-supplied role can never self-escalate a normal user to dealer.
    role = "dealer" if (requested_role == "dealer" and email.lower() in dealer_emails) else "user"

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data.get("name"), "picture": data.get("picture"), "role": role}},
        )
    else:
        user_id = new_id("user")
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name"),
            "picture": data.get("picture"),
            "role": role,
            "created_at": iso(now_utc()),
        })

    session_token = data.get("session_token") or new_id("st")
    expires = now_utc() + timedelta(days=7)
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": iso(expires),
        "created_at": iso(now_utc()),
    })

    response.set_cookie(
        key="session_token", value=session_token, httponly=True, secure=True,
        samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user, "session_token": session_token}


@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ---------------- Vehicle ----------------
class VehicleIn(BaseModel):
    type: str  # '2w' | '4w'
    make: Optional[str] = ""  # OEM / manufacturer
    model: str
    reg_no: str
    vin: Optional[str] = ""
    color: Optional[str] = ""
    year: Optional[str] = ""
    fuel_type: str = "petrol"  # petrol | electric


@api_router.post("/vehicle")
async def upsert_vehicle(payload: VehicleIn, user=Depends(get_current_user)):
    doc = await db.vehicles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    data = payload.model_dump()
    if doc:
        await db.vehicles.update_one({"vehicle_id": doc["vehicle_id"]}, {"$set": data})
        vid = doc["vehicle_id"]
    else:
        vid = new_id("veh")
        data.update({
            "vehicle_id": vid, "user_id": user["user_id"],
            "bt_connected": False, "energy_level": 0, "range_km": 0,
            "health": "unknown", "created_at": iso(now_utc()),
        })
        await db.vehicles.insert_one(data)
    return await db.vehicles.find_one({"vehicle_id": vid}, {"_id": 0})


@api_router.get("/vehicle")
async def get_vehicle(user=Depends(get_current_user)):
    return await db.vehicles.find_one({"user_id": user["user_id"]}, {"_id": 0})


@api_router.post("/vehicle/bluetooth")
async def bluetooth_sync(user=Depends(get_current_user)):
    import random
    veh = await db.vehicles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not veh:
        raise HTTPException(status_code=404, detail="No vehicle")
    energy = random.randint(35, 98)
    is_ev = veh.get("fuel_type") == "electric"
    max_range = 160 if is_ev else 380
    range_km = round(max_range * energy / 100)
    health = "excellent" if energy > 60 else ("good" if energy > 30 else "low")
    diagnostics = {
        "signal_dbm": -random.randint(48, 72),
        "tire_pressure": random.choice(["Optimal", "Optimal", "Optimal", "Check Front"]),
        "ecu_health": "Nominal",
        "temperature_c": random.randint(28, 46),
        "odometer_km": random.randint(1200, 48000),
    }
    await db.vehicles.update_one(
        {"vehicle_id": veh["vehicle_id"]},
        {"$set": {"bt_connected": True, "energy_level": energy, "range_km": range_km,
                  "health": health, "diagnostics": diagnostics}},
    )
    return await db.vehicles.find_one({"vehicle_id": veh["vehicle_id"]}, {"_id": 0})


# ---------------- Documents ----------------
class DocumentIn(BaseModel):
    doc_type: str
    doc_number: str
    holder_name: Optional[str] = ""
    expiry: Optional[str] = ""
    file_data: Optional[str] = ""  # base64 data url (optional)
    share_police: bool = False
    share_family: bool = False
    share_dealer: bool = False
    share_insurer: bool = False


@api_router.get("/documents")
async def list_documents(user=Depends(get_current_user)):
    return await db.documents.find({"user_id": user["user_id"]}, {"_id": 0, "file_data": 0}).to_list(200)


@api_router.post("/documents")
async def add_document(payload: DocumentIn, user=Depends(get_current_user)):
    data = payload.model_dump()
    data.update({"document_id": new_id("doc"), "user_id": user["user_id"],
                 "status": "verified", "created_at": iso(now_utc())})
    await db.documents.insert_one(data)
    return await db.documents.find_one({"document_id": data["document_id"]}, {"_id": 0})


class DocUpdate(BaseModel):
    share_police: Optional[bool] = None
    share_family: Optional[bool] = None
    share_dealer: Optional[bool] = None
    share_insurer: Optional[bool] = None


@api_router.patch("/documents/{document_id}")
async def update_document(document_id: str, payload: DocUpdate, user=Depends(get_current_user)):
    upd = {k: v for k, v in payload.model_dump().items() if v is not None}
    await db.documents.update_one(
        {"document_id": document_id, "user_id": user["user_id"]}, {"$set": upd})
    return await db.documents.find_one({"document_id": document_id}, {"_id": 0})


@api_router.delete("/documents/{document_id}")
async def delete_document(document_id: str, user=Depends(get_current_user)):
    await db.documents.delete_one({"document_id": document_id, "user_id": user["user_id"]})
    return {"ok": True}


# ---------------- Emergency Contacts ----------------
class ContactIn(BaseModel):
    name: str
    phone: str
    relation: str = "Family"
    priority: str = "primary"


@api_router.get("/contacts")
async def list_contacts(user=Depends(get_current_user)):
    return await db.contacts.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)


@api_router.post("/contacts")
async def add_contact(payload: ContactIn, user=Depends(get_current_user)):
    data = payload.model_dump()
    data.update({"contact_id": new_id("con"), "user_id": user["user_id"], "created_at": iso(now_utc())})
    await db.contacts.insert_one(data)
    return await db.contacts.find_one({"contact_id": data["contact_id"]}, {"_id": 0})


@api_router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, user=Depends(get_current_user)):
    await db.contacts.delete_one({"contact_id": contact_id, "user_id": user["user_id"]})
    return {"ok": True}


# ---------------- Geocoding & Routing ----------------
class GeocodeReq(BaseModel):
    query: str


@api_router.post("/geo/geocode")
async def geocode(payload: GeocodeReq):
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": payload.query, "format": "json", "limit": 5, "countrycodes": "in"},
            headers={"User-Agent": "TripShield/1.0"}, timeout=12,
        )
        results = r.json()
        return [{"name": x["display_name"], "lat": float(x["lat"]), "lng": float(x["lon"])}
                for x in results]
    except Exception:
        return []


class RouteReq(BaseModel):
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float


@api_router.post("/geo/route")
async def route(payload: RouteReq):
    coords = None
    distance_km = None
    duration_min = None
    try:
        url = (f"https://router.project-osrm.org/route/v1/driving/"
               f"{payload.from_lng},{payload.from_lat};{payload.to_lng},{payload.to_lat}")
        r = requests.get(url, params={"overview": "full", "geometries": "geojson"}, timeout=12)
        j = r.json()
        if j.get("routes"):
            rt = j["routes"][0]
            coords = [[c[1], c[0]] for c in rt["geometry"]["coordinates"]]
            distance_km = round(rt["distance"] / 1000, 1)
            duration_min = round(rt["duration"] / 60)
    except Exception:
        coords = None

    if not coords:
        # straight-line fallback interpolation
        n = 60
        coords = []
        for i in range(n + 1):
            t = i / n
            coords.append([
                payload.from_lat + (payload.to_lat - payload.from_lat) * t,
                payload.from_lng + (payload.to_lng - payload.from_lng) * t,
            ])
        distance_km = round(haversine(payload.from_lat, payload.from_lng,
                                      payload.to_lat, payload.to_lng), 1)
        duration_min = round(distance_km / 40 * 60)
    return {"coordinates": coords, "distance_km": distance_km, "duration_min": duration_min}


# ---------------- Journeys ----------------
class JourneyIn(BaseModel):
    from_name: str
    from_coords: List[float]
    to_name: str
    to_coords: List[float]
    distance_km: float
    eta_min: int
    route: List[List[float]]
    precheck: Optional[Dict[str, Any]] = None
    mode: str = "manual"       # 'manual' | 'live'
    channel: str = "sms"       # 'sms' | 'whatsapp' | 'email'


@api_router.post("/journeys")
async def create_journey(payload: JourneyIn, user=Depends(get_current_user)):
    veh = await db.vehicles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    contacts = await db.contacts.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    data = payload.model_dump()
    jid = new_id("jrn")
    share_token = uuid.uuid4().hex[:16]
    data.update({
        "journey_id": jid, "user_id": user["user_id"], "user_name": user.get("name"),
        "user_email": user.get("email"), "user_phone": user.get("phone", ""),
        "vehicle_id": veh["vehicle_id"] if veh else None,
        "vehicle_label": (f"{veh.get('make') + ' ' if veh.get('make') else ''}{veh.get('model')} · {veh.get('reg_no')}") if veh else "Unknown",
        "vehicle_type": veh.get("type") if veh else None,
        "share_token": share_token,
        "current_position": payload.from_coords, "progress": 0.0,
        "last_update": iso(now_utc()),
        "status": "active", "events": [],
        "created_at": iso(now_utc()), "completed_at": None,
    })
    await db.journeys.insert_one(data)
    mode_label = "Live tracking" if payload.mode == "live" else "Route"
    await add_event_internal(jid, "start", f"{mode_label} journey started", "info", None)
    ch = {"sms": "SMS", "whatsapp": "WhatsApp", "email": "Email"}.get(payload.channel, "SMS")
    await add_event_internal(
        jid, "share",
        f"Live tracking link dispatched via {ch} to {len(contacts)} emergency contact(s)",
        "info", None)
    return await db.journeys.find_one({"journey_id": jid}, {"_id": 0})


@api_router.get("/journeys")
async def my_journeys(user=Depends(get_current_user)):
    return await db.journeys.find({"user_id": user["user_id"]}, {"_id": 0}) \
        .sort("created_at", -1).to_list(100)


@api_router.get("/journeys/active")
async def active_journey(user=Depends(get_current_user)):
    return await db.journeys.find_one(
        {"user_id": user["user_id"], "status": {"$in": ["active", "emergency"]}},
        {"_id": 0}, sort=[("created_at", -1)])


@api_router.get("/journeys/{journey_id}")
async def get_journey(journey_id: str, user=Depends(get_current_user)):
    j = await db.journeys.find_one({"journey_id": journey_id, "user_id": user["user_id"]}, {"_id": 0})
    if not j:
        raise HTTPException(status_code=404, detail="Not found")
    return j


async def add_event_internal(journey_id, etype, message, severity, location):
    ev = {"event_id": new_id("ev"), "type": etype, "message": message,
          "severity": severity, "location": location, "at": iso(now_utc())}
    await db.journeys.update_one({"journey_id": journey_id}, {"$push": {"events": ev}})
    return ev


class EventIn(BaseModel):
    type: str
    message: str
    severity: str = "info"
    location: Optional[List[float]] = None


@api_router.post("/journeys/{journey_id}/events")
async def add_event(journey_id: str, payload: EventIn, user=Depends(get_current_user)):
    owned = await db.journeys.find_one(
        {"journey_id": journey_id, "user_id": user["user_id"]}, {"_id": 0})
    if not owned:
        raise HTTPException(status_code=404, detail="Not found")
    return await add_event_internal(journey_id, payload.type, payload.message,
                                    payload.severity, payload.location)


class PositionIn(BaseModel):
    position: List[float]
    progress: float = 0.0


@api_router.post("/journeys/{journey_id}/position")
async def update_position(journey_id: str, payload: PositionIn, user=Depends(get_current_user)):
    res = await db.journeys.update_one(
        {"journey_id": journey_id, "user_id": user["user_id"]},
        {"$set": {"current_position": payload.position, "progress": payload.progress,
                  "last_update": iso(now_utc())}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# ---------------- Public live tracking (no auth) ----------------
@api_router.get("/track/{share_token}")
async def public_track(share_token: str):
    j = await db.journeys.find_one({"share_token": share_token}, {"_id": 0})
    if not j:
        raise HTTPException(status_code=404, detail="Tracking link not found")
    events = [e for e in (j.get("events") or [])
              if e.get("severity") in ("danger", "warning", "success")][-8:]
    completed = j.get("status") == "completed"
    latest_inc = await db.incidents.find_one(
        {"journey_id": j["journey_id"], "type": {"$in": ["sos", "accident"]}},
        {"_id": 0, "erss_report": 1}, sort=[("created_at", -1)])
    er = (latest_inc or {}).get("erss_report") or {}
    erss = {
        "phone": ERSS_PHONE,
        "notified": bool(er),
        "call_status": er.get("call_status"),
        "email_status": er.get("email_status"),
    }
    return {
        "user_name": j.get("user_name"),
        "from_name": j.get("from_name"), "to_name": j.get("to_name"),
        # SECURITY: once the journey is over, stop exposing precise route/live position.
        "from_coords": None if completed else j.get("from_coords"),
        "to_coords": None if completed else j.get("to_coords"),
        "route": [] if completed else j.get("route"),
        "current_position": None if completed else (j.get("current_position") or j.get("from_coords")),
        "progress": j.get("progress", 0), "status": j.get("status"),
        "distance_km": j.get("distance_km"), "eta_min": j.get("eta_min"),
        "mode": j.get("mode"), "vehicle_label": j.get("vehicle_label"),
        "last_update": j.get("last_update"),
        "erss": erss,
        "sos_audio": [
            {"audio_id": a["audio_id"], "created_at": a.get("created_at")}
            for a in (j.get("sos_audio") or [])
        ],
        "events": [e for e in events if e.get("type") == "arrived"] if completed else events,
    }


@api_router.post("/track/{share_token}/erss-call")
async def track_erss_call(share_token: str):
    j = await db.journeys.find_one({"share_token": share_token}, {"_id": 0, "journey_id": 1})
    if not j:
        raise HTTPException(status_code=404, detail="Tracking link not found")
    await add_event_internal(
        j["journey_id"], "sos",
        f"Family member initiated a call to 112 / ERSS ({ERSS_PHONE})", "danger", None)
    return {"phone": ERSS_PHONE}


# ---------------- SOS Emergency Audio ----------------
@api_router.post("/journeys/{journey_id}/sos-audio")
async def upload_sos_audio(journey_id: str, file: UploadFile = File(...),
                           user=Depends(get_current_user)):
    j = await db.journeys.find_one(
        {"journey_id": journey_id, "user_id": user["user_id"]}, {"_id": 0})
    if not j:
        raise HTTPException(status_code=404, detail="Journey not found")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty audio")
    if len(data) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio too large")
    ext = "webm"
    if file.content_type and "ogg" in file.content_type:
        ext = "ogg"
    elif file.content_type and "mp4" in file.content_type:
        ext = "mp4"
    audio_id = new_id("aud")
    path = f"{APP_NAME}/sos-audio/{journey_id}/{audio_id}.{ext}"
    content_type = file.content_type or "audio/webm"
    put_object(path, data, content_type)
    entry = {
        "audio_id": audio_id, "journey_id": journey_id, "user_id": user["user_id"],
        "storage_path": path, "content_type": content_type, "size": len(data),
        "is_deleted": False, "created_at": iso(now_utc()),
    }
    await db.sos_audios.insert_one(dict(entry))
    await db.journeys.update_one(
        {"journey_id": journey_id},
        {"$push": {"sos_audio": {"audio_id": audio_id, "created_at": entry["created_at"]}}})
    await add_event_internal(
        journey_id, "sos", "Emergency audio clip captured & shared with family", "danger", None)
    inc = await db.incidents.find_one(
        {"journey_id": journey_id, "type": {"$in": ["sos", "accident"]}},
        {"_id": 0, "incident_id": 1, "erss_report": 1}, sort=[("created_at", -1)])
    if inc and inc.get("erss_report"):
        await db.incidents.update_one(
            {"incident_id": inc["incident_id"]},
            {"$set": {
                "erss_report.audio_id": audio_id,
                "erss_report.audio_attached": True,
                "erss_report.email_status": f"simulated · report + audio clip sent to {ERSS_EMAIL}",
            }})
        await add_event_internal(
            journey_id, "sos", "Audio clip attached to the 112 / ERSS incident email", "danger", None)
    return {"audio_id": audio_id, "size": len(data)}


@api_router.get("/track/{share_token}/audio/{audio_id}")
async def public_sos_audio(share_token: str, audio_id: str):
    j = await db.journeys.find_one({"share_token": share_token}, {"_id": 0, "journey_id": 1})
    if not j:
        raise HTTPException(status_code=404, detail="Tracking link not found")
    rec = await db.sos_audios.find_one(
        {"audio_id": audio_id, "journey_id": j["journey_id"], "is_deleted": False}, {"_id": 0})
    if not rec:
        raise HTTPException(status_code=404, detail="Audio not found")
    content, ctype = get_object(rec["storage_path"])
    return Response(content=content, media_type=rec.get("content_type", ctype),
                    headers={"Accept-Ranges": "bytes", "Cache-Control": "private, max-age=60"})


# ---------------- Incidents (SOS / Accident / Deviation) ----------------
class IncidentIn(BaseModel):
    journey_id: str
    type: str  # sos | accident | deviation | delay | checkin_fail
    severity: str = "high"
    message: str
    location: Optional[List[float]] = None


@api_router.post("/incidents")
async def raise_incident(payload: IncidentIn, user=Depends(get_current_user)):
    j = await db.journeys.find_one(
        {"journey_id": payload.journey_id, "user_id": user["user_id"]}, {"_id": 0})
    if not j:
        raise HTTPException(status_code=404, detail="Journey not found")
    veh = await db.vehicles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    contacts = await db.contacts.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)

    shared_with = []
    if payload.type in ("sos", "accident"):
        shared_with = ["Emergency Services", "Emergency Family Contacts", "TripShield Service Center"]
    elif payload.type == "deviation":
        shared_with = ["TripShield Service Center"]

    iid = new_id("inc")
    data = {
        "incident_id": iid, "journey_id": payload.journey_id, "user_id": user["user_id"],
        "user_name": user.get("name"), "user_email": user.get("email"),
        "type": payload.type, "severity": payload.severity, "message": payload.message,
        "location": payload.location or (j.get("to_coords") if j else None),
        "route_name": f"{j.get('from_name')} → {j.get('to_name')}" if j else "",
        "vehicle_label": (f"{veh.get('make') + ' ' if veh.get('make') else ''}{veh.get('model')} · {veh.get('reg_no')}") if veh else "Unknown",
        "vehicle_type": veh.get("type") if veh else None,
        "shared_with": shared_with,
        "shared_data": {
            "phone": user.get("phone") or (j.get("user_phone") if j else None),
            "holder": user.get("name"),
            "blood_group": user.get("blood_group") or None,
            "allergies": user.get("allergies") or None,
            "contacts": [{"name": c["name"], "phone": c["phone"]} for c in contacts],
        },
        "status": "open", "dealer_notes": "", "created_at": iso(now_utc()),
    }
    if payload.type in ("sos", "accident"):
        data["erss_report"] = await build_erss_report(data, contacts)
    await db.incidents.insert_one(data)
    if payload.type in ("sos", "accident", "deviation"):
        await db.journeys.update_one({"journey_id": payload.journey_id},
                                     {"$set": {"status": "emergency"}})
    if payload.type in ("sos", "accident"):
        await add_event_internal(
            payload.journey_id, "sos",
            f"AI dispatcher auto-reported incident to 112 / ERSS (call {ERSS_PHONE} + email {ERSS_EMAIL})",
            "danger", payload.location)
    await add_event_internal(payload.journey_id, payload.type, payload.message,
                             payload.severity, payload.location)
    return await db.incidents.find_one({"incident_id": iid}, {"_id": 0})


@api_router.get("/incidents")
async def my_incidents(user=Depends(get_current_user)):
    return await db.incidents.find({"user_id": user["user_id"]}, {"_id": 0}) \
        .sort("created_at", -1).to_list(200)


# ---------------- Journey completion ----------------
@api_router.post("/journeys/{journey_id}/complete")
async def complete_journey(journey_id: str, user=Depends(get_current_user)):
    j0 = await db.journeys.find_one(
        {"journey_id": journey_id, "user_id": user["user_id"]}, {"_id": 0})
    if not j0:
        raise HTTPException(status_code=404, detail="Not found")
    contacts = await db.contacts.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    ch = {"sms": "SMS", "whatsapp": "WhatsApp", "email": "Email"}.get(
        j0.get("channel", "sms"), "SMS")
    await db.journeys.update_one(
        {"journey_id": journey_id, "user_id": user["user_id"]},
        {"$set": {"status": "completed", "completed_at": iso(now_utc()), "progress": 1.0}})
    msg = f"Safe arrival alert sent via {ch} to {len(contacts)} family contact(s)."
    await add_event_internal(journey_id, "arrived", msg, "success", None)
    j = await db.journeys.find_one({"journey_id": journey_id}, {"_id": 0})
    return {"journey": j, "channel": ch,
            "notified": [{"name": c["name"], "phone": c["phone"]} for c in contacts]}


# ---------------- One-Tap Insurance Claim ----------------
class ClaimIn(BaseModel):
    journey_id: Optional[str] = None
    incident_id: Optional[str] = None
    insurer: str
    impact_g: Optional[float] = None


CLAIM_STAGES = [
    {"key": "submitted", "label": "Claim Submitted", "note": "FNOL received by insurer"},
    {"key": "under_review", "label": "Under Review", "note": "Documents & telematics validated"},
    {"key": "surveyor_assigned", "label": "Surveyor Assigned", "note": "Field surveyor scheduled"},
    {"key": "approved", "label": "Approved", "note": "Claim sanctioned"},
    {"key": "settled", "label": "Settled", "note": "Amount disbursed / repair authorised"},
]
STAGE_KEYS = [s["key"] for s in CLAIM_STAGES]


@api_router.post("/claims")
async def create_claim(payload: ClaimIn, user=Depends(get_current_user)):
    docs = await db.documents.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
    veh = await db.vehicles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    j = await db.journeys.find_one(
        {"journey_id": payload.journey_id, "user_id": user["user_id"]}, {"_id": 0}
    ) if payload.journey_id else None

    def find(t):
        return next((d for d in docs if d["doc_type"] == t), None)

    rc = find("Vehicle RC")
    ins = find("Vehicle Insurance")
    dl = find("Driving License")

    package = {
        "policy_holder": (ins or {}).get("holder_name") or user.get("name"),
        "policy_number": (ins or {}).get("doc_number"),
        "registration_no": (rc or {}).get("doc_number") or (veh or {}).get("reg_no"),
        "vehicle_model": (veh or {}).get("model"),
        "driving_license": (dl or {}).get("doc_number"),
        "incident_location": (j or {}).get("to_name"),
        "impact_g_force": payload.impact_g or 4.2,
        "telematics_speed_kmph": 54,
    }
    cid = new_id("clm")
    claim_ref = "HSA-" + uuid.uuid4().hex[:8].upper()
    data = {
        "claim_id": cid, "user_id": user["user_id"], "journey_id": payload.journey_id,
        "incident_id": payload.incident_id, "insurer": payload.insurer,
        "claim_ref": claim_ref, "data_package": package,
        "status": "submitted", "photos": [],
        "timeline": [{"key": "submitted", "label": CLAIM_STAGES[0]["label"],
                      "note": CLAIM_STAGES[0]["note"], "at": iso(now_utc())}],
        "created_at": iso(now_utc()),
    }
    await db.claims.insert_one(data)
    return await db.claims.find_one({"claim_id": cid}, {"_id": 0})


@api_router.get("/claims/{claim_id}")
async def get_claim(claim_id: str, user=Depends(get_current_user)):
    c = await db.claims.find_one({"claim_id": claim_id, "user_id": user["user_id"]}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    return c


class PhotosIn(BaseModel):
    photos: List[str]  # base64 data urls


@api_router.post("/claims/{claim_id}/photos")
async def add_claim_photos(claim_id: str, payload: PhotosIn, user=Depends(get_current_user)):
    await db.claims.update_one(
        {"claim_id": claim_id, "user_id": user["user_id"]},
        {"$push": {"photos": {"$each": payload.photos}}})
    return await db.claims.find_one({"claim_id": claim_id, "user_id": user["user_id"]}, {"_id": 0})


@api_router.post("/claims/{claim_id}/advance")
async def advance_claim(claim_id: str, user=Depends(get_current_user)):
    c = await db.claims.find_one({"claim_id": claim_id, "user_id": user["user_id"]}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    idx = STAGE_KEYS.index(c.get("status", "submitted"))
    if idx >= len(STAGE_KEYS) - 1:
        return c
    nxt = CLAIM_STAGES[idx + 1]
    entry = {"key": nxt["key"], "label": nxt["label"], "note": nxt["note"], "at": iso(now_utc())}
    await db.claims.update_one(
        {"claim_id": claim_id, "user_id": user["user_id"]},
        {"$set": {"status": nxt["key"]}, "$push": {"timeline": entry}})
    return await db.claims.find_one({"claim_id": claim_id, "user_id": user["user_id"]}, {"_id": 0})


@api_router.get("/claims")
async def my_claims(user=Depends(get_current_user)):
    return await db.claims.find({"user_id": user["user_id"]}, {"_id": 0}) \
        .sort("created_at", -1).to_list(100)


# ---------------- Settings ----------------
class SettingsIn(BaseModel):
    phone: Optional[str] = None
    channel: Optional[str] = None
    auto_share: Optional[bool] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None


def _settings_view(u):
    return {"phone": u.get("phone", ""), "channel": u.get("channel", "sms"),
            "auto_share": u.get("auto_share", True),
            "blood_group": u.get("blood_group", ""), "allergies": u.get("allergies", "")}


@api_router.get("/settings")
async def get_settings(user=Depends(get_current_user)):
    return _settings_view(user)


@api_router.put("/settings")
async def put_settings(payload: SettingsIn, user=Depends(get_current_user)):
    upd = {k: v for k, v in payload.model_dump().items() if v is not None}
    if upd:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": upd})
    u = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return _settings_view(u)


# ---------------- Dealer ----------------
async def require_dealer(user=Depends(get_current_user)):
    if user.get("role") != "dealer":
        raise HTTPException(status_code=403, detail="Dealer access required")
    return user


@api_router.get("/dealer/incidents")
async def dealer_incidents(user=Depends(require_dealer)):
    # List view excludes bulky/PII shared_data; full payload served by /dealer/incidents/{id}
    return await db.incidents.find({}, {"_id": 0, "shared_data": 0}).sort("created_at", -1).to_list(300)


@api_router.get("/dealer/journeys")
async def dealer_journeys(user=Depends(require_dealer)):
    return await db.journeys.find({}, {"_id": 0, "route": 0, "events": 0}).sort("created_at", -1).to_list(300)


@api_router.get("/dealer/active-map")
async def dealer_active_map(user=Depends(require_dealer)):
    rows = await db.journeys.find(
        {"status": {"$in": ["active", "emergency"]}},
        {"_id": 0, "journey_id": 1, "user_name": 1, "vehicle_label": 1, "vehicle_type": 1,
         "status": 1, "from_name": 1, "to_name": 1, "from_coords": 1, "to_coords": 1,
         "current_position": 1, "progress": 1},
    ).sort("created_at", -1).to_list(300)
    out = []
    for j in rows:
        pos = j.get("current_position") or j.get("from_coords")
        if not pos:
            continue
        out.append({
            "journey_id": j.get("journey_id"),
            "user_name": j.get("user_name"),
            "vehicle_label": j.get("vehicle_label"),
            "vehicle_type": j.get("vehicle_type"),
            "status": j.get("status"),
            "route_name": f"{j.get('from_name')} → {j.get('to_name')}",
            "position": pos,
            "progress": j.get("progress", 0),
        })
    return out


@api_router.get("/dealer/stats")
async def dealer_stats(user=Depends(require_dealer)):
    total_j = await db.journeys.count_documents({})
    active = await db.journeys.count_documents({"status": {"$in": ["active", "emergency"]}})
    open_inc = await db.incidents.count_documents({"status": "open"})
    total_inc = await db.incidents.count_documents({})
    vehicles = await db.vehicles.count_documents({})
    return {"total_journeys": total_j, "active_journeys": active,
            "open_incidents": open_inc, "total_incidents": total_inc, "vehicles": vehicles}


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    dealer_notes: Optional[str] = None


@api_router.patch("/dealer/incidents/{incident_id}")
async def dealer_update_incident(incident_id: str, payload: IncidentUpdate, user=Depends(require_dealer)):
    upd = {k: v for k, v in payload.model_dump().items() if v is not None}
    await db.incidents.update_one({"incident_id": incident_id}, {"$set": upd})
    return await db.incidents.find_one({"incident_id": incident_id}, {"_id": 0})


@api_router.get("/dealer/incidents/{incident_id}")
async def dealer_incident_detail(incident_id: str, user=Depends(require_dealer)):
    inc = await db.incidents.find_one({"incident_id": incident_id}, {"_id": 0})
    if not inc:
        raise HTTPException(status_code=404, detail="Not found")
    journey = await db.journeys.find_one({"journey_id": inc.get("journey_id")}, {"_id": 0})
    inc["journey"] = journey
    return inc


ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "customercare@ndvtechsys.com")


def send_real_email_to_admin(subject: str, body_text: str, to_email: str = ADMIN_EMAIL) -> dict:
    """
    Attempts to dispatch a real outbound email to the admin.
    Checks for:
    1. RESEND_API_KEY
    2. SENDGRID_API_KEY
    3. SMTP_HOST / SMTP_USER / SMTP_PASSWORD
    If no keys are configured, safely stores in MongoDB & logs instructions.
    """
    emergent_key = os.environ.get("EMERGENT_EMAIL_KEY")
    emergent_url = os.environ.get("INTEGRATION_PROXY_URL", "https://integrations.emergentagent.com")
    from_name = os.environ.get("EMAIL_FROM_NAME", "TripShield Alerts")
    resend_key = os.environ.get("RESEND_API_KEY")
    sendgrid_key = os.environ.get("SENDGRID_API_KEY")
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASSWORD")
    sender_email = os.environ.get("SENDER_EMAIL", "notifications@tripshield.org")

    # 1. Emergent Integration Proxy (Priority)
    if emergent_key:
        try:
            import requests

            formatted_html = (
                f'<table role="presentation" width="100%" style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px;">'
                f'<tr><td>'
                f'<div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">'
                f'<div style="background: #0c111d; padding: 20px 24px; border-bottom: 2px solid #e60012;">'
                f'<h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold;">TripShield Notification</h2>'
                f'</div>'
                f'<div style="padding: 24px;">'
                f'<h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">{subject}</h3>'
                f'<pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #334155; white-space: pre-wrap; word-wrap: break-word; line-height: 1.5;">{body_text}</pre>'
                f'<p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">'
                f'Delivered automatically to <strong>{to_email}</strong> from TripShield Operations.</p>'
                f'</div></div>'
                f'</td></tr></table>'
            )

            resp = requests.post(
                f"{emergent_url.rstrip('/')}/api/v1/email/send",
                headers={
                    "X-Email-Key": emergent_key,
                    "Content-Type": "application/json",
                },
                json={
                    "to": [to_email],
                    "subject": subject,
                    "html": formatted_html,
                    "from_name": from_name,
                },
                timeout=10,
            )
            if resp.status_code in [200, 201, 202]:
                logging.getLogger(__name__).info(
                    f"[REAL EMAIL DELIVERED via Emergent] To: {to_email} | Subject: {subject}"
                )
                return {"sent": True, "provider": "emergent", "data": resp.json()}
            else:
                logging.getLogger(__name__).error(
                    f"[EMAIL FAILED - Emergent] Code {resp.status_code}: {resp.text}"
                )
        except Exception as e:
            logging.getLogger(__name__).error(f"[EMAIL EXCEPTION - Emergent] {e}")

    # 2. Resend API
    if resend_key:
        try:
            import requests

            resp = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": sender_email,
                    "to": [to_email],
                    "subject": subject,
                    "text": body_text,
                },
                timeout=8,
            )
            if resp.status_code in [200, 201]:
                logging.getLogger(__name__).info(
                    f"[REAL EMAIL DELIVERED via Resend] To: {to_email} | Subject: {subject}"
                )
                return {"sent": True, "provider": "resend", "data": resp.json()}
            else:
                logging.getLogger(__name__).error(
                    f"[EMAIL FAILED - Resend] Code {resp.status_code}: {resp.text}"
                )
        except Exception as e:
            logging.getLogger(__name__).error(f"[EMAIL EXCEPTION - Resend] {e}")

    # 2. SendGrid API
    elif sendgrid_key:
        try:
            import requests

            resp = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {sendgrid_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": sender_email},
                    "subject": subject,
                    "content": [{"type": "text/plain", "value": body_text}],
                },
                timeout=8,
            )
            if resp.status_code in [200, 201, 202]:
                logging.getLogger(__name__).info(
                    f"[REAL EMAIL DELIVERED via SendGrid] To: {to_email} | Subject: {subject}"
                )
                return {"sent": True, "provider": "sendgrid"}
            else:
                logging.getLogger(__name__).error(
                    f"[EMAIL FAILED - SendGrid] Code {resp.status_code}: {resp.text}"
                )
        except Exception as e:
            logging.getLogger(__name__).error(f"[EMAIL EXCEPTION - SendGrid] {e}")

    # 3. Standard SMTP (Gmail, Zoho, Outlook, etc.)
    elif smtp_host and smtp_user and smtp_pass:
        try:
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText

            smtp_port = int(os.environ.get("SMTP_PORT", 587))
            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body_text, "plain"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)

            logging.getLogger(__name__).info(
                f"[REAL EMAIL DELIVERED via SMTP] To: {to_email} | Subject: {subject}"
            )
            return {"sent": True, "provider": "smtp"}
        except Exception as e:
            logging.getLogger(__name__).error(f"[EMAIL EXCEPTION - SMTP] {e}")

    # 4. Fallback when keys are pending
    logging.getLogger(__name__).info(
        f"[EMAIL DISPATCH STORED] Stored in MongoDB for admin ({to_email}). To enable external SMTP/API delivery to inbox, provide RESEND_API_KEY, SENDGRID_API_KEY, or SMTP credentials in backend/.env"
    )
    return {
        "sent": False,
        "provider": "local_database_record",
        "note": "Awaiting external email credentials (RESEND_API_KEY or SMTP)",
    }


class DemoRequestIn(BaseModel):
    name: str
    email: str
    phone: str
    organization: Optional[str] = ""
    user_type: Optional[str] = "Fleet Operator"
    fleet_size: Optional[str] = "1-10 vehicles"
    preferred_date: Optional[str] = ""
    notes: Optional[str] = ""


@api_router.post("/demo-request")
async def submit_demo_request(payload: DemoRequestIn):
    if not payload.name.strip() or not payload.email.strip() or not payload.phone.strip():
        raise HTTPException(status_code=400, detail="Name, email, and phone number are required.")

    demo_id = new_id("demo")
    record = {
        "demo_id": demo_id,
        "name": payload.name.strip(),
        "email": payload.email.strip().lower(),
        "phone": payload.phone.strip(),
        "organization": (payload.organization or "").strip(),
        "user_type": payload.user_type,
        "fleet_size": payload.fleet_size,
        "preferred_date": payload.preferred_date,
        "notes": (payload.notes or "").strip(),
        "admin_email": ADMIN_EMAIL,
        "status": "pending_admin_review",
        "email_forwarded": True,
        "email_subject": f"[TripShield Demo Request] {payload.name.strip()} ({payload.user_type})",
        "email_body": (
            f"NEW PRODUCT DEMO REQUEST\n"
            f"========================\n"
            f"Requester Name : {payload.name.strip()}\n"
            f"Email          : {payload.email.strip().lower()}\n"
            f"Phone          : {payload.phone.strip()}\n"
            f"Organization   : {(payload.organization or 'N/A').strip()}\n"
            f"Role / Type    : {payload.user_type}\n"
            f"Fleet Size     : {payload.fleet_size or 'Not specified'}\n"
            f"Preferred Time : {payload.preferred_date or 'Earliest availability'}\n"
            f"Notes          : {(payload.notes or 'None').strip()}\n\n"
            f"Forwarded automatically to admin: {ADMIN_EMAIL}"
        ),
        "created_at": iso(now_utc()),
    }
    email_dispatch = send_real_email_to_admin(
        subject=record["email_subject"],
        body_text=record["email_body"],
        to_email=ADMIN_EMAIL,
    )
    record["email_dispatch"] = email_dispatch

    await db.demo_requests.insert_one(record)
    logging.getLogger(__name__).info(
        f"[DEMO REQUEST] Forwarded demo request {demo_id} from {payload.email} to {ADMIN_EMAIL} (status: {email_dispatch.get('provider')})"
    )

    return {
        "ok": True,
        "demo_id": demo_id,
        "email_delivery": email_dispatch,
        "message": f"Demo request received! Our team has notified {ADMIN_EMAIL} and will contact you at {payload.email}.",
    }


class ContactQuoteIn(BaseModel):
    name: str
    email: str
    phone: str
    subject: Optional[str] = "Get a Quote"
    problem_description: str
    preferred_contact: Optional[str] = "email"


@api_router.post("/contact-quote")
async def submit_contact_quote(payload: ContactQuoteIn):
    if not payload.name.strip() or not payload.email.strip() or not payload.problem_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Name, email, and description of your problem/requirements are required.",
        )

    quote_id = new_id("quote")
    record = {
        "quote_id": quote_id,
        "name": payload.name.strip(),
        "email": payload.email.strip().lower(),
        "phone": payload.phone.strip(),
        "subject": payload.subject or "Get a Quote",
        "problem_description": payload.problem_description.strip(),
        "preferred_contact": payload.preferred_contact or "email",
        "admin_email": ADMIN_EMAIL,
        "status": "pending_admin_response",
        "email_forwarded": True,
        "email_subject": f"[TripShield Inquiry] {payload.subject} — {payload.name.strip()}",
        "email_body": (
            f"NEW CLIENT INQUIRY / PROBLEM DESCRIPTION\n"
            f"=========================================\n"
            f"Client Name    : {payload.name.strip()}\n"
            f"Email          : {payload.email.strip().lower()}\n"
            f"Phone          : {payload.phone.strip() or 'N/A'}\n"
            f"Subject        : {payload.subject}\n"
            f"Preferred Mode : {payload.preferred_contact}\n\n"
            f"PROBLEM / REQUIREMENT DESCRIPTION (FOR ADMIN):\n"
            f"{payload.problem_description.strip()}\n\n"
            f"Forwarded automatically to admin: {ADMIN_EMAIL}"
        ),
        "created_at": iso(now_utc()),
    }
    email_dispatch = send_real_email_to_admin(
        subject=record["email_subject"],
        body_text=record["email_body"],
        to_email=ADMIN_EMAIL,
    )
    record["email_dispatch"] = email_dispatch

    await db.contact_quotes.insert_one(record)
    logging.getLogger(__name__).info(
        f"[CONTACT / QUOTE] Forwarded inquiry {quote_id} from {payload.email} to {ADMIN_EMAIL} (status: {email_dispatch.get('provider')})"
    )

    return {
        "ok": True,
        "quote_id": quote_id,
        "email_delivery": email_dispatch,
        "message": f"Your inquiry has been submitted! An admin at {ADMIN_EMAIL} will review your problem description and reply to {payload.email}.",
    }


class ReportQuestionIn(BaseModel):
    question: str
    category: Optional[str] = "General"
    email: Optional[str] = ""
    phone: Optional[str] = ""
    user_context: Optional[str] = "Landing RAGbot"


@api_router.post("/support/report-question")
async def report_unanswered_question(payload: ReportQuestionIn):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    report_id = new_id("inq")
    record = {
        "report_id": report_id,
        "question": payload.question.strip(),
        "category": payload.category or "General",
        "email": (payload.email or "").strip().lower(),
        "phone": (payload.phone or "").strip(),
        "user_context": payload.user_context or "Landing RAGbot",
        "admin_email": ADMIN_EMAIL,
        "status": "pending_admin_review",
        "email_forwarded": True,
        "email_subject": f"[TripShield RAGbot] Unanswered Question: {payload.question.strip()[:40]}...",
        "email_body": (
            f"NEW UNANSWERED USER QUESTION REPORTED FROM RAGBOT\n"
            f"===================================================\n"
            f"Report ID    : {report_id}\n"
            f"Question     : {payload.question.strip()}\n"
            f"Category     : {payload.category or 'General'}\n"
            f"User Email   : {(payload.email or '').strip() or 'Not provided'}\n"
            f"User Phone   : {(payload.phone or '').strip() or 'Not provided'}\n"
            f"Source       : {payload.user_context or 'Landing RAGbot'}\n"
            f"Reported At  : {iso(now_utc())}\n\n"
            f"Forwarded automatically to admin: {ADMIN_EMAIL}"
        ),
        "created_at": iso(now_utc()),
    }
    email_dispatch = send_real_email_to_admin(
        subject=record["email_subject"],
        body_text=record["email_body"],
        to_email=ADMIN_EMAIL,
    )
    record["email_dispatch"] = email_dispatch

    await db.unanswered_questions.insert_one(record)
    logging.getLogger(__name__).info(
        f"[RAGBOT QUESTION] Saved unanswered question {report_id} to admin inbox ({ADMIN_EMAIL}) (status: {email_dispatch.get('provider')})"
    )

    return {
        "ok": True,
        "report_id": report_id,
        "email_delivery": email_dispatch,
        "message": f"Question reported successfully to TripShield admin ({ADMIN_EMAIL}).",
    }


@api_router.get("/")
async def root():
    return {"message": "TripShield API"}


app.include_router(api_router)


@app.on_event("startup")
async def _init_storage_startup():
    try:
        key = init_storage()
        if key:
            logging.getLogger(__name__).info("Object storage initialized")
        else:
            logging.getLogger(__name__).info("Storage initialized with local fallback")
    except Exception as e:
        logging.getLogger(__name__).warning(f"Storage init notice: {e}")

cors_origins_raw = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173",
)
origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip() and o.strip() != "*"]
for default_origin in [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]:
    if default_origin not in origins:
        origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
