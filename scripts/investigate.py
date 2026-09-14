import json
import re
from collections import Counter, defaultdict

with open("data/listings.json", "r", encoding="utf-8") as f:
    listings = json.load(f)

print(f"Total listings: {len(listings)}")

# 1. Inspect descriptions
desc_counts = Counter(l.get("description", "").strip() for l in listings)
print(f"Unique descriptions: {len(desc_counts)}")
dup_descs = {k: v for k, v in desc_counts.items() if v > 1}
print(f"Duplicate descriptions count: {len(dup_descs)}")
for d, count in sorted(dup_descs.items(), key=lambda x: x[1], reverse=True)[:5]:
    print(f"  [{count} times]: {d[:80]}...")

# 2. Check phone numbers
phones = defaultdict(list)
for l in listings:
    phones[l.get("posted_by_contact")].append(l)

# What if certain phone numbers have weird properties?
print("\nChecking agents/owners with many listings:")
for p, items in sorted(phones.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
    names = set(x.get("posted_by_name") for x in items)
    localities = set(x.get("locality") for x in items)
    types = set(x.get("property_type") for x in items)
    websites = set(x.get("website") for x in items)
    print(f"Phone {p} ({len(items)} listings): Names={names}, Localities={len(localities)}, Types={types}, Websites={websites}")

# 3. Check duplicate listings (Question 2: unique_properties)
# What defines a physical property?
# If two listings have same apartment_name, locality, floor, bedroom, carpet_area, facing_direction
prop_keys = []
for l in listings:
    # composite property fingerprint
    key = (
        l.get("locality", "").strip().lower(),
        l.get("apartment_name", "").strip().lower(),
        l.get("floor"),
        l.get("total_floors"),
        l.get("bedroom"),
        l.get("carpet_area"),
        l.get("facing_direction"),
    )
    prop_keys.append(key)

print(f"\nProperty keys total: {len(prop_keys)}, unique: {len(set(prop_keys))}")

# 4. Check Question 4 & Question 9
# Let's inspect listings with impossible or suspicious values
print("\n--- Investigating Suspicious / Fake Listings ---")
# Are there listings where price is absurdly low?
cheap = [l for l in listings if 0 < l.get("price", 0) < 100000]
print(f"Cheap (< 1 Lakh) listings count: {len(cheap)}")
for l in cheap:
    print(f"  {l['listing_id']}: price={l['price']}, locality={l['locality']}, apt={l['apartment_name']}, contact={l['posted_by_contact']}")

# Are there listings where contact is repeated across conflicting listings?
# Are there listings with invalid phone numbers?
invalid_phones = [l for l in listings if not re.match(r"^\+91[0-9]{10}$", l.get("posted_by_contact", ""))]
print(f"Invalid phone format: {len(invalid_phones)}")

# Are there listings with fake websites or non-standard URLs?
websites = Counter(l.get("website") for l in listings)
print(f"Websites: {websites}")

# Are there listings with description mentioning other things?
enquiry_listings = []
for l in listings:
    d = l.get("description", "").lower()
    if any(w in d for w in ["enquiry", "inquiry", "fake", "call now", "urgent", "contact for price", "sample"]):
        enquiry_listings.append(l["listing_id"])
print(f"Enquiry keyword listings: {len(enquiry_listings)}")

# Check is_verified vs fake
print(f"is_verified true count: {sum(1 for l in listings if l.get('is_verified'))}")
