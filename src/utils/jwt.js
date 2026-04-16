/**
 * jwt.js — JWT decoder that handles every known Spring Security format
 * and dumps the full payload to console so you can see exactly what
 * field your backend uses.
 */

export function decodeToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts  = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function strip(str) {
  if (!str || typeof str !== "string") return null;
  return str.replace(/^ROLE_/i, "").toUpperCase().trim();
}

const KNOWN = ["ADMIN", "FOUNDER", "USER"];

export function extractRole(token) {
  const p = decodeToken(token);
  if (!p) return null;

  // Try every known field name Spring Boot uses
  const candidates = [
    p.role,
    p.Role,
    p.ROLE,
    p.scope,
    ...(Array.isArray(p.roles)       ? p.roles       : []),
    ...(Array.isArray(p.authorities) ? p.authorities : []),
    ...(Array.isArray(p.Authorities) ? p.Authorities : []),
    ...(Array.isArray(p.permissions) ? p.permissions : []),
  ];

  for (const c of candidates) {
    if (!c) continue;
    // Handle { authority: "ROLE_FOUNDER" } objects
    const str = typeof c === "string" ? c : c?.authority ?? c?.name ?? "";
    const n   = strip(str);
    if (n && KNOWN.includes(n)) return n;
  }

  // Last resort: scan ALL values in the payload for a known role string
  for (const [key, val] of Object.entries(p)) {
    if (typeof val === "string") {
      const n = strip(val);
      if (n && KNOWN.includes(n)) {
        console.log(`📍 extractRole: found role "${n}" in payload field "${key}"`);
        return n;
      }
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        const str = typeof item === "string" ? item : item?.authority ?? item?.name ?? "";
        const n   = strip(str);
        if (n && KNOWN.includes(n)) {
          console.log(`📍 extractRole: found role "${n}" in array field "${key}"`);
          return n;
        }
      }
    }
  }

  return null;
}

export function extractEmail(token) {
  const p = decodeToken(token);
  return p?.sub ?? p?.email ?? p?.username ?? p?.user ?? null;
}

export function isTokenExpired(token) {
  const p = decodeToken(token);
  if (!p?.exp) return false;
  return Date.now() / 1000 > p.exp;
}

export function tokenSummary(token) {
  const payload = decodeToken(token);
  if (!payload) return null;
  return {
    email:   extractEmail(token),
    role:    extractRole(token),
    expired: isTokenExpired(token),
    exp:     payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "none",
  };
}

export function debugToken(token) {
  const payload = decodeToken(token);
  console.group("🔍 FounderBrain — JWT Payload (copy this if role is null)");
  console.log(JSON.stringify(payload, null, 2));
  console.log("extractRole →", extractRole(token));
  console.groupEnd();
  return payload;
}