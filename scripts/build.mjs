#!/usr/bin/env node
/**
 * 从 data/routers.csv 生成：
 *   - assets/specs-*.png   供 README 展示的表格图片
 *   - output/index.html    可搜索/排序的交互页面
 *   - README.md 的统计与图片区块
 */
import { chromium } from "playwright";
import prettier from "prettier";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "data", "routers.csv");
const OUT_DIR = path.join(ROOT, "output");
const ASSET_DIR = path.join(ROOT, "assets");
const README_FILE = path.join(ROOT, "README.md");

const COLUMNS = [
  "路由器名称",
  "型号",
  "上市时间",
  "SOC",
  "频率/架构",
  "ACC/NPU",
  "内存",
  "内存型号",
  "存储",
  "存储型号",
  "2.4G 芯片",
  "2.4G FEM",
  "2.4G 无线",
  "5G 芯片",
  "5G FEM",
  "5G 无线",
  "天线",
  "其他功能芯片",
  "背板网口",
  "USB/SATA",
  "交换机芯片",
];

/** 图片按列分成三张，避免 21 列挤在一张图里不可读。 */
const GROUPS = [
  {
    id: "overview",
    title: "概览与性能",
    columns: ["路由器", "上市时间", "SOC", "频率/架构", "ACC/NPU"],
  },
  {
    id: "memory",
    title: "内存与存储",
    columns: ["路由器", "内存", "内存型号", "存储", "存储型号"],
  },
  {
    id: "wifi24",
    title: "2.4G 无线",
    columns: ["路由器", "2.4G 芯片", "2.4G FEM", "2.4G 无线"],
  },
  {
    id: "wifi5",
    title: "5G 无线",
    columns: ["路由器", "5G 芯片", "5G FEM", "5G 无线"],
  },
  {
    id: "io",
    title: "接口与其他",
    columns: [
      "路由器",
      "天线",
      "其他功能芯片",
      "背板网口",
      "USB/SATA",
      "交换机芯片",
    ],
  },
];

/** 图片里把「名称 + 型号」合成一列，避免每张图重复两列长文本。 */
const KEY_COLUMN = "路由器";

/** 长文本列：图片里限制宽度换行，网页里允许折行。 */
const WRAP_COLUMNS = [
  "频率/架构",
  "内存型号",
  "存储型号",
  "2.4G FEM",
  "5G FEM",
  "5G 无线",
  "其他功能芯片",
  "交换机芯片",
];

const COLUMN_WIDTH = {
  路由器: 258,
  上市时间: 92,
  SOC: 122,
  "频率/架构": 124,
  "ACC/NPU": 92,
  内存: 104,
  内存型号: 160,
  存储: 62,
  存储型号: 180,
  "2.4G 芯片": 128,
  "2.4G FEM": 138,
  "2.4G 无线": 270,
  "5G 芯片": 128,
  "5G FEM": 140,
  "5G 无线": 340,
  天线: 150,
  其他功能芯片: 116,
  背板网口: 108,
  "USB/SATA": 96,
  交换机芯片: 136,
};

/** 不允许换行的短字段，换行会让日期、容量等难以扫读。 */
const NOWRAP_COLUMNS = new Set([
  "上市时间",
  "ACC/NPU",
  "内存",
  "存储",
  "USB/SATA",
]);

const STATS_START = "<!-- STATS:START -->";
const STATS_END = "<!-- STATS:END -->";
const IMAGES_START = "<!-- IMAGES:START -->";
const IMAGES_END = "<!-- IMAGES:END -->";

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** 图片排版用：在 + / `/` 之后插入零宽空格，长型号优先在这些位置换行，而不是被硬拆两半。 */
const softBreak = (value) => esc(value).replace(/([+/])/g, "$1\u200b");

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

async function loadData() {
  const rows = parseCsv(await readFile(DATA_FILE, "utf8"));
  if (rows.length < 2)
    fail(`${path.relative(ROOT, DATA_FILE)} 至少需要一行表头和一行数据`);

  const header = rows[0].map((cell) => cell.trim());
  const missing = COLUMNS.filter((column) => !header.includes(column));
  const unknown = header.filter((column) => !COLUMNS.includes(column));
  if (missing.length || unknown.length) {
    fail(
      `表头与约定不一致。缺少：${missing.join("、") || "无"}；多余：${unknown.join("、") || "无"}。` +
        `如确实要增删列，请同步修改 scripts/build.mjs 中的 COLUMNS。`,
    );
  }
  if (header.join(",") !== COLUMNS.join(",")) {
    fail(
      `表头顺序应与约定一致：\n  ${COLUMNS.join(",")}\n  ${header.join(",")}`,
    );
  }

  const records = [];
  const seen = new Map();
  rows.slice(1).forEach((cells, index) => {
    const line = index + 2;
    if (cells.length !== header.length) {
      fail(
        `第 ${line} 行有 ${cells.length} 列，应为 ${header.length} 列（${cells[0]?.trim() || "空行"}）`,
      );
    }
    const record = {};
    header.forEach((key, column) => {
      record[key] = cells[column].trim();
    });
    if (!record["路由器名称"] || !record["型号"])
      fail(`第 ${line} 行缺少「路由器名称」或「型号」`);
    const key = `${record["路由器名称"]}|${record["型号"]}`;
    if (seen.has(key))
      fail(`第 ${line} 行与第 ${seen.get(key)} 行重复：${key}`);
    seen.set(key, line);
    if (!/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(record["上市时间"])) {
      console.warn(
        `! 第 ${line} 行「上市时间」建议写作 YYYY.M.D，当前为「${record["上市时间"]}」`,
      );
    }
    records.push(record);
  });
  return { header, records };
}

function computeStats(records) {
  const years = records
    .map((record) => Number(/^(\d{4})\./.exec(record["上市时间"])?.[1]))
    .filter((year) => Number.isFinite(year));
  return {
    count: records.length,
    from: years.length ? Math.min(...years) : "—",
    to: years.length ? Math.max(...years) : "—",
    columns: COLUMNS.length,
  };
}

function renderIndex(template, header, records, stats) {
  const data = {
    headers: header,
    rows: records.map((record) => header.map((key) => record[key])),
    groups: GROUPS.map((group) => ({
      id: group.id,
      title: group.title,
      columns: group.columns.flatMap((column) =>
        column === KEY_COLUMN ? ["路由器名称", "型号"] : [column],
      ),
    })),
    wrapColumns: WRAP_COLUMNS,
  };
  // JSON 放进 <script> 前把 < 转义，避免提前闭合标签。
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return template
    .replace("{{DATA_JSON}}", () => json)
    .replace("{{STATS}}", () => renderStatsMarkup(stats));
}

function renderStatsMarkup(stats) {
  const chips = [
    ["型号总数", `${stats.count} 款`],
    ["上市年份", `${stats.from}–${stats.to}`],
    ["参数列", `${stats.columns} 项`],
  ];
  return chips
    .map(
      ([label, value]) =>
        `<div class="chip"><span class="chip__label">${esc(label)}</span><span class="chip__value">${esc(value)}</span></div>`,
    )
    .join("");
}

function renderTable(columns, records) {
  const cols = columns
    .map((column) => `<col style="width:${COLUMN_WIDTH[column] ?? 120}px">`)
    .join("");
  const head = columns
    .map((column) => `<th scope="col">${esc(column)}</th>`)
    .join("");
  const body = records
    .map(
      (record) =>
        `<tr>${columns
          .map((column) => {
            if (column === KEY_COLUMN) {
              return `<td class="key"><span class="key__name">${esc(record["路由器名称"])}</span><span class="key__model">${softBreak(record["型号"])}</span></td>`;
            }
            const value = record[column];
            const classes = [];
            if (value === "-") classes.push("muted");
            if (NOWRAP_COLUMNS.has(column)) classes.push("nowrap");
            const className = classes.length
              ? ` class="${classes.join(" ")}"`
              : "";
            return `<td${className}>${softBreak(value).replace(/；/g, "<br>")}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("\n");

  const width = columns.reduce(
    (sum, column) => sum + (COLUMN_WIDTH[column] ?? 120),
    0,
  );
  return `<table style="width:${width}px"><colgroup>${cols}</colgroup><thead><tr>${head}</tr></thead><tbody>\n${body}\n</tbody></table>`;
}

function renderImagePage({ group, index, total, records, stats }) {
  const title = "小米历代路由器参数汇总";
  const part = `${group.title} ${index + 1}/${total}`;
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>${esc(title)} · ${esc(group.title)}</title>
    <link rel="stylesheet" href="image.css" />
  </head>
  <body>
    <div class="sheet">
      <header class="sheet__head">
        <h1 class="sheet__title">${esc(title)}</h1>
        <span class="sheet__part">${esc(part)}</span>
        <p class="sheet__meta">共 ${stats.count} 款 · ${esc(stats.from)}–${esc(stats.to)}</p>
      </header>
      ${renderTable(group.columns, records)}
      <footer class="sheet__foot">github.com/9426224/mi-router-info</footer>
    </div>
  </body>
</html>
`;
}

async function screenshotImages(records, stats) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      deviceScaleFactor: 2,
      viewport: { width: 1600, height: 1200 },
    });
    const outputs = [];
    for (const [index, group] of GROUPS.entries()) {
      const html = renderImagePage({
        group,
        index,
        total: GROUPS.length,
        records,
        stats,
      });
      const pageFile = path.join(OUT_DIR, `image-${group.id}.html`);
      await writeFile(pageFile, html, "utf8");
      await page.goto(pathToFileURL(pageFile).href, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const sheet = page.locator(".sheet");
      await sheet.waitFor();
      const target = path.join(ASSET_DIR, `specs-${group.id}.png`);
      await sheet.screenshot({ path: target });
      outputs.push({ group, target });
    }
    return outputs;
  } finally {
    await browser.close();
  }
}

function replaceReadmeBlock(readme, start, end, content, label) {
  const startAt = readme.indexOf(start);
  const endAt = readme.indexOf(end);
  if (startAt === -1 || endAt === -1 || endAt < startAt) {
    fail(`README.md 缺少 ${label} 标记块（${start} … ${end}）`);
  }
  return (
    readme.slice(0, startAt + start.length) +
    `\n${content}\n` +
    readme.slice(endAt)
  );
}

async function updateReadme(records, stats, images) {
  let readme = await readFile(README_FILE, "utf8");

  const statsText = `**${stats.count} 款型号** · 上市时间 ${stats.from}–${stats.to} · ${stats.columns} 项参数 · 数据源 [\`data/routers.csv\`](data/routers.csv)`;
  const imageText = images
    .map(
      ({ group }) =>
        `### ${group.title}\n\n![小米历代路由器 ${group.title} 参数表](assets/specs-${group.id}.png)`,
    )
    .join("\n\n");

  readme = replaceReadmeBlock(
    readme,
    STATS_START,
    STATS_END,
    statsText,
    "统计",
  );
  readme = replaceReadmeBlock(
    readme,
    IMAGES_START,
    IMAGES_END,
    imageText,
    "图片",
  );
  readme = await prettier.format(readme, { parser: "markdown" });
  await writeFile(README_FILE, readme, "utf8");
}

async function main() {
  const { header, records } = await loadData();
  const stats = computeStats(records);

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ASSET_DIR, { recursive: true });

  const template = await readFile(path.join(ROOT, "web", "index.html"), "utf8");
  await writeFile(
    path.join(OUT_DIR, "index.html"),
    renderIndex(template, header, records, stats),
    "utf8",
  );
  for (const file of ["page.css", "app.js", "image.css"]) {
    await copyFile(path.join(ROOT, "web", file), path.join(OUT_DIR, file));
  }

  const images = await screenshotImages(records, stats);
  await updateReadme(records, stats, images);

  console.log(
    `✔ ${stats.count} 款型号（${stats.from}–${stats.to}），${stats.columns} 列`,
  );
  console.log(`✔ output/index.html`);
  images.forEach(({ group, target }) =>
    console.log(`✔ ${path.relative(ROOT, target)}（${group.title}）`),
  );
  console.log("✔ README.md 统计与图片已更新");
}

await main();
