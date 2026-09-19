"""Security-focused backend tests: IDOR (SEC-002), dealer authZ (SEC-001),
ownership isolation on user-scoped collections, public track hardening (SEC-004),
and owner happy-path regression."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://trip-shield-5.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

TOK_A = "tok_user_1789498189466"
TOK_B = "tok_user2"
TOK_DEALER = "tok_dealer_1789498189466"


def _cli(tok):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {tok}"})
    return s


@pytest.fixture(scope="module")
def cli_a():
    return _cli(TOK_A)


@pytest.fixture(scope="module")
def cli_b():
    return _cli(TOK_B)


@pytest.fixture(scope="module")
def cli_dealer():
    return _cli(TOK_DEALER)


def _mk_journey(cli, tag):
    # ensure a vehicle exists (idempotent for the user)
    cli.post(f"{API}/vehicle", json={"model": "Test Bike", "reg_no": f"KA-{uuid.uuid4().hex[:4].upper()}",
                                     "type": "bike"})
    payload = {
        "from_name": f"A-{tag}", "to_name": f"B-{tag}",
        "from_coords": [12.9, 77.6], "to_coords": [12.95, 77.65],
        "route": [[12.9, 77.6], [12.92, 77.62], [12.95, 77.65]],
        "distance_km": 5.0, "eta_min": 15,
        "mode": "live", "channel": "sms",
    }
    r = cli.post(f"{API}/journeys", json=payload)
    assert r.status_code == 200, f"create journey failed: {r.status_code} {r.text}"
    j = r.json()
    return j["journey_id"], j["share_token"]


# ---------- Auth sanity ----------
class TestAuthSanity:
    def test_me_user_a(self, cli_a):
        r = cli_a.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "user"

    def test_me_user_b(self, cli_b):
        r = cli_b.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "user"
        assert r.json()["user_id"]  # sanity

    def test_me_dealer(self, cli_dealer):
        r = cli_dealer.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "dealer"


# ---------- SEC-002 IDOR on journey endpoints ----------
class TestIDORJourney:
    @pytest.fixture(scope="class")
    def journey_a(self, cli_a):
        return _mk_journey(cli_a, "idor")

    def test_owner_can_get(self, cli_a, journey_a):
        jid, _ = journey_a
        r = cli_a.get(f"{API}/journeys/{jid}")
        assert r.status_code == 200
        assert r.json()["journey_id"] == jid

    def test_other_get_404(self, cli_b, journey_a):
        jid, _ = journey_a
        r = cli_b.get(f"{API}/journeys/{jid}")
        assert r.status_code == 404

    def test_other_add_event_404(self, cli_b, journey_a):
        jid, _ = journey_a
        r = cli_b.post(f"{API}/journeys/{jid}/events",
                       json={"type": "note", "message": "attack", "severity": "info"})
        assert r.status_code == 404

    def test_other_complete_404(self, cli_b, journey_a):
        jid, _ = journey_a
        r = cli_b.post(f"{API}/journeys/{jid}/complete")
        assert r.status_code == 404

    def test_other_raise_incident_404(self, cli_b, journey_a):
        jid, _ = journey_a
        r = cli_b.post(f"{API}/incidents",
                       json={"journey_id": jid, "type": "sos", "severity": "high",
                             "message": "cross-user"})
        assert r.status_code == 404


# ---------- SEC-001 Dealer role gate ----------
class TestDealerGate:
    def test_user_forbidden_stats(self, cli_a):
        r = cli_a.get(f"{API}/dealer/stats")
        assert r.status_code == 403

    def test_user_forbidden_incidents(self, cli_a):
        r = cli_a.get(f"{API}/dealer/incidents")
        assert r.status_code == 403

    def test_user_forbidden_incident_detail(self, cli_a):
        r = cli_a.get(f"{API}/dealer/incidents/nonexistent")
        assert r.status_code == 403

    def test_dealer_ok_stats(self, cli_dealer):
        r = cli_dealer.get(f"{API}/dealer/stats")
        assert r.status_code == 200

    def test_dealer_ok_incidents(self, cli_dealer):
        r = cli_dealer.get(f"{API}/dealer/incidents")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Ownership on user-scoped collections ----------
class TestOwnershipIsolation:
    @pytest.fixture(scope="class")
    def seeded(self, cli_a, cli_b):
        tag = uuid.uuid4().hex[:6]
        # doc
        cli_a.post(f"{API}/documents", json={"doc_type": "TEST_A", "doc_number": f"TEST_A_{tag}"})
        cli_b.post(f"{API}/documents", json={"doc_type": "TEST_B", "doc_number": f"TEST_B_{tag}"})
        # contact
        cli_a.post(f"{API}/contacts", json={"name": f"TEST_A_{tag}", "phone": "111",
                                            "relation": "friend"})
        cli_b.post(f"{API}/contacts", json={"name": f"TEST_B_{tag}", "phone": "222",
                                            "relation": "friend"})
        # journey + incident
        jid_a, _ = _mk_journey(cli_a, f"iso-a-{tag}")
        jid_b, _ = _mk_journey(cli_b, f"iso-b-{tag}")
        cli_a.post(f"{API}/incidents", json={"journey_id": jid_a, "type": "delay",
                                             "severity": "low", "message": f"TEST_A_{tag}"})
        cli_b.post(f"{API}/incidents", json={"journey_id": jid_b, "type": "delay",
                                             "severity": "low", "message": f"TEST_B_{tag}"})
        return tag

    def _check_no_leak(self, resp_a, resp_b, key_field):
        assert resp_a.status_code == 200 and resp_b.status_code == 200
        a_ids = {r[key_field] for r in resp_a.json() if key_field in r}
        b_ids = {r[key_field] for r in resp_b.json() if key_field in r}
        # Non-empty on both & no overlap
        assert a_ids and b_ids, f"expected records for both users, got {a_ids} / {b_ids}"
        assert a_ids.isdisjoint(b_ids), f"cross-leak detected: {a_ids & b_ids}"

    def test_documents_isolation(self, cli_a, cli_b, seeded):
        self._check_no_leak(cli_a.get(f"{API}/documents"),
                            cli_b.get(f"{API}/documents"), "document_id")

    def test_contacts_isolation(self, cli_a, cli_b, seeded):
        self._check_no_leak(cli_a.get(f"{API}/contacts"),
                            cli_b.get(f"{API}/contacts"), "contact_id")

    def test_journeys_isolation(self, cli_a, cli_b, seeded):
        self._check_no_leak(cli_a.get(f"{API}/journeys"),
                            cli_b.get(f"{API}/journeys"), "journey_id")

    def test_incidents_isolation(self, cli_a, cli_b, seeded):
        self._check_no_leak(cli_a.get(f"{API}/incidents"),
                            cli_b.get(f"{API}/incidents"), "incident_id")

    def test_claims_isolation(self, cli_a, cli_b, seeded):
        # create a claim for each (from their own incident)
        ia = cli_a.get(f"{API}/incidents").json()
        ib = cli_b.get(f"{API}/incidents").json()
        if ia:
            cli_a.post(f"{API}/claims", json={"incident_id": ia[0]["incident_id"],
                                              "insurer": "TEST_INSURER_A"})
        if ib:
            cli_b.post(f"{API}/claims", json={"incident_id": ib[0]["incident_id"],
                                              "insurer": "TEST_INSURER_B"})
        ra, rb = cli_a.get(f"{API}/claims"), cli_b.get(f"{API}/claims")
        assert ra.status_code == 200 and rb.status_code == 200
        a_ids = {c["claim_id"] for c in ra.json()}
        b_ids = {c["claim_id"] for c in rb.json()}
        assert a_ids.isdisjoint(b_ids)


# ---------- SEC-004 Public track hardening ----------
class TestPublicTrackHardening:
    def test_track_before_and_after_complete(self, cli_a):
        jid, tok = _mk_journey(cli_a, "track")
        # public track (no auth) while active
        r = requests.get(f"{API}/track/{tok}")
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "active"
        assert body["route"] and len(body["route"]) > 0
        assert body["current_position"] is not None

        # complete as owner
        rc = cli_a.post(f"{API}/journeys/{jid}/complete")
        assert rc.status_code == 200

        # after completion, live location & route hidden
        r2 = requests.get(f"{API}/track/{tok}")
        assert r2.status_code == 200
        body2 = r2.json()
        assert body2["status"] == "completed"
        assert body2["route"] == []
        assert body2["current_position"] is None
        assert body2["from_coords"] is None
        assert body2["to_coords"] is None


# ---------- Owner happy path regression ----------
class TestOwnerHappyPath:
    def test_full_flow(self, cli_a):
        # vehicle
        r = cli_a.post(f"{API}/vehicle", json={"model": "Regress Bike",
                                               "reg_no": f"KA-{uuid.uuid4().hex[:4].upper()}",
                                               "type": "bike"})
        assert r.status_code == 200
        # journey
        jid, tok = _mk_journey(cli_a, "regress")
        # event
        r = cli_a.post(f"{API}/journeys/{jid}/events",
                       json={"type": "note", "message": "checkpoint", "severity": "info"})
        assert r.status_code == 200
        # incident
        r = cli_a.post(f"{API}/incidents", json={"journey_id": jid, "type": "delay",
                                                 "severity": "low", "message": "slow"})
        assert r.status_code == 200
        inc_id = r.json().get("incident_id")
        # complete
        r = cli_a.post(f"{API}/journeys/{jid}/complete")
        assert r.status_code == 200
        # claim
        r = cli_a.post(f"{API}/claims", json={"incident_id": inc_id,
                                              "insurer": "ACME Insurance"})
        assert r.status_code == 200
