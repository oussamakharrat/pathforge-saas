export function cn(...c: (string | boolean | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

export function extractSalaryNumber(salaryStr: string): string {
  if (!salaryStr) return "145000";
  const cleaned = salaryStr.toLowerCase().replace(/[^0-9\-km]/g, "");
  const parts = cleaned.split("-");
  const part = parts[0] || "";
  let num = parseInt(part);
  if (isNaN(num)) return "145000";
  if (part.includes("k")) num *= 1000;
  else if (part.includes("m")) num *= 1000000;
  if (num < 1000 && (salaryStr.toLowerCase().includes("k") || cleaned.includes("k"))) {
    num *= 1000;
  }
  return num.toString();
}
