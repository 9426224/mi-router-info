const { headers, rows, groups, wrapColumns } = window.__ROUTER_DATA__;

const wrapSet = new Set(wrapColumns);
const columnIndex = new Map(headers.map((header, index) => [header, index]));
const tableHost = document.getElementById("tablewrap");
const countHost = document.getElementById("count");
const groupHost = document.getElementById("groups");
const searchInput = document.getElementById("q");

const state = { query: "", group: "all", sort: null };

function columnsFor(groupId) {
  if (groupId === "all") return headers.slice();
  const group = groups.find((item) => item.id === groupId);
  return group ? group.columns.slice() : headers.slice();
}

function dateKey(value) {
  const match = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/.exec(value);
  return match
    ? `${match[1]}.${match[2].padStart(2, "0")}.${match[3].padStart(2, "0")}`
    : value;
}

function compareRows(left, right, column) {
  const index = columnIndex.get(column);
  const a = column === "上市时间" ? dateKey(left[index]) : left[index];
  const b = column === "上市时间" ? dateKey(right[index]) : right[index];
  return a.localeCompare(b, "zh-Hans-CN", { numeric: true });
}

function appendHighlighted(element, text, query) {
  if (!query) {
    element.textContent = text;
    return;
  }
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();
  let cursor = 0;
  for (;;) {
    const hit = haystack.indexOf(needle, cursor);
    if (hit === -1) {
      element.append(text.slice(cursor));
      return;
    }
    if (hit > cursor) element.append(text.slice(cursor, hit));
    const mark = document.createElement("mark");
    mark.textContent = text.slice(hit, hit + needle.length);
    element.append(mark);
    cursor = hit + needle.length;
  }
}

function buildHead(columns) {
  const thead = document.createElement("thead");
  const row = document.createElement("tr");
  for (const column of columns) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = column;
    cell.tabIndex = 0;
    cell.dataset.column = column;
    const active = state.sort?.column === column;
    cell.setAttribute(
      "aria-sort",
      active
        ? state.sort.direction === "asc"
          ? "ascending"
          : "descending"
        : "none",
    );
    if (active) cell.dataset.sort = state.sort.direction;
    const toggle = () => {
      const direction =
        state.sort?.column === column && state.sort.direction === "asc"
          ? "desc"
          : "asc";
      state.sort = { column, direction };
      render();
    };
    cell.addEventListener("click", toggle);
    cell.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
    row.append(cell);
  }
  thead.append(row);
  return thead;
}

function buildBody(columns, list, query) {
  const tbody = document.createElement("tbody");
  for (const record of list) {
    const row = document.createElement("tr");
    for (const column of columns) {
      const cell = document.createElement("td");
      const value = record[columnIndex.get(column)];
      if (value === "-") cell.className = "muted";
      else if (wrapSet.has(column)) cell.className = "wrap";
      appendHighlighted(cell, value, query);
      row.append(cell);
    }
    tbody.append(row);
  }
  return tbody;
}

function renderGroups() {
  const items = [{ id: "all", title: "全部列" }, ...groups];
  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.title;
    button.className = "group";
    button.setAttribute("aria-pressed", String(state.group === item.id));
    button.addEventListener("click", () => {
      state.group = item.id;
      for (const other of groupHost.children)
        other.setAttribute("aria-pressed", String(other === button));
      render();
    });
    groupHost.append(button);
  }
}

function render() {
  const columns = columnsFor(state.group);
  const query = state.query.trim();
  let list = query
    ? rows.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(query.toLowerCase())),
      )
    : rows;

  if (state.sort) {
    const factor = state.sort.direction === "asc" ? 1 : -1;
    list = list
      .slice()
      .sort((a, b) => factor * compareRows(a, b, state.sort.column));
  }

  const table = document.createElement("table");
  table.append(buildHead(columns), buildBody(columns, list, query));
  tableHost.replaceChildren(table);

  countHost.textContent = query
    ? `${list.length} / ${rows.length} 款`
    : `${rows.length} 款 · ${headers.length} 列`;
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

renderGroups();
render();
