"""Tests: verify Aadhaar/medical fields are absent from SOS/incident payloads and dealer feed."""
import os
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if "REACT_APP_BACKEND_URL" in os.environ else None
if not BASE_URL:
    # fallback: read from frontend .env
    fe = Path("/app/frontend/.env").read_text()
    for line in fe.splitlines():
        if line.startswith("REACT_APP_BACKEND_URL"):
            BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

mongo = MongoClient(MONGO_URL)
db = mongo[DB_NAME]


def _iso(dt):
    return dt.isoformat()


@pytest.fixture(scope="module")
def rider_session():
    uid = f"user_test_{uuid.uuid4().hex[:8]}"
    token = f"tok_{uuid.uuid4().hex}"
    db.users.insert_one({
        "user_id": uid,
        "email": f"TEST_rider_{uid}@example.com",
        "name": "TEST Rider",
        "picture": "",
        "role": "user",
        "phone": "+919999911111",
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    db.user_sessions.insert_one({
        "user_id": uid,
        "session_token": token,
        "expires_at": _iso(datetime.now(timezone.utc) + timedelta(days=1)),
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    yield {"user_id": uid, "token": token}
    db.users.delete_one({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})
    db.contacts.delete_many({"user_id": uid})
    db.vehicles.delete_many({"user_id": uid})
    j_ids = [j["journey_id"] for j in db.journeys.find({"user_id": uid}, {"journey_id": 1})]
    db.journeys.delete_many({"user_id": uid})
    db.incidents.delete_many({"user_id": uid})


@pytest.fixture(scope="module")
def dealer_session():
    uid = f"user_test_{uuid.uuid4().hex[:8]}"
    token = f"tok_{uuid.uuid4().hex}"
    db.users.insert_one({
        "user_id": uid,
        "email": f"TEST_dealer_{uid}@example.com",
        "name": "TEST Dealer",
        "picture": "",
        "role": "dealer",
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    db.user_sessions.insert_one({
        "user_id": uid,
        "session_token": token,
        "expires_at": _iso(datetime.now(timezone.utc) + timedelta(days=1)),
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    yield {"user_id": uid, "token": token}
    db.users.delete_one({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})


def _auth(tok):
    return {"Authorization": f"Bearer {tok}"}


def test_incident_shared_data_has_no_aadhaar(rider_session):
    tok = rider_session["token"]
    uid = rider_session["user_id"]

    # seed vehicle
    r = requests.post(f"{BASE_URL}/api/vehicle", json={
        "type": "2w", "make": "Test", "model": "X1", "reg_no": "TEST01",
        "fuel_type": "petrol",
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text

    # seed contact
    r = requests.post(f"{BASE_URL}/api/contacts", json={
        "name": "TEST Kin", "phone": "+919888800000", "relation": "Family", "priority": "primary",
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text

    # seed a doc labeled Aadhaar - to prove backend does NOT propagate it to incidents
    r = requests.post(f"{BASE_URL}/api/documents", json={
        "doc_type": "Aadhaar Card", "doc_number": "1234-5678-9012", "holder_name": "TEST Rider",
        "share_dealer": True, "share_family": True,
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text

    # create journey
    r = requests.post(f"{BASE_URL}/api/journeys", json={
        "from_name": "A", "from_coords": [28.6, 77.2],
        "to_name": "B", "to_coords": [28.7, 77.3],
        "distance_km": 5.0, "eta_min": 20,
        "route": [[28.6, 77.2], [28.65, 77.25], [28.7, 77.3]],
        "mode": "live", "channel": "sms",
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text
    jid = r.json()["journey_id"]

    # raise SOS incident
    r = requests.post(f"{BASE_URL}/api/incidents", json={
        "journey_id": jid, "type": "sos", "severity": "high",
        "message": "TEST SOS", "location": [28.65, 77.25],
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text
    inc = r.json()
    sd = inc.get("shared_data") or {}
    assert set(sd.keys()) <= {"phone", "holder", "contacts"}, f"Unexpected keys: {sd.keys()}"
    assert "aadhaar" not in sd
    assert "medical_policy" not in sd
    assert "medical" not in sd
    # ensure aadhaar not leaked anywhere in response
    assert "aadhaar" not in str(inc).lower()
    assert "medical" not in str(inc).lower()
    assert sd["phone"] == "+919999911111"
    assert len(sd["contacts"]) == 1
    assert sd["contacts"][0]["phone"] == "+919888800000"


def test_dealer_incidents_feed_has_no_aadhaar(dealer_session):
    tok = dealer_session["token"]
    r = requests.get(f"{BASE_URL}/api/dealer/incidents", headers=_auth(tok))
    assert r.status_code == 200, r.text
    body = r.json()
    assert isinstance(body, list)
    txt = str(body).lower()
    assert "aadhaar" not in txt
    assert "medical" not in txt


def test_dealer_incident_detail_no_aadhaar(rider_session, dealer_session):
    # find the incident we created
    inc = db.incidents.find_one({"user_id": rider_session["user_id"]}, {"_id": 0}, sort=[("created_at", -1)])
    assert inc is not None
    iid = inc["incident_id"]
    r = requests.get(f"{BASE_URL}/api/dealer/incidents/{iid}", headers=_auth(dealer_session["token"]))
    assert r.status_code == 200, r.text
    detail = r.json()
    sd = detail.get("shared_data") or {}
    assert set(sd.keys()) <= {"phone", "holder", "contacts"}
    assert "aadhaar" not in sd
    assert "medical_policy" not in sd
    # full-response scan
    assert "aadhaar" not in str(detail).lower()
    assert "medical" not in str(detail).lower()
