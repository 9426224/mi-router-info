# 更新记录

## 0.3.1 - 2026-11-23

射频与天线字段改写为统一、可核对的写法。

- 无线列统一为 `MIMO · 频宽 · 速率 · 调制`，例如 `2×2 · 40MHz · 574Mbps · 1024-QAM`；多频段/多模式用换行分隔（AX9000、HomeWiFi、万兆、BE7000、BE10000 Pro）
- 天线列改为 `n 根内置/外置`，能确认时补充频段分配与特殊天线；修正 HomeWiFi（8 根，含蓝牙/NFC）、BE6500 Pro（另含蓝牙/NFC）、BE3600 2.5G（内置）
- FEM、芯片与网口计数统一用 `×`；列名统一为「2.4G 芯片 / 2.4G 无线 / 5G 芯片 / 5G 无线」
- 修正 BE7000 的 5G 双频/三频两种模式表述，补齐 HomeWiFi 5.8G 的 4×4 4096-QAM 规格

## 0.3.0 - 2026-11-23

补充 2024–2026 年型号，修正已知错误，并补全来源与批次说明。

- 新增：小米BE6500、小米BE7200 Pro、小米BE10000 Pro、小米全屋路由 BE3600 Pro 网线版、小米AX3000T 高通版
- 修正：小米BE6500 Pro 的 2.4G FEM（QPF4259）与 5G 速率（5765M）、小米BE3600 2.5G 的 2.5G PHY（QCA8081）、小米BE5000 的 NPU 字段、小米BE7000 的存储型号与辅助芯片
- 补齐：小米路由器Mesh 的无线芯片、FEM 与闪存型号；统一 `Mhz` 为 `MHz`；型号名称加空格（BE6500 Pro / BE3600 Pro）
- 数据支持 `YYYY.M`（仅到月份）的上市时间；表格按时间重新排序
- 新增 [docs/sources.md](docs/sources.md) 与 [docs/variants.md](docs/variants.md)，重写 README 与字段说明

## 0.2.0 - 2026-11-23

数据驱动重构：改一行 CSV 即可生成 README 图片与网页。

- 新增 `data/routers.csv` 作为唯一数据源，替代原来的 Markdown 大表格（`mi-router-info.md` 与 `style.css` 已移除）
- 新增 `scripts/build.mjs`：校验数据并生成三张分组表格图片、交互页面，回写 README 统计与图片
- 新增 `web/`：可搜索、排序、按列分组的静态页面，支持深色模式
- 新增 GitHub Actions 自动构建与回写，并把页面部署到 GitHub Pages
- 新增 `docs/design.md`、`docs/contributing.md`、`VERSION`
- 图片不再需要手动截取或 TBD

## 0.1.0 - 2024-12-24

- 上游初始版本：Markdown 表格 + pandoc 生成 HTML（图片待补）
