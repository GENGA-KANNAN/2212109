const LOG_KEY = "app_logs_v1";
function readLogs(){
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeLogs(arr) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(arr));
  } catch {}
}
export function logAction(action,payload={}) {
  const logs=readLogs();
  logs.push({timestamp:new Date().toISOString(),action, payload});
  writeLogs(logs);
}
export function getAllLogs() {
  return readLogs();
}
export function clearLogs() {
  writeLogs([]);
}
