import sys
from pathlib import Path

# Enable UTF-8 stdout for Bengali character printing in terminal
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.services.medicine_service import search_medicines, get_medicine_details

def main():
    print("=== Testing Search for 'Napa' ===")
    results = search_medicines("Napa", limit=4)
    for r in results:
        print(f"Brand: {r['brand_name']} {r['strength']} ({r['form']})")
        print(f"  Generic: {r['generic_name']}")
        print(f"  Manufacturer: {r['manufacturer']}")
        print(f"  Price: {r['price']} BDT")
        print(f"  Bilingual Bangla Doc: {r['has_bilingual_doc']}")
        print()

    if results:
        bid = results[0]["brand_id"]
        print(f"=== Testing Full Details for Brand ID {bid} ===")
        d = get_medicine_details(bid)
        print(f"Brand: {d['brand_name']}")
        print(f"Generic: {d['generic_name']}")
        print(f"Indication (EN): {str(d.get('indication'))[:120]}...")
        if d.get("bilingual_profile"):
            print("Bengali Profile Attached: YES")
            print(f"Bengali Name: {d['bilingual_profile'].get('name_bn')}")
            print(f"Bengali Sections: {list(d['bilingual_profile'].get('sections_bn', {}).keys())}")
        else:
            print("Bengali Profile Attached: NO")

if __name__ == "__main__":
    main()
