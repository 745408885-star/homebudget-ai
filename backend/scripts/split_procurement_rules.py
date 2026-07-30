"""Regenerate the modular rule files from the reviewed aggregate draft."""

import json
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = BACKEND_ROOT / "data" / "procurement_rules_v1.draft.json"
OUTPUT_ROOT = BACKEND_ROOT / "data" / "procurement_rules"

MODULE_CODES = {
    "furniture": {
        "bed_frame",
        "mattress",
        "sofa",
        "dining_set",
        "coffee_table",
        "desk",
        "desk_chair",
        "bedside_table",
        "freestanding_wardrobe",
        "shoe_cabinet",
        "children_furniture",
        "freestanding_storage",
    },
    "climate": {"split_air_conditioner"},
    "kitchen_appliances": {
        "refrigerator",
        "freestanding_dishwasher",
        "range_hood",
        "gas_stove",
        "small_appliance_package",
    },
    "laundry": {"washing_machine", "dryer"},
    "cleaning": {"robot_vacuum"},
    "entertainment": {"television"},
    "water_and_heating": {"water_purifier", "water_heater"},
    "network_and_smart": {
        "smart_lock",
        "router",
        "smart_speaker",
        "smart_lighting_devices",
        "basic_sensors",
    },
    "curtains_and_lighting": {"curtains", "lighting_fixtures"},
    "bedding_and_storage": {"bedding", "move_in_storage_supplies"},
    "decoration": {"rug", "wall_art", "cushions", "plants"},
}


def main() -> None:
    payload = _load_json(SOURCE_PATH)
    items_by_code = {item["code"]: item for item in payload["items"]}
    expected_codes = set(items_by_code)
    configured_codes = set().union(*MODULE_CODES.values())
    if configured_codes != expected_codes:
        missing = sorted(expected_codes - configured_codes)
        unexpected = sorted(configured_codes - expected_codes)
        raise ValueError(f"模块映射不完整；missing={missing}, unexpected={unexpected}")

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    files: list[str] = []
    for module_name, codes in MODULE_CODES.items():
        filename = f"{module_name}.json"
        files.append(filename)
        module_items = [item for item in payload["items"] if item["code"] in codes]
        _write_json(
            OUTPUT_ROOT / filename,
            {"module": module_name, "items": module_items},
        )

    manifest = {
        "rule_version": payload["rule_version"],
        "status": payload["status"],
        "currency": payload["currency"],
        "price_note": payload["price_note"],
        "legacy_catalog_policy": payload["legacy_catalog_policy"],
        "item_count": len(payload["items"]),
        "item_order": [item["code"] for item in payload["items"]],
        "files": files,
    }
    _write_json(OUTPUT_ROOT / "manifest.json", manifest)


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
