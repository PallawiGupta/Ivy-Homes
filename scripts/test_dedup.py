import json
from collections import defaultdict

with open("data/listings.json", "r", encoding="utf-8") as f:
    listings = json.load(f)

# How do records duplicate properties?
# Let's inspect different groupings:
# Fingerprint 1: apartment_name, locality, floor, total_floors, bedroom, carpet_area, facing_direction
fp1 = defaultdict(list)
# Fingerprint 2: apartment_name, locality, floor, bedroom, carpet_area
fp2 = defaultdict(list)
# Fingerprint 3: latitude, longitude, floor, bedroom, carpet_area
fp3 = defaultdict(list)
# Fingerprint 4: apartment_name, locality, bedroom, carpet_area, super_built_up_area, floor, facing_direction
fp4 = defaultdict(list)

for l in listings:
    apt = l.get("apartment_name", "").strip().lower()
    loc = l.get("locality", "").strip().lower()
    fl = l.get("floor")
    tf = l.get("total_floors")
    b = l.get("bedroom")
    ca = l.get("carpet_area")
    sba = l.get("super_built_up_area")
    facing = l.get("facing_direction")
    lat = round(l.get("latitude", 0), 4)
    lon = round(l.get("longitude", 0), 4)
    
    fp1[(apt, loc, fl, tf, b, ca, facing)].append(l)
    fp2[(apt, loc, fl, b, ca)].append(l)
    fp3[(lat, lon, fl, b, ca)].append(l)
    fp4[(apt, loc, b, ca, sba, fl, facing)].append(l)

print(f"Total listings: {len(listings)}")
print(f"fp1 unique properties: {len(fp1)} (duplicates: {sum(len(v)-1 for v in fp1.values())})")
print(f"fp2 unique properties: {len(fp2)} (duplicates: {sum(len(v)-1 for v in fp2.values())})")
print(f"fp3 unique properties: {len(fp3)} (duplicates: {sum(len(v)-1 for v in fp3.values())})")
print(f"fp4 unique properties: {len(fp4)} (duplicates: {sum(len(v)-1 for v in fp4.values())})")

# Let's inspect the duplicates in fp1
print("\nSample duplicates in fp1:")
for k, items in list(fp1.items()):
    if len(items) > 1:
        print(f"\nProperty {k}: {len(items)} listings")
        for x in items:
            print(f"  {x['listing_id']}: website={x['website']}, price={x['price']}, posted_by={x['posted_by']}, contact={x['posted_by_contact']}")
