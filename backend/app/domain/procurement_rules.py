import json
from pathlib import Path
from typing import Any, cast

BACKEND_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST_PATH = BACKEND_ROOT / "data" / "procurement_rules" / "manifest.json"


def load_procurement_rule_draft(
    manifest_path: Path = DEFAULT_MANIFEST_PATH,
) -> dict[str, Any]:
    """Load the modular V2 draft as the legacy aggregate payload shape."""
    manifest = _load_json(manifest_path)
    items: list[dict[str, Any]] = []
    for relative_path in manifest["files"]:
        module_payload = _load_json(manifest_path.parent / relative_path)
        items.extend(module_payload["items"])

    codes = [item["code"] for item in items]
    if len(codes) != len(set(codes)):
        raise ValueError("模块化采购规则包含重复 code")
    if len(items) != manifest["item_count"]:
        raise ValueError(
            f"采购规则数量不匹配：{len(items)} != {manifest['item_count']}"
        )
    order = {code: index for index, code in enumerate(manifest["item_order"])}
    if set(order) != set(codes):
        raise ValueError("manifest item_order 与模块规则不一致")
    items.sort(key=lambda item: order[item["code"]])

    return {
        "rule_version": manifest["rule_version"],
        "status": manifest["status"],
        "currency": manifest["currency"],
        "price_note": manifest["price_note"],
        "legacy_catalog_policy": manifest["legacy_catalog_policy"],
        "items": items,
    }


def _load_json(path: Path) -> dict[str, Any]:
    return cast(
        dict[str, Any],
        json.loads(path.read_text(encoding="utf-8")),
    )
