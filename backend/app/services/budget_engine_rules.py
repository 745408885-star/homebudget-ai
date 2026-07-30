from app.models import ReductionPreference

CATEGORY_LIFECYCLE = {
    "基础施工": 9,
    "水电工程": 10,
    "厨房卫浴": 8,
    "全屋定制": 8,
    "家具": 7,
    "家电": 6,
    "软装": 4,
    "备用金": 7,
}

CATEGORY_HEALTH = {
    "基础施工": 7,
    "水电工程": 9,
    "厨房卫浴": 7,
    "全屋定制": 5,
    "家具": 5,
    "家电": 5,
    "软装": 3,
    "备用金": 6,
}

HEALTH_OVERRIDES = {
    "waterproofing": 10,
    "plumbing_electrical_rebuild": 9,
    "mattress": 10,
    "bed_frame": 8,
    "sanitary_ware": 8,
    "wall_ceiling_finish": 8,
    "air_conditioning": 7,
}

SLEEP_CODES = {"mattress", "bed_frame", "curtains", "bedding_decor"}
KITCHEN_CODES = {
    "kitchen_cabinets",
    "kitchen_bath_hardware",
    "refrigerator",
    "cooking_appliances",
}
STORAGE_CODES = {
    "wardrobes",
    "entryway_cabinet",
    "custom_storage",
}
ENTERTAINMENT_CODES = {
    "sofa",
    "network_wiring",
    "home_entertainment",
    "smart_home_devices",
}

REDUCTION_GROUPS = {
    ReductionPreference.AESTHETICS: {
        "curtains",
        "decorative_lighting",
        "bedding_decor",
        "decorative_accessories",
    },
    ReductionPreference.ENTERTAINMENT: ENTERTAINMENT_CODES,
    ReductionPreference.STORAGE: STORAGE_CODES,
    ReductionPreference.COMFORT: {
        "mattress",
        "bed_frame",
        "sofa",
        "air_conditioning",
        "laundry_appliances",
    },
    ReductionPreference.SMART_HOME: {
        "network_wiring",
        "smart_home_devices",
    },
}

REDUCTION_LABELS = {
    ReductionPreference.AESTHETICS: "美观",
    ReductionPreference.ENTERTAINMENT: "娱乐",
    ReductionPreference.STORAGE: "收纳",
    ReductionPreference.COMFORT: "舒适度",
    ReductionPreference.SMART_HOME: "智能化",
}
