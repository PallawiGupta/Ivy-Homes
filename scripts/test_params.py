import urllib.request
import urllib.error
import json

API_KEY = "IVY26-FECF9FEEEF8C"

req = urllib.request.Request("https://solve.ivy.homes/auth/login", data=json.dumps({"email": "demo1@ivy.homes", "password": "dee4ea5948"}).encode("utf-8"), headers={"Content-Type": "application/json", "X-API-Key": API_KEY})
token = json.loads(urllib.request.urlopen(req).read().decode())["access_token"]

def test_param(name, qs):
    url = f"https://solve.ivy.homes/v1/listings?limit=10&{qs}"
    r = urllib.request.Request(url, headers={"X-API-Key": API_KEY, "Authorization": f"Bearer {token}"})
    try:
        res = urllib.request.urlopen(r)
        d = json.loads(res.read().decode())
        total = d.get("total")
        results = d.get("results", [])
        return {"ok": True, "total": total, "sample": results[0] if results else None, "count": len(results)}
    except urllib.error.HTTPError as e:
        return {"ok": False, "code": e.code, "error": e.read().decode()}

print("--- Testing /v1/listings filters ---")
# 1. locality
r = test_param("locality", "locality=madhapur")
print("locality=madhapur ->", r["total"], [x["locality"] for x in [r["sample"]] if x])

# 2. bhk
r = test_param("bhk", "bhk=3")
print("bhk=3 ->", r["total"], [x["bedroom"] for x in [r["sample"]] if x])

# 3. min_price & max_price
r = test_param("price range", "min_price=10000000&max_price=12000000")
print("min/max price ->", r["total"], [x["price"] for x in [r["sample"]] if x])

# 4. furnishing
r = test_param("furnishing", "furnishing=fully-furnished")
print("furnishing=fully-furnished ->", r["total"], [x["furnishing"] for x in [r["sample"]] if x])

# 5. property_type
r = test_param("property_type", "property_type=villa")
print("property_type=villa ->", r["total"], [x["property_type"] for x in [r["sample"]] if x])

# 6. sort_by price asc
r1 = test_param("sort price asc", "sort_by=price&order=asc")
r2 = test_param("sort price desc", "sort_by=price&order=desc")
print("sort price asc first price:", r1["sample"]["price"] if r1["sample"] else None)
print("sort price desc first price:", r2["sample"]["price"] if r2["sample"] else None)

# 7. sort_by carpet_area
r3 = test_param("sort area asc", "sort_by=carpet_area&order=asc")
r4 = test_param("sort area desc", "sort_by=carpet_area&order=desc")
print("sort area asc first area:", r3["sample"]["carpet_area"] if r3["sample"] else None)
print("sort area desc first area:", r4["sample"]["carpet_area"] if r4["sample"] else None)
