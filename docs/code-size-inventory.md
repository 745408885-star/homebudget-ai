# Code size inventory

审计版本：`v0.1.0-alpha.1`

统计口径：2026-07-30，使用 UTF-8 文本行统计；包含 `py`、`ts`、`tsx`、
`css`、`ps1` 和 `js`。共 132 个代码文件、约 8,387 行。两份已被
`.gitignore` 隔离的本机 PostgreSQL 恢复脚本也列入完整性检查。

```text
 325  backend/alembic/drafts/20260729_0003_phase6a_v2_schema.py
 252  frontend/src/pages/ResultPage.module.css
 235  frontend/src/features/v2Planner/pages/BasicInfoPage.tsx
 231  frontend/src/pages/HomePage.module.css
 226  frontend/src/features/v2Planner/modules/shared/ModuleEditor.tsx
 212  frontend/src/pages/PlannerPage.module.css
 201  backend/tests/test_budget_engine.py
 196  backend/alembic/versions/20260728_0001_initial_schema.py
 189  backend/tests/test_v2_design_contracts.py
 173  backend/app/services/budget_scoring.py
 168  frontend/src/features/v2Planner/modules/shared/ModuleEditor.module.css
 165  frontend/src/features/v2Planner/pages/BasicInfoPage.module.css
 160  scripts/start-dev.ps1
 157  frontend/src/pages/result/ResultSections.tsx
 149  frontend/src/features/v2Planner/pages/PreviewPage.module.css
 148  frontend/src/features/v2Planner/pages/PreviewPage.tsx
 143  backend/app/db/models.py
 134  frontend/src/features/v2Planner/state/transitions.ts
 129  backend/app/repositories/budget_repository.py
 127  backend/scripts/recover_and_bootstrap_local_postgres.ps1
 126  backend/scripts/restore_local_postgres_service.ps1
 125  backend/app/models.py
 118  backend/alembic/versions/20260728_0002_seed_reference_data.py
 116  frontend/src/api/budget.ts
 107  frontend/src/features/v2Planner/pages/ModulesPage.module.css
 106  backend/app/services/budget_engine.py
 102  frontend/src/hooks/useBudgetPlanner.ts
 100  frontend/src/components/BudgetGroups.module.css
  98  frontend/src/pages/HomePage.tsx
  94  frontend/src/features/v2Planner/utils/estimates.ts
  93  backend/app/schemas/v2/plans.py
  90  backend/app/services/budget_reporting.py
  84  backend/scripts/split_procurement_rules.py
  81  frontend/src/features/v2Planner/modules/kitchenAppliances/definition.ts
  79  backend/app/db/seed.py
  78  frontend/src/features/v2Planner/pages/ModulesPage.tsx
  76  backend/app/services/budget_engine_rules.py
  74  frontend/src/features/v2Planner/types/index.ts
  73  frontend/src/features/v2Planner/components/ModuleCard.module.css
  72  frontend/src/components/BudgetGroups.tsx
  69  backend/app/api/routes/budget.py
  69  frontend/src/pages/planner/usePlannerFlow.ts
  67  frontend/src/pages/planner/HouseStep.tsx
  66  frontend/src/pages/PlannerPage.tsx
  65  backend/scripts/verify_database.py
  63  backend/app/schemas/v2/requirements.py
  62  frontend/src/pages/planner/LifestyleStep.tsx
  61  frontend/src/features/v2Planner/modules/climate/definition.ts
  60  backend/app/schemas/v2/pricing.py
  59  frontend/src/features/v2Planner/V2PlannerApp.tsx
  58  frontend/src/features/v2Planner/modules/networkAndSmart/definition.ts
  58  frontend/src/types/budget.ts
  57  frontend/src/components/Button.module.css
  57  frontend/src/features/v2Planner/components/V2Shell.module.css
  57  frontend/src/pages/ResultPage.tsx
  56  backend/scripts/bootstrap_local_postgres.py
  56  frontend/src/features/v2Planner/components/ModuleCard.tsx
  55  backend/app/schemas/v2/common.py
  54  backend/app/models_v2.py
  51  backend/app/schemas/v2/__init__.py
  49  frontend/src/features/v2Planner/modules/cleaning/definition.ts
  49  frontend/src/features/v2Planner/modules/entertainment/definition.ts
  49  frontend/src/pages/planner/BudgetStep.tsx
  49  frontend/src/styles/global.css
  49  scripts/stop-dev.ps1
  48  frontend/src/features/v2Planner/components/V2Shell.tsx
  47  frontend/src/features/v2Planner/components/ItemStatusSelector.tsx
  46  frontend/src/features/v2Planner/modules/laundry/definition.ts
  46  frontend/src/features/v2Planner/modules/waterAndHeating/definition.ts
  46  frontend/src/features/v2Planner/pages/ModuleRoutePage.tsx
  45  frontend/src/components/Brand.module.css
  44  frontend/src/components/ChoiceGroup.module.css
  44  frontend/src/features/v2Planner/state/storage.ts
  43  backend/app/services/budget_allocation.py
  40  frontend/src/features/v2Planner/hooks/useV2Planner.ts
  39  backend/alembic/env.py
  38  backend/app/domain/procurement_rules.py
  35  frontend/src/features/v2Planner/components/ItemStatusSelector.module.css
  34  frontend/src/App.tsx
  34  frontend/src/features/v2Planner/utils/moduleProgress.ts
  33  frontend/src/features/v2Planner/state/initialState.ts
  32  frontend/src/components/ChoiceGroup.tsx
  31  frontend/src/features/v2Planner/modules/furniture/definition.ts
  28  frontend/src/features/v2Planner/modules/catalog.ts
  27  frontend/eslint.config.js
  27  frontend/src/components/PlannerProgress.module.css
  25  backend/app/services/budget_engine_v2.py
  25  frontend/src/features/v2Planner/modules/beddingAndStorage/definition.ts
  23  frontend/src/features/v2Planner/modules/decoration/definition.ts
  23  frontend/src/features/v2Planner/modules/entertainment/EntertainmentModule.tsx
  22  frontend/src/features/v2Planner/modules/ownedItems/definition.ts
  22  frontend/src/features/v2Planner/utils/navigation.ts
  21  frontend/src/features/v2Planner/modules/curtainsAndLighting/definition.ts
  19  backend/app/db/session.py
  18  backend/app/core/config.py
  18  frontend/src/components/Button.tsx
  18  frontend/src/components/PlannerProgress.tsx
  15  frontend/src/features/v2Planner/modules/networkAndSmart/NetworkAndSmartModule.tsx
  15  frontend/src/features/v2Planner/modules/shared/types.ts
  15  frontend/src/pages/planner/FormHeading.tsx
  14  backend/app/main.py
  14  frontend/src/features/v2Planner/modules/climate/ClimateModule.tsx
  14  frontend/src/features/v2Planner/modules/kitchenAppliances/KitchenAppliancesModule.tsx
  14  frontend/src/styles/tokens.css
  13  frontend/src/features/v2Planner/modules/cleaning/CleaningModule.tsx
  13  frontend/src/features/v2Planner/modules/laundry/LaundryModule.tsx
  13  frontend/src/features/v2Planner/modules/waterAndHeating/WaterAndHeatingModule.tsx
  13  frontend/vite.config.ts
  12  backend/app/schemas/v2/items.py
  12  frontend/src/components/Brand.tsx
  12  frontend/src/features/v2Planner/modules/shared/options.ts
  11  backend/app/schemas/v2/rooms.py
  11  backend/app/services/budget_engine_types.py
  11  frontend/src/features/v2Planner/modules/furniture/FurnitureModule.tsx
  10  frontend/src/features/v2Planner/modules/beddingAndStorage/BeddingAndStorageModule.tsx
  10  frontend/src/features/v2Planner/modules/curtainsAndLighting/CurtainsAndLightingModule.tsx
  10  frontend/src/features/v2Planner/modules/decoration/DecorationModule.tsx
  10  frontend/src/features/v2Planner/modules/ownedItems/OwnedItemsModule.tsx
   9  frontend/src/main.tsx
   7  frontend/src/utils/currency.ts
   5  frontend/src/pages/planner/types.ts
   3  backend/app/db/base.py
   1  backend/app/domain/__init__.py
   1  backend/app/schemas/__init__.py
   1  frontend/src/vite-env.d.ts
   0  backend/app/__init__.py
   0  backend/app/api/__init__.py
   0  backend/app/api/routes/__init__.py
   0  backend/app/core/__init__.py
   0  backend/app/db/__init__.py
   0  backend/app/repositories/__init__.py
   0  backend/app/services/__init__.py
```

## 警戒线结论

- TypeScript/TSX：无文件超过 350 行。
- Python 业务代码：无文件超过 450 行。
- CSS Module：无文件超过 350 行。
- 普通业务函数：无函数超过 80 行；前端最长业务函数为 73 行。
- 325 行 V2 Alembic 草稿、196 行正式 Alembic 迁移及迁移中的长函数属于
  明确允许的迁移/生成代码例外。
