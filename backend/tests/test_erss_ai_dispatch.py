"""ERSS (112) AI auto-dispatch feature tests.

Covers:
- POST /api/incidents (sos/accident) attaches erss_report; deviation does not.
- POST /api/journeys/{id}/sos-audio attaches audio to latest sos incident's erss_report.
- GET /api/track/{token} exposes erss + notified once an sos exists.
- POST /api/track/{token}/erss-call returns phone and logs event; 404 on invalid token.
"""
import io
import os
import time
import uuid
import pytest
import requests

pytestmark = pytest.mark.xdist_group(name="erss_seq")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://connected-rider-app.preview.emergentagent.com").rstrip("/")
RIDER_TOKEN = "testtoken123"
DEALER_TOKEN = "dealertoken123"
ERSS_PHONE = "9620910910"
ERSS_EMAIL = "narendra.macherla@ndvtechsys.com"


@pytest.fixture(scope="module")
def rider():
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {RIDER_TOKEN}", "Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def journey(rider):
    """Create a live journey and add a contact so the erss email_body has an EMERGENCY CONTACTS section."""
    # Ensure at least one contact exists
    rider.post(f"{BASE_URL}/api/contacts", json={"name": "TEST_ERSS_Contact", "phone": "9999900000", "relation": "spouse"})
    payload = {
        "from_name": "TEST_ERSS_FROM", "from_coords": [12.9, 77.6],
        "to_name": "TEST_ERSS_TO", "to_coords": [12.95, 77.65],
        "distance_km": 5.0, "eta_min": 20,
        "route": [[12.9, 77.6], [12.92, 77.62], [12.95, 77.65]],
        "mode": "live",
    }
    r = rider.post(f"{BASE_URL}/api/journeys", json=payload)
    assert r.status_code == 200, r.text
    j = r.json()
    return j


class TestSOSErssReport:
    def test_sos_incident_attaches_erss_report(self, rider, journey):
        r = rider.post(f"{BASE_URL}/api/incidents", json={
            "journey_id": journey["journey_id"],
            "type": "sos", "severity": "high",
            "message": "TEST_ERSS SOS auto-dispatch",
            "location": [12.9352, 77.6245],
        })
        assert r.status_code == 200, r.text
        inc = r.json()
        er = inc.get("erss_report")
        assert er, "erss_report missing on sos incident"
        assert er["phone"] == ERSS_PHONE
        assert er["email"] == ERSS_EMAIL
        assert isinstance(er.get("ai_narrative"), str) and len(er["ai_narrative"].strip()) > 0
        assert ERSS_PHONE in er["call_status"]
        assert er["email_status"]
        body = er["email_body"]
        assert "EMERGENCY CONTACTS" in body
        assert "12.9352" in body or "12.9" in body  # rider location GPS
        assert ("google.com/maps" in body) or ("maps.google" in body) or ("maps" in (er.get("maps_link") or ""))
        pytest.shared_journey_id = journey["journey_id"]
        pytest.shared_share_token = journey.get("share_token")
        pytest.shared_incident_id = inc["incident_id"]

    def test_deviation_incident_no_erss_report(self, rider, journey):
        r = rider.post(f"{BASE_URL}/api/incidents", json={
            "journey_id": journey["journey_id"],
            "type": "deviation", "severity": "medium",
            "message": "TEST_ERSS deviation should not have erss",
            "location": [12.9, 77.6],
        })
        assert r.status_code == 200, r.text
        inc = r.json()
        assert inc.get("erss_report") in (None, {}), f"deviation should have no erss_report, got {inc.get('erss_report')}"


class TestSOSAudioAttachesToErss:
    def test_audio_upload_updates_latest_erss_report(self, rider):
        jid = getattr(pytest, "shared_journey_id", None)
        assert jid, "prior test did not set shared_journey_id"
        # multipart upload without json content-type
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {RIDER_TOKEN}"})
        files = {"file": ("clip.webm", io.BytesIO(b"FAKEAUDIOBYTES" * 20), "audio/webm")}
        r = s.post(f"{BASE_URL}/api/journeys/{jid}/sos-audio", files=files)
        assert r.status_code == 200, r.text
        data = r.json()
        aid = data.get("audio_id") or data.get("id")
        assert aid, f"no audio_id returned: {data}"
        # verify latest sos incident's erss_report was updated
        time.sleep(0.5)
        inc_id = pytest.shared_incident_id
        # fetch via dealer (or my_incidents) – use dealer detail if available; fallback to rider incidents list
        r2 = rider.get(f"{BASE_URL}/api/incidents")
        assert r2.status_code == 200
        inc = next((i for i in r2.json() if i.get("incident_id") == inc_id), None)
        assert inc, "incident not found in rider list"
        er = inc.get("erss_report") or {}
        assert er.get("audio_attached") is True
        assert er.get("audio_id") == aid
        assert "audio" in (er.get("email_status") or "").lower()


class TestPublicTrackErss:
    def test_track_exposes_erss(self):
        token = getattr(pytest, "shared_share_token", None)
        assert token, "no share_token"
        r = requests.get(f"{BASE_URL}/api/track/{token}")
        assert r.status_code == 200, r.text
        data = r.json()
        erss = data.get("erss")
        assert erss, "erss block missing on public track"
        assert erss.get("phone") == ERSS_PHONE
        assert erss.get("notified") is True

    def test_erss_call_endpoint_valid(self):
        token = getattr(pytest, "shared_share_token", None)
        r = requests.post(f"{BASE_URL}/api/track/{token}/erss-call")
        assert r.status_code == 200, r.text
        assert r.json().get("phone") == ERSS_PHONE
        # verify event logged
        ev = requests.get(f"{BASE_URL}/api/track/{token}")
        assert ev.status_code == 200
        events = ev.json().get("events") or []
        assert any("Family member initiated a call to 112" in (e.get("message") or "") for e in events), \
            f"expected family call event, got: {[e.get('message') for e in events]}"

    def test_erss_call_endpoint_invalid_token(self):
        r = requests.post(f"{BASE_URL}/api/track/nonexistent_token_{uuid.uuid4().hex[:6]}/erss-call")
        assert r.status_code == 404
