import urllib.request
import urllib.error
import json
import os
import time

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-FECF9FEEEF8C"
LOGIN_EMAIL = "demo1@ivy.homes"
LOGIN_PASSWORD = "dee4ea5948"

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

def login():
    url = f"{BASE_URL}/auth/login"
    body = json.dumps({"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD}).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    })
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print(f"[Auth] Logged in successfully as {LOGIN_EMAIL}. Token expires in {res.get('expires_in')}s")
        return res["access_token"], res.get("refresh_token")

def fetch_all(endpoint, token, batch_size=50):
    all_records = []
    offset = 0
    total = None
    
    print(f"[Fetch] Starting ingestion for {endpoint}...")
    while True:
        url = f"{BASE_URL}{endpoint}?limit={batch_size}&offset={offset}"
        req = urllib.request.Request(url, headers={
            "X-API-Key": API_KEY,
            "Authorization": f"Bearer {token}"
        })
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
                records = data.get("results", [])
                if total is None:
                    total = data.get("total")
                    print(f"[Fetch] {endpoint}: Total reported by server = {total}")
                
                all_records.extend(records)
                print(f"[Fetch] {endpoint}: Offset {offset}, fetched {len(records)} items (Accumulated: {len(all_records)} / {total})")
                
                has_more = data.get("has_more", False)
                if not has_more or len(records) == 0:
                    break
                offset += len(records)
        except urllib.error.HTTPError as e:
            print(f"[Fetch Error] {endpoint} at offset {offset}: {e.code} {e.read().decode()}")
            raise
    
    print(f"[Fetch Done] {endpoint}: Total retrievable records fetched = {len(all_records)}\n")
    return all_records

def main():
    token, _ = login()
    
    # 1. Fetch listings
    listings = fetch_all("/v1/listings", token)
    with open(os.path.join(DATA_DIR, "listings.json"), "w", encoding="utf-8") as f:
        json.dump(listings, f, indent=2)
        
    # 2. Fetch rentals
    rentals = fetch_all("/v1/rentals", token)
    with open(os.path.join(DATA_DIR, "rentals.json"), "w", encoding="utf-8") as f:
        json.dump(rentals, f, indent=2)
        
    # 3. Fetch projects
    projects = fetch_all("/v1/projects", token)
    with open(os.path.join(DATA_DIR, "projects.json"), "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2)

    print("All datasets successfully downloaded to data/ directory!")

if __name__ == "__main__":
    main()
