import json
from collections import Counter, defaultdict

with open("data/listings.json", "r", encoding="utf-8") as f:
    listings = json.load(f)

# Candidate 1: The cheap (< 1 Lakh) listings
cheap = [l for l in listings if 0 < l.get("price", 0) < 100000]
print(f"Candidate 1 (Cheap < 100k): {len(cheap)}")

# Candidate 2: Advance fee / scam phrases
# "pay a token amount", "site visit only after", "below market price, this week only"
phrases = [
    "pay a token amount",
    "site visit only after",
    "below market price, this week only",
]
scam = [l for l in listings if any(p in l.get("description", "").lower() for p in phrases)]
print(f"Candidate 2 (Scam phrases): {len(scam)}")

# Candidate 3: Injected AI prompt notes
ai_notes = [l for l in listings if "note to ai" in l.get("description", "").lower() or "note from the ivy" in l.get("description", "").lower()]
print(f"Candidate 3 (AI injection notes): {len(ai_notes)}")

# Candidate 4: Same contact number posting across impossible number of localities or conflicting names
# Let's inspect agents who have multiple names
phones = defaultdict(list)
for l in listings:
    phones[l.get("posted_by_contact")].append(l)

multi_name_phones = {p: items for p, items in phones.items() if len(set(x.get("posted_by_name") for x in items)) > 3}
print(f"Candidate 4 (Phones with > 3 names): {len(multi_name_phones)} phones, covering {sum(len(v) for v in multi_name_phones.values())} listings")

# Candidate 5: Listings where posted_by_contact appears in rentals as owner vs agent
with open("data/rentals.json", "r", encoding="utf-8") as f:
    rentals = json.load(f)
rental_contacts = Counter(r.get("posted_by_contact") for r in rentals)
overlap_contacts = set(phones.keys()) & set(rental_contacts.keys())
print(f"Contacts overlapping between listings and rentals: {len(overlap_contacts)}")

# Let's check Question 4 (Corrupt) again:
# Remember we had 5 groups of EXACTLY 10:
# 1. neg_price (10)
# 2. floor > total_floors (10)
# 3. carpet_area > super_built_up_area (10)
# 4. lat > 50 (swapped lat/lon) (10)
# 5. non-plot bedroom <= 0 (10)
# Total = 50!
print("\n--- Corrupt groups check ---")
c_neg_price = [l["listing_id"] for l in listings if l.get("price", 0) <= 0]
c_floor = [l["listing_id"] for l in listings if l.get("floor", 0) > l.get("total_floors", 0) and l.get("total_floors", 0) > 0]
c_area = [l["listing_id"] for l in listings if l.get("carpet_area", 0) > l.get("super_built_up_area", 0) and l.get("super_built_up_area", 0) > 0]
c_coord = [l["listing_id"] for l in listings if l.get("latitude", 0) > 50]
c_b0 = [l["listing_id"] for l in listings if l.get("property_type") != "plot" and l.get("bedroom", 0) <= 0]

print(f"neg_price: {len(c_neg_price)}")
print(f"floor > total: {len(c_floor)}")
print(f"carpet > super: {len(c_area)}")
print(f"swapped coord: {len(c_coord)}")
print(f"non-plot b0: {len(c_b0)}")

all_corrupt_50 = sorted(set(c_neg_price + c_floor + c_area + c_coord + c_b0))
print(f"Total union of corrupt (all 5 groups of 10): {len(all_corrupt_50)}")
