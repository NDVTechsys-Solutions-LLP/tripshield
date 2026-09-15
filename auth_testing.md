# Auth-Gated App Testing Playbook — Honda Safe Journey

Emergent Google OAuth. Sessions are stored in Mongo (`test_database`): `users` + `user_sessions`.
Cookie name: `session_token` (httpOnly, secure, samesite=none). Backend also accepts `Authorization: Bearer <session_token>`.

## Seed a session
```
mongosh --quiet --eval '
const db=db.getSiblingDB("test_database");const ts=Date.now();
const uid="user_test_"+ts;
db.users.insertOne({user_id:uid,email:"rider."+ts+"@example.com",name:"Rider Test",picture:"https://via.placeholder.com/150",role:"user",created_at:new Date().toISOString()});
db.user_sessions.insertOne({user_id:uid,session_token:"tok_"+ts,expires_at:new Date(Date.now()+7*864e5).toISOString(),created_at:new Date().toISOString()});
print("tok_"+ts);'
```
Use role:"dealer" for the dealer portal.

## Browser: set cookie then navigate
```
await page.context.add_cookies([{ "name":"session_token","value":"<TOKEN>",
  "domain":"trip-shield-5.preview.emergentagent.com","path":"/","httpOnly":True,"secure":True,"sameSite":"None"}])
await page.goto("https://trip-shield-5.preview.emergentagent.com/app")   # user
await page.goto("https://trip-shield-5.preview.emergentagent.com/dealer") # dealer
```

## Pre-seeded tokens (created during build; may be reused)
- USER: tok_user_1789498189466  (email rider.test@example.com)
- DEALER: tok_dealer_1789498189466 (email dealer.test@example.com)
