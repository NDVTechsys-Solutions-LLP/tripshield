"""Backend tests for SOS emergency audio upload/playback (family-only)."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or \
    __import__("subprocess").check_output(
        "grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d= -f2",
        shell=True).decode().strip().rstrip("/")

RIDER_TOKEN = "testtoken123"
DEALER_TOKEN = "dealertoken123"

# A tiny valid-ish webm blob (just bytes; backend does not validate audio)
FAKE_WEBM = b"\x1a\x45\xdf\xa3" + b"webmdata" * 200  # ~1.6KB


def h(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def journey():
    payload = {
        "from_name": "TEST_Origin", "from_coords": [12.9, 77.5],
        "to_name": "TEST_Dest", "to_coords": [12.95, 77.6],
        "distance_km": 10.0, "eta_min": 20,
        "route": [[12.9, 77.5], [12.92, 77.55], [12.95, 77.6]],
        "mode": "live", "channel": "sms",
    }
    r = requests.post(f"{BASE_URL}/api/journeys", json=payload, headers=h(RIDER_TOKEN))
    assert r.status_code == 200, r.text
    j = r.json()
    yield j
    # cleanup: complete/delete via API if available - just leave; TEST_ prefix marker


class TestSosAudio:
    def test_upload_requires_owner(self, journey):
        # Foreign caller (dealer) cannot upload against rider's journey
        files = {"file": ("clip.webm", FAKE_WEBM, "audio/webm")}
        r = requests.post(f"{BASE_URL}/api/journeys/{journey['journey_id']}/sos-audio",
                          files=files, headers=h(DEALER_TOKEN))
        assert r.status_code == 404

    def test_upload_rejects_empty(self, journey):
        files = {"file": ("clip.webm", b"", "audio/webm")}
        r = requests.post(f"{BASE_URL}/api/journeys/{journey['journey_id']}/sos-audio",
                          files=files, headers=h(RIDER_TOKEN))
        assert r.status_code == 400

    def test_upload_success_and_track_exposes(self, journey):
        files = {"file": ("clip.webm", FAKE_WEBM, "audio/webm")}
        r = requests.post(f"{BASE_URL}/api/journeys/{journey['journey_id']}/sos-audio",
                          files=files, headers=h(RIDER_TOKEN))
        assert r.status_code == 200, r.text
        body = r.json()
        assert "audio_id" in body and body["audio_id"].startswith("aud")
        assert body["size"] == len(FAKE_WEBM)
        audio_id = body["audio_id"]

        # public track exposes it
        tr = requests.get(f"{BASE_URL}/api/track/{journey['share_token']}")
        assert tr.status_code == 200
        tdata = tr.json()
        assert "sos_audio" in tdata
        ids = [a["audio_id"] for a in tdata["sos_audio"]]
        assert audio_id in ids
        for a in tdata["sos_audio"]:
            assert "created_at" in a

        # public playback works, correct content-type, correct bytes
        pr = requests.get(f"{BASE_URL}/api/track/{journey['share_token']}/audio/{audio_id}")
        assert pr.status_code == 200
        assert "audio" in pr.headers.get("content-type", "").lower()
        assert pr.content == FAKE_WEBM

        # save for cross tests
        pytest.audio_id = audio_id
        pytest.share_token = journey["share_token"]

    def test_public_playback_wrong_audio_id(self, journey):
        r = requests.get(
            f"{BASE_URL}/api/track/{journey['share_token']}/audio/aud_doesnotexist")
        assert r.status_code == 404

    def test_public_playback_wrong_token(self):
        aid = getattr(pytest, "audio_id", None)
        assert aid, "prior test must have run"
        r = requests.get(f"{BASE_URL}/api/track/bogus_token_zzz/audio/{aid}")
        assert r.status_code == 404

    def test_cross_journey_isolation(self):
        """Create a second journey; its share_token must NOT play the first journey's audio."""
        payload = {
            "from_name": "TEST_O2", "from_coords": [12.9, 77.5],
            "to_name": "TEST_D2", "to_coords": [12.95, 77.6],
            "distance_km": 5.0, "eta_min": 10,
            "route": [[12.9, 77.5], [12.95, 77.6]],
            "mode": "live", "channel": "sms",
        }
        r = requests.post(f"{BASE_URL}/api/journeys", json=payload, headers=h(RIDER_TOKEN))
        assert r.status_code == 200
        j2 = r.json()
        r = requests.get(
            f"{BASE_URL}/api/track/{j2['share_token']}/audio/{pytest.audio_id}")
        assert r.status_code == 404

    def test_playback_is_unauthenticated(self):
        # No auth header should still work
        r = requests.get(
            f"{BASE_URL}/api/track/{pytest.share_token}/audio/{pytest.audio_id}",
            headers={})
        assert r.status_code == 200
