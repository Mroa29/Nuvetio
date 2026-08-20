export function getConsent(store) {
  const value = store?.get?.("nuvetio.learning.consent");
  return value === "granted" || value === "denied" ? value : "unknown";
}

export function setConsent(store, value, now = new Date().toISOString()) {
  if (value !== "granted" && value !== "denied") throw new TypeError("consent must be granted or denied");
  store.set("nuvetio.learning.consent", value);
  store.set("nuvetio.learning.consentAt", now);
  return { value, at: now };
}
