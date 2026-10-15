"""Tests: claim aadhaar purge, settings medical profile persistence, dealer active-map."""
import os
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

fe_path = Path("/app/frontend/.env") if Path("/app/frontend/.env").exists() else Path(__file__).resolve().parents[2] / "frontend" / ".env"
fe = fe_path.read_text() if fe_path.exists() else "REACT_APP_BACKEND_URL=http://localhost:8000"
BASE_URL = None
for line in fe.splitlines():
    if line.startswith("REACT_APP_BACKEND_URL"):
        BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
mongo = MongoClient(MONGO_URL)
db = mongo[DB_NAME]


def _iso(dt):
    return dt.isoformat()


def _auth(tok):
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="module")
def rider():
    uid = f"user_test_{uuid.uuid4().hex[:8]}"
    tok = f"tok_{uuid.uuid4().hex}"
    db.users.insert_one({
        "user_id": uid, "email": f"TEST_r_{uid}@example.com", "name": "TEST Rider",
        "picture": "", "role": "user", "phone": "+919999911111",
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    db.user_sessions.insert_one({
        "user_id": uid, "session_token": tok,
        "expires_at": _iso(datetime.now(timezone.utc) + timedelta(days=1)),
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    yield {"user_id": uid, "token": tok}
    db.users.delete_one({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})
    db.contacts.delete_many({"user_id": uid})
    db.vehicles.delete_many({"user_id": uid})
    db.documents.delete_many({"user_id": uid})
    db.claims.delete_many({"user_id": uid})
    db.journeys.delete_many({"user_id": uid})
    db.incidents.delete_many({"user_id": uid})


@pytest.fixture(scope="module")
def dealer():
    uid = f"user_test_{uuid.uuid4().hex[:8]}"
    tok = f"tok_{uuid.uuid4().hex}"
    db.users.insert_one({
        "user_id": uid, "email": f"TEST_d_{uid}@example.com", "name": "TEST Dealer",
        "picture": "", "role": "dealer",
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    db.user_sessions.insert_one({
        "user_id": uid, "session_token": tok,
        "expires_at": _iso(datetime.now(timezone.utc) + timedelta(days=1)),
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    yield {"user_id": uid, "token": tok}
    db.users.delete_one({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})


# --- Settings: blood_group + allergies persistence ---
def test_settings_medical_profile_persistence(rider):
    tok = rider["token"]
    r = requests.get(f"{BASE_URL}/api/settings", headers=_auth(tok))
    assert r.status_code == 200
    data = r.json()
    assert "blood_group" in data and "allergies" in data

    r = requests.put(f"{BASE_URL}/api/settings", json={
        "blood_group": "O+", "allergies": "Peanuts; Penicillin",
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text
    out = r.json()
    assert out["blood_group"] == "O+"
    assert out["allergies"] == "Peanuts; Penicillin"

    # persistence via GET
    r = requests.get(f"{BASE_URL}/api/settings", headers=_auth(tok))
    assert r.status_code == 200
    d = r.json()
    assert d["blood_group"] == "O+"
    assert d["allergies"] == "Peanuts; Penicillin"


# --- Claim data_package must not contain aadhaar ---
def test_claim_data_package_has_no_aadhaar(rider):
    tok = rider["token"]
    # seed vehicle
    r = requests.post(f"{BASE_URL}/api/vehicle", json={
        "type": "2w", "make": "Test", "model": "M1", "reg_no": "TESTAAD",
        "fuel_type": "petrol",
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text

    # seed an Aadhaar doc — must not appear in claim data_package
    r = requests.post(f"{BASE_URL}/api/documents", json={
        "doc_type": "Aadhaar Card", "doc_number": "1111-2222-3333",
        "holder_name": "TEST Rider", "share_dealer": True, "share_family": True,
    }, headers=_auth(tok))
    assert r.status_code == 200

    # create claim (no journey/incident required)
    r = requests.post(f"{BASE_URL}/api/claims", json={
        "insurer": "TestIns", "impact_g": 4.5,
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text
    claim = r.json()
    pkg = claim.get("data_package") or {}
    assert "aadhaar" not in pkg
    # scan keys case insensitively
    assert all("aadhaar" not in k.lower() for k in pkg.keys())
    # no aadhaar leaked as value either
    joined = " ".join(str(v).lower() for v in pkg.values())
    assert "aadhaar" not in joined


# --- SOS incident shared_data includes blood_group + allergies, no aadhaar/medical ---
def test_incident_shared_data_includes_medical(rider):
    tok = rider["token"]

    # ensure medical set
    requests.put(f"{BASE_URL}/api/settings", json={
        "blood_group": "O+", "allergies": "Peanuts",
    }, headers=_auth(tok))

    # contact
    requests.post(f"{BASE_URL}/api/contacts", json={
        "name": "TEST Kin", "phone": "+919888800000", "relation": "Family",
        "priority": "primary",
    }, headers=_auth(tok))

    r = requests.post(f"{BASE_URL}/api/journeys", json={
        "from_name": "A", "from_coords": [28.6, 77.2],
        "to_name": "B", "to_coords": [28.7, 77.3],
        "distance_km": 5.0, "eta_min": 20,
        "route": [[28.6, 77.2], [28.65, 77.25], [28.7, 77.3]],
        "mode": "live", "channel": "sms",
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text
    jid = r.json()["journey_id"]

    r = requests.post(f"{BASE_URL}/api/incidents", json={
        "journey_id": jid, "type": "sos", "severity": "high",
        "message": "TEST SOS", "location": [28.65, 77.25],
    }, headers=_auth(tok))
    assert r.status_code == 200, r.text
    inc = r.json()
    sd = inc.get("shared_data") or {}
    assert sd.get("blood_group") == "O+"
    assert sd.get("allergies") == "Peanuts"
    assert "aadhaar" not in sd
    assert "medical_policy" not in sd
    assert "aadhaar" not in str(inc).lower()


# --- Dealer active-map endpoint returns positions & statuses ---
def test_dealer_active_map(dealer):
    r = requests.get(f"{BASE_URL}/api/dealer/active-map", headers=_auth(dealer["token"]))
    assert r.status_code == 200, r.text
    rows = r.json()
    assert isinstance(rows, list)
    if rows:
        s = rows[0]
        assert "position" in s and isinstance(s["position"], list) and len(s["position"]) == 2
        assert "status" in s
        assert "user_name" in s
        assert "vehicle_label" in s
        assert s["status"] in {"active", "emergency"}


def test_dealer_active_map_forbidden_for_rider(rider):
    r = requests.get(f"{BASE_URL}/api/dealer/active-map", headers=_auth(rider["token"]))
    assert r.status_code == 403
