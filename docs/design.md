# 自动构建设计

## 目标

把原来「手改 Markdown 大表格 + 手动 pandoc」的流程，改成**只维护一份数据表，图片、网页、README 自动生成**。

- 新增/修改型号：只改 `data/routers.csv` 一行。
- 提交后 GitHub Actions 自动重新生成图片、交互页面和 README 中的统计，并回写仓库。
- 任何人打开仓库即可看到最新表格图片，不需要本地装 pandoc。

## 数据源

`data/routers.csv`，UTF-8、逗号分隔、首行为中文表头，目前 22 列：

```
路由器名称, 型号, 上市时间, SOC, 频率/架构, NPU/加速, 内存, 内存型号, 存储, 存储型号,
2.4G 芯片, 2.4G FEM, 2.4G 无线, 5G 芯片, 5G FEM, 5G 无线, 天线, 其他功能芯片,
背板网口, USB/SATA, 交换/PHY, 备注
```

选择 CSV 的原因：Excel / WPS / Numbers 可直接编辑，git diff 逐行可读，脚本解析成本低；表头即字段名，不需要额外 schema 文件。

## 生成物

| 产物                        | 说明                                      | 是否提交            |
| --------------------------- | ----------------------------------------- | ------------------- |
| `assets/specs-overview.png` | 图片：概览与性能（时间、SOC、频率、加速） | 是                  |
| `assets/specs-memory.png`   | 图片：内存与存储                          | 是                  |
| `assets/specs-wifi24.png`   | 图片：2.4G 无线                           | 是                  |
| `assets/specs-wifi5.png`    | 图片：5G 无线                             | 是                  |
| `assets/specs-io.png`       | 图片：接口与其他（天线、网口、USB、交换） | 是                  |
| `output/index.html`         | 交互页面：搜索、列分组、排序、深色模式    | 否（CI 部署 Pages） |
| `README.md` 标记区          | 统计数字 + 五张图片                       | 是                  |

图片按用途拆成五张，是因为 21 列挤在一张图里无法阅读：图片在 GitHub README 中显示宽度约 880px，而长表格会被整体缩小，字号随之变小。五张图宽度控制在 700–850 CSS px（2 倍像素密度导出），显示时接近 1:1，中文可读。

每张图把「路由器名称 + 型号」合成一列作索引，既避免重复两列长文本，也保证 `小米AX3000` 这类同名不同型号的机型可区分。

## 构建流程

`npm run build`（`scripts/build.mjs`）：

1. 解析并校验 CSV（列数、必填字段、上市时间格式 `YYYY.M.D` / `YYYY.M`、重复型号）。
2. 计算统计（型号数量、时间跨度）。
3. 输出 `output/index.html`（模板 `web/index.html` + `web/page.css` + `web/app.js`，数据以内联 JSON 注入）。
4. 为五个列分组分别生成 `output/image-*.html`（样式 `web/image.css`）。
5. 用 Playwright Chromium 以 2 倍像素密度截图，写入 `assets/specs-*.png`。
6. 把统计与图片列表写回 `README.md` 的 `<!-- STATS:START/END -->` 与 `<!-- IMAGES:START/END -->` 标记区，并用 Prettier 统一格式。

构建是幂等的：数据没变时，重复构建产物完全一致（不写时间戳），因此 CI 不会产生空提交。

## CI

`.github/workflows/build.yml`：

- 触发：任意分支 push、pull request、手动 `workflow_dispatch`。
- 步骤：安装依赖 → 安装 Playwright Chromium 与中文字体 → 格式检查 → `npm run build`；在 `main` 上如果生成物有变更，则以 `github-actions[bot]` 提交并推送，然后上传并部署 Pages。
- 机器人提交带 `[skip ci]`，且任务以 `github.actor != 'github-actions[bot]'` 守卫，避免循环触发。
- 其他分支和 PR 只构建校验，不回写、不部署。

## 验收标准

- [x] 只改 CSV 一行，运行 `npm run build` 后五张图片、网页、README 统计同步变化。
- [x] 表格列缺失、行字段数不符、型号重复时构建失败并给出明确行号。
- [x] 生成的图片中文正常、无截断、无横向溢出（macOS 用 PingFang，CI 用 Noto Sans CJK）。
- [x] README 中五张图片可以在 GitHub 上直接显示。
- [x] push 到 `main` 后 Actions 成功，机器人提交只包含 `assets/` 与 `README.md`。
- [x] Pages 页面可访问且搜索/分组/排序可用。

## 验证记录（2026-11-23）

- 特性分支构建：[run 45135496054](https://github.com/9426224/mi-router-info/actions/runs/45135496054) 通过，未回写。
- `main` 构建与部署：[run 45135730391](https://github.com/9426224/mi-router-info/actions/runs/45135730391) 通过，机器人提交 `62b6578`（`chore: 自动更新表格图片 [skip ci]`），未触发循环构建。
- Pages：<https://9426224.github.io/mi-router-info/> 返回 200，搜索、列分组、排序均可用。
- 本地 `npm run build` 连续运行两次产物哈希一致（幂等）。
