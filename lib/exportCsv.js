/**
 * Reusable CSV export utility - no external dependencies.
 * KISS/DRY: one function handles all export cases.
 */
export function exportToCsv(headers, rows, filename) {
  const escape = (val) => String(val ?? "").replace(/,/g, " ");

  const header = headers.join(",");
  const body = rows.map((r) => r.map(escape).join(",")).join("\n");
  const csvContent = "\uFEFF" + header + "\n" + body;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: filename + "_" + new Date().toISOString().split("T")[0] + ".csv",
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
