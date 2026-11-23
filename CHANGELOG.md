# 更新记录

## 0.4.1 - 2026-11-23

芯片参数逐项复核，修正以下错误：

- 小米路由器 HD：2.4G 芯片 QCA9981 → QCA9980；交换/PHY 补 QCA8337-AL3C
- 小米 AX3600：交换/PHY 由「集成」改为 QCA8075；红米 AX5 的「IPQ8075」笔误改为 QCA8075
- 小米 BE7000：2.4G 芯片「QCN5024 RF」改为 QCN5024
- MT7628 平台：小米路由器 4C / 4A 的 2.4G 芯片改为集成（MT7628 自带 2.4G）
- 小米 AX3000T / 联通定制 WR30U / AX3000 RA80V2 的 2.4G 芯片改为集成
- BE5000 的交换/PHY 补「集成」并注明 EN8811HN 为 PHY；BE10000 Pro 补 QCA8111 10G PHY
- 拆分图的 FEM/芯片列同步更新，一图流重新生成

## 0.4.0 - 2026-11-23

全表复核（SOC、加速器、网口、无线）并新增一图流。

- NPU/加速列按 SoC 重写：IPQ807x/6000/5000/5018 的 NPU 核心与频率、IPQ8064 的 NSS 2×733MHz、IPQ5312/5322 的 Ubi32 12T、IPQ5424 的 Hexagon 40TOPS；MT798x 标 PPE，博通标 CTF
- 修正误标：MT7628 全系没有硬件 NAT、QCA9563 没有 HWNAT、MT7621 漏标的 HWNAT、BE5000 的 AN7563 有 RX offload
- 修正 AX9000 的 5G FEM 数量（8× QPF4588）、小米万兆网口（2.5G×4 + 10G×1 + SFP+）、R3D 的 5G FEM 型号（SKY2185712）、IPQ4019 架构（A7）
- 列名更新为「NPU/加速」「交换/PHY」，说明 NPU/NSS/HWNAT/CTF 的口径
- 新增一图流 `assets/specs-all.png`（全部 20 列，1.5× 渲染），README 置顶展示
- 对照 acwifi 配置表复核了 26 个型号的 CPU、内存、闪存与 FEM，未发现其他差异

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
