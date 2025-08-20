const KEY = "short_urls_v1";

/**
 record:
 {
   code: string,
   longUrl: string,
   createdAt: ISO,
   expiresAt: ISO,
   validityMins: number,
   clicks: [{ timestamp: ISO, referrer: string }, ...],
   custom: boolean
 }
*/

export function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function find(code) {
  return readAll().find((r) => r.code === code);
}

export function exists(code) {
  return !!find(code);
}

export function save(record) {
  const list = readAll();
  const idx = list.findIndex((r) => r.code === record.code);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  writeAll(list);
}
