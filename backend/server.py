from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
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

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


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
        "events": [e for e in events if e.get("type") == "arrived"] if completed else events,
    }


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
        shared_with = ["112 ERSS / VSSR", "Emergency Family Contacts", "TripShield Service Center"]
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
    await db.incidents.insert_one(data)
    if payload.type in ("sos", "accident", "deviation"):
        await db.journeys.update_one({"journey_id": payload.journey_id},
                                     {"$set": {"status": "emergency"}})
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


@api_router.get("/")
async def root():
    return {"message": "TripShield API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
