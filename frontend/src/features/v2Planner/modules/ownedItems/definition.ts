import type { ModuleDefinition } from "../../types";

export const ownedItemsDefinition = {
  code: "owned_items",
  name: "已有物品",
  icon: "有",
  description: "集中记录可继续使用或近期更换的物品",
  items: [],
  questions: [
    {
      key: "owned_item_notes",
      label: "已有物品补充说明",
      type: "text",
      placeholder: "例如：已有冰箱和电视，洗衣机计划明年更换",
    },
    {
      key: "replace_soon_notes",
      label: "近期需要更换的物品",
      type: "text",
      placeholder: "可选填写",
    },
  ],
} satisfies ModuleDefinition;
