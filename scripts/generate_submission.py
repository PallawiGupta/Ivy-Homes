import json
import os
from datetime import datetime, timezone, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

with open(os.path.join(DATA_DIR, "listings.json"), "r", encoding="utf-8") as f:
    listings = json.load(f)
with open(os.path.join(DATA_DIR, "rentals.json"), "r", encoding="utf-8") as f:
    rentals = json.load(f)
with open(os.path.join(DATA_DIR, "projects.json"), "r", encoding="utf-8") as f:
    projects = json.load(f)

# Q1: total_listing_records
ans_q1 = len(listings) # 4400

# Q2: unique_properties
# Fingerprint based on physical property characteristics
props = set()
for l in listings:
    key = (
        l.get("locality", "").strip().lower(),
        l.get("apartment_name", "").strip().lower(),
        l.get("floor"),
        l.get("total_floors"),
        l.get("bedroom"),
        l.get("carpet_area"),
        l.get("facing_direction")
    )
    props.add(key)
ans_q2 = len(props) # 4380

# Q3: active_listings
ans_q3 = sum(1 for l in listings if l.get("is_live") is True) # 3477

# Q4: corrupt_listing_ids
c_neg = set(l["listing_id"] for l in listings if l.get("price", 0) <= 0)
c_floor = set(l["listing_id"] for l in listings if l.get("floor", 0) > l.get("total_floors", 0) and l.get("total_floors", 0) > 0)
c_area = set(l["listing_id"] for l in listings if l.get("carpet_area", 0) > l.get("super_built_up_area", 0) and l.get("super_built_up_area", 0) > 0)
c_coord = set(l["listing_id"] for l in listings if l.get("latitude", 0) > 50) # swapped lat/lon
c_b0 = set(l["listing_id"] for l in listings if l.get("property_type") != "plot" and l.get("bedroom", 0) <= 0)

corrupt_ids = sorted(list(c_neg | c_floor | c_area | c_coord | c_b0)) # 50 IDs
ans_q4 = corrupt_ids

# Q5: total_monthly_rent in Madhapur
madhapur_rentals = [r for r in rentals if r.get("locality", "").strip().lower() == "madhapur"]
ans_q5 = sum(r.get("price", 0) for r in madhapur_rentals) # 5978500

# Q9: fake_listing_ids
# Scam advance-fee and bait-and-switch phrases
scam_phrases = [
    "pay a token amount",
    "site visit only after",
    "below market price, this week only"
]
scam_ids = set(l["listing_id"] for l in listings if any(p in l.get("description", "").lower() for p in scam_phrases))
cheap_ids = set(l["listing_id"] for l in listings if 0 < l.get("price", 0) < 100000)
fake_ids = sorted(list(scam_ids | cheap_ids)) # 82 IDs
ans_q9 = fake_ids

# Q6: avg_price_per_sqft_2bhk
# Live, 2BHK, excluding Q4 and Q9
excluded = set(ans_q4) | set(ans_q9)
live_2bhk_clean = [
    l for l in listings 
    if l.get("is_live") is True 
    and l.get("bedroom") == 2 
    and l["listing_id"] not in excluded
]
rates = [l["price"] / l["carpet_area"] for l in live_2bhk_clean]
ans_q6 = round(sum(rates) / len(rates), 2) # 18043.29

# Q7: costliest_project
# Projects with price_max: if < 10 in Cr (x 10^7), if >= 10 in Lakhs (x 10^5)
best_proj = None
max_inr = 0
for p in projects:
    pmax = p.get("price_max", 0)
    if pmax < 10:
        inr = int(round(pmax * 10_000_000))
    else:
        inr = int(round(pmax * 100_000))
    if inr > max_inr:
        max_inr = inr
        best_proj = p["project_id"]
ans_q7 = {"project_id": best_proj, "price_max_inr": max_inr}

# Q8: listings_last_7_days
# [REFERENCE - 7 days, REFERENCE) in IST
ist = timezone(timedelta(hours=5, minutes=30))
ref_end = datetime(2026, 9, 10, 0, 0, 0, tzinfo=ist)
ref_start = ref_end - timedelta(days=7)
q8_count = 0
for l in listings:
    dt = datetime.fromisoformat(l["posted_at"]).astimezone(ist)
    if ref_start <= dt < ref_end:
        q8_count += 1
ans_q8 = q8_count # 141

# Q10: projects_with_wrong_listing_count
from collections import Counter
live_counts = Counter(l.get("project_id") for l in listings if l.get("project_id") and l.get("is_live") is True)
wrong_count = 0
for p in projects:
    pid = p["project_id"]
    if p.get("total_listings", 0) != live_counts.get(pid, 0):
        wrong_count += 1
ans_q10 = wrong_count # 129

print("=== Calculated Answers ===")
print("Q1 (total_listing_records):", ans_q1)
print("Q2 (unique_properties):", ans_q2)
print("Q3 (active_listings):", ans_q3)
print("Q4 (corrupt_listing_ids count):", len(ans_q4))
print("Q5 (total_monthly_rent):", ans_q5)
print("Q6 (avg_price_per_sqft_2bhk):", ans_q6)
print("Q7 (costliest_project):", ans_q7)
print("Q8 (listings_last_7_days):", ans_q8)
print("Q9 (fake_listing_ids count):", len(ans_q9))
print("Q10 (projects_with_wrong_listing_count):", ans_q10)

# Build Findings
findings = [
    {
        "endpoint": "*",
        "category": "auth",
        "documented": "Every request must carry the API key appended as a query parameter (?api_key=IVY26-XXXXXXXXXXXX).",
        "actual": "Passing the key as a query parameter results in 401 Unauthorized ('send your key in the X-API-Key request header, not as a query parameter'). The API strictly requires the key in the X-API-Key HTTP header.",
        "how_found": "Called GET /v1/listings?api_key=... and observed 401 response with instruction to use X-API-Key header.",
        "impact": "All API calls fail with 401 Unauthorized if using the documented query parameter authentication.",
        "evidence": []
    },
    {
        "endpoint": "/auth/login",
        "category": "auth",
        "documented": "Returns token, token_type Bearer, expires_in 86400 (24 hours), and user with email and name. Claims single login is enough and there is no refresh flow.",
        "actual": "Returns access_token (not token), refresh_token, refresh_url: '/auth/refresh', and expires_in: 900 (15 minutes). User object contains only email, no name. The session expires in 15 minutes, requiring refresh token rotation.",
        "how_found": "Called POST /auth/login with valid demo credentials and inspected JSON response fields and values.",
        "impact": "Frontend authentication breaks: tokens expire after 15 minutes instead of 24 hours, causing unauthorized errors after 15 minutes without active token refresh.",
        "evidence": []
    },
    {
        "endpoint": "/auth/refresh",
        "category": "undocumented_endpoint",
        "documented": "Explicitly claimed: 'There is no refresh flow.'",
        "actual": "POST /auth/refresh exists, accepting {'refresh_token': '...'} and issuing a fresh 15-minute access_token.",
        "how_found": "Tested the refresh_url path returned by POST /auth/login with the received refresh_token.",
        "impact": "Crucial endpoint for sustaining user sessions beyond 15 minutes without forcing the user to log in again.",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings",
        "category": "pagination",
        "documented": "Takes page (1-indexed, default 1) and limit (default 20, max 200). Response contains total, page, page_size, results.",
        "actual": "The page parameter is quietly ignored. Pagination is zero-indexed using offset and limit. Maximum limit is capped at 50 (passing 100 or 200 still returns 50 records). Response shape is {limit, offset, count, total, has_more, results}.",
        "how_found": "Tested varying limit and page parameters; verified page=2 returns identical items to page=1 (offset 0), while offset=50 fetches the next page.",
        "impact": "Applications relying on page=2 for pagination stay stuck on the first 20 records. Requests expecting up to 200 items receive only 50.",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings",
        "category": "completeness",
        "documented": "Claims 'total' is the exact number of records matching filters, and reading 'total' / limit gives the exact number of pages to reach every record.",
        "actual": "Server reports total: 4128, but paginating until has_more is false yields 4,400 retrievable listing records (understated by 272 records). Similarly, rentals reports total 1548 but yields 1650; projects reports 441 but yields 470.",
        "how_found": "Iterated through offsets past the reported total until has_more was false and count returned 0.",
        "impact": "Clients that stop requesting pages when offset reaches the reported 'total' will silently miss 272 listings, 102 rentals, and 29 projects.",
        "evidence": [
            "MAG-2001953",
            "ZER-2003858",
            "100-2000006"
        ]
    },
    {
        "endpoint": "/v1/listings",
        "category": "completeness",
        "documented": "Returns active sale listings only. Inactive, expired and withdrawn listings are claimed to be excluded server side.",
        "actual": "Returns both active and inactive listings. Each listing object carries an 'is_live' boolean field. Exactly 923 out of 4,400 retrievable listings have is_live: false.",
        "how_found": "Inspected listing records and observed is_live boolean property with both true and false values.",
        "impact": "Frontends displaying all listings without checking is_live will show unavailable and withdrawn properties to users.",
        "evidence": [
            "MAG-2001953",
            "ZER-2004032",
            "MAG-2001533"
        ]
    },
    {
        "endpoint": "/v1/listing/{id}",
        "category": "missing_endpoint",
        "documented": "Documented as GET /v1/listing/{listing_id} (singular).",
        "actual": "GET /v1/listing/{listing_id} returns 404 Not Found. The actual working endpoint is plural: GET /v1/listings/{listing_id}.",
        "how_found": "Invoked GET /v1/listing/MAG-2001953 (got 404), then tried plural /v1/listings/MAG-2001953 (got 200 OK).",
        "impact": "Individual property detail pages fail to load if using the documented singular path.",
        "evidence": []
    },
    {
        "endpoint": "/v1/listings/{id}/similar",
        "category": "missing_endpoint",
        "documented": "GET /v1/listings/{listing_id}/similar returns up to ten comparable listings.",
        "actual": "Returns 404 Not Found for valid listing IDs.",
        "how_found": "Sent GET request to /v1/listings/MAG-2001953/similar and received 404.",
        "impact": "Similar listings carousel cannot be fetched directly from the server; client must compute recommendations.",
        "evidence": []
    },
    {
        "endpoint": "/v1/favourites",
        "category": "missing_endpoint",
        "documented": "GET /v1/favourites, POST /v1/favourites with body {'id': '...'}, and DELETE /v1/favourites/{id}.",
        "actual": "All /v1/favourites routes return 404 Not Found. The active endpoint is /v1/saved, and the POST payload strictly requires {'listing_id': '...'} rather than {'id': '...'}.",
        "how_found": "Probed /v1/favourites (404), probed /v1/saved (200 OK), sent {'id': '...'} and observed 422 error requiring 'listing_id'.",
        "impact": "Saved listings/favourites feature fails completely if using the documented routes and payloads.",
        "evidence": []
    },
    {
        "endpoint": "/v1/saved",
        "category": "undocumented_endpoint",
        "documented": "Not in documentation; documentation specifies /v1/favourites instead.",
        "actual": "GET /v1/saved lists saved properties, POST /v1/saved with {'listing_id': '...'} adds a saved listing, and DELETE /v1/saved/{listing_id} removes it.",
        "how_found": "Scanned alternative route naming patterns and validated CRUD operations.",
        "impact": "Required endpoint for implementing user bookmarking.",
        "evidence": []
    },
    {
        "endpoint": "/v1/analytics/summary",
        "category": "missing_endpoint",
        "documented": "GET /v1/analytics/summary returns pre-computed city statistics (median_price, by_locality, by_bhk).",
        "actual": "Returns 404 Not Found.",
        "how_found": "Tested GET /v1/analytics/summary with valid auth headers and received 404 Not Found.",
        "impact": "Insights screen cannot rely on precomputed server aggregates and must aggregate metrics directly from listings data.",
        "evidence": []
    },
    {
        "endpoint": "/v1/projects",
        "category": "units",
        "documented": "Claims price_min and price_max are integers in Indian rupees (e.g. 8900000, 21400000).",
        "actual": "price_min and price_max are floating point values denominated in Lakhs (when >= 10, e.g. 37.9 Lakhs) and Crores (when < 10, e.g. 1.21 Crores), not in raw rupees.",
        "how_found": "Compared project price ranges with actual listing prices within each project (e.g. P20001 has price_min 65.2 and price_max 1.21 against listings priced 6.35M to 25.49M INR).",
        "impact": "Displaying project prices without unit conversion shows prices of 1 to 99 rupees instead of Lakhs and Crores.",
        "evidence": [
            "P20001",
            "P20007",
            "P20384"
        ]
    },
    {
        "endpoint": "/v1/listings",
        "category": "filters",
        "documented": "min_price, max_price, and furnishing query parameters filter listings server side.",
        "actual": "min_price, max_price, and furnishing query parameters are accepted but quietly ignored. The server returns the unfiltered total (4,128) and unmatching records.",
        "how_found": "Queried /v1/listings with min_price=10000000&max_price=12000000 and furnishing=unfurnished; responses included out-of-range prices and fully-furnished listings with total count unchanged.",
        "impact": "Clients relying solely on server filtering will present wrong search results to users unless client-side filtering is applied.",
        "evidence": [
            "MAG-2001953",
            "ZER-2003858",
            "100-2000006"
        ]
    },
    {
        "endpoint": "/v1/listings",
        "category": "filters",
        "documented": "total_listings always agrees with what GET /v1/listings?project_id=... returns.",
        "actual": "The project_id parameter on GET /v1/listings is quietly ignored, returning all listings in the city rather than filtering by project.",
        "how_found": "Queried GET /v1/listings?project_id=P20001 and received all 4,128 city listings.",
        "impact": "Project detail pages cannot load project-specific listings using the query parameter without client filtering.",
        "evidence": [
            "P20001",
            "P20002"
        ]
    },
    {
        "endpoint": "/v1/projects",
        "category": "consistency",
        "documented": "total_listings always agrees with the number of listings currently available in the project.",
        "actual": "For 129 out of 470 projects, total_listings does not match the count of active listings for that project in /v1/listings.",
        "how_found": "Counted active listings per project_id across all listings and compared against project.total_listings.",
        "impact": "Project cards and details show out-of-sync available unit counts.",
        "evidence": [
            "P20001",
            "P20007",
            "P20012",
            "P20014",
            "P20016"
        ]
    },
    {
        "endpoint": "/v1/listings",
        "category": "duplicates",
        "documented": "Claims each listing corresponds to exactly one physical property.",
        "actual": "Multiple listing records describe the exact same physical property (identical apartment, floor, total floors, bedrooms, carpet area, facing direction) across different listing websites and brokers.",
        "how_found": "Grouped listings by composite physical property attributes; found 20 duplicate listings across 4,380 distinct properties.",
        "impact": "Users see identical apartments listed multiple times at slightly varying prices by different brokers.",
        "evidence": [
            "MAG-2002279",
            "MAG-2003957",
            "SQU-2003423",
            "MAG-2003653",
            "SQU-2003973",
            "DWE-2001834"
        ]
    },
    {
        "endpoint": "/v1/listings",
        "category": "data_quality",
        "documented": "Listings describe genuine, safe-to-show real estate properties.",
        "actual": "50 listing records contain physically impossible data: 10 with negative prices, 10 with floor > total_floors, 10 with carpet area > super built up area, 10 with latitude > 50 placing them in the Arctic Ocean, and 10 non-plot properties with 0 bedrooms.",
        "how_found": "Ran automated domain constraint audits over all numerical and geographical fields.",
        "impact": "Causes UI display bugs, broken coordinate maps, and distorted price-per-square-foot metrics.",
        "evidence": [
            "MAG-2002456",
            "MAG-2000670",
            "MAG-2002624",
            "ZER-2001941",
            "MAG-2001433"
        ]
    },
    {
        "endpoint": "/v1/listings",
        "category": "fraud",
        "documented": "All listings are genuine sale offerings.",
        "actual": "Contains fake/fraudulent listings designed to generate leads or advance-fee scams. 72 listings demand advance token payments ('Pay a token amount of Rs 25,000 today') or booking fees before site visits, posted by 7 telephone numbers using rotating fictitious agency names. 10 listings feature bait prices under Rs 16,000 for entire villas and apartments.",
        "how_found": "Conducted NLP text analysis on listing descriptions and clustered contact numbers with multiple agency names.",
        "impact": "Exposes users to advance-fee deposit scams and deceptive lead generation.",
        "evidence": [
            "MAG-2000168",
            "ZER-2004100",
            "ZER-2001120",
            "MAG-2001236",
            "ZER-2001598"
        ]
    }
]

# Write submission.json
submission_data = {
    "api_key": "IVY26-FECF9FEEEF8C",
    "candidate": {
        "name": "Candidate",
        "email": "candidate@mnnit.ac.in",
        "repo_url": "https://github.com/pallwi/ivy-assignment",
        "demo_url": "https://ivy-homes-hyderabad.vercel.app"
    },
    "answers": {
        "total_listing_records": ans_q1,
        "unique_properties": ans_q2,
        "active_listings": ans_q3,
        "corrupt_listing_ids": ans_q4,
        "total_monthly_rent": ans_q5,
        "avg_price_per_sqft_2bhk": ans_q6,
        "costliest_project": ans_q7,
        "listings_last_7_days": ans_q8,
        "fake_listing_ids": ans_q9,
        "projects_with_wrong_listing_count": ans_q10
    },
    "findings": findings
}

sub_path = os.path.join(os.path.dirname(__file__), "..", "submission.json")
with open(sub_path, "w", encoding="utf-8") as f:
    json.dump(submission_data, f, indent=2)

print(f"\nSuccessfully generated {sub_path}!")
print(f"Total findings: {len(findings)}")
