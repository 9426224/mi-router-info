# 更新记录

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
