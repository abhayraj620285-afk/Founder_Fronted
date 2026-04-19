/**
 * jwt.js
 *
 * Your Spring Boot JwtService.generateToken() now adds:
 *   .claim("role", role)
 *
 * So the JWT payload looks like:
 *   { "sub": "founder@gmail.com", "role": "FOUNDER", "iat": ..., "exp": ... }
 *
 * extractRole() reads payload.role directly.
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

const KNOWN_ROLES = ["ADMIN", "FOUNDER", "USER"];

export function extractRole(token) {
  const p = decodeToken(token);
  if (!p) return null;

  // Primary: your backend uses .claim("role", role)
  if (typeof p.role === "string") {
    const r = strip(p.role);
    if (r) return r;
  }

  // Fallbacks for any future changes
  if (Array.isArray(p.roles) && p.roles.length > 0) {
    const v = p.roles[0];
    const r = strip(typeof v === "string" ? v : v?.authority ?? "");
    if (r) return r;
  }

  if (Array.isArray(p.authorities) && p.authorities.length > 0) {
    const v = p.authorities[0];
    const r = strip(typeof v === "string" ? v : v?.authority ?? "");
    if (r) return r;
  }

  // Brute-force scan all values
  for (const [key, val] of Object.entries(p)) {
    if (typeof val === "string") {
      const r = strip(val);
      if (r && KNOWN_ROLES.includes(r)) {
        console.log(`extractRole: found "${r}" in field "${key}"`);
        return r;
      }
    }
  }

  return null;
}

export function extractEmail(token) {
  const p = decodeToken(token);
  return p?.sub ?? p?.email ?? p?.username ?? null;
}

export function isTokenExpired(token) {
  const p = decodeToken(token);
  if (!p?.exp) return false;
  return Date.now() / 1000 > p.exp;
}

export function tokenSummary(token) {
  const p = decodeToken(token);
  if (!p) return null;
  return {
    email:   extractEmail(token),
    role:    extractRole(token),
    expired: isTokenExpired(token),
    exp:     p.exp ? new Date(p.exp * 1000).toLocaleString() : "none",
  };
}

export function debugToken(token) {
  const p = decodeToken(token);
  console.group("🔍 JWT Payload");
  console.log(JSON.stringify(p, null, 2));
  console.log("role →", extractRole(token));
  console.log("email →", extractEmail(token));
  console.groupEnd();
  return p;
}