const ALPH = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function gen(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPH[Math.floor(Math.random() * ALPH.length)];
  return s;
}
export function validate(code) {
  if (!code) return { ok: false, msg: "Empty" };
  if (typeof code !== "string") return { ok: false, msg: "Invalid" };
  if (code.length < 3 || code.length > 20) return { ok: false, msg: "3-20 chars" };
  if (!/^[a-zA-Z0-9]+$/.test(code)) return { ok: false, msg: "Alphanumeric only" };
  return { ok: true };
}
