import { describe, it, expect } from "vitest";
import { sanitizeString, sanitizeFormula, validateAddress } from "./security";

describe("security: sanitizeString", () => {
  it("escapes special HTML characters to prevent HTML/XSS injection", () => {
    const malicious = '<script>alert("hack")</script> & cookie';
    const clean = sanitizeString(malicious);
    expect(clean).toBe("&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt; &amp; cookie");
  });

  it("handles non-string values by converting to string or empty string", () => {
    expect(sanitizeString(null)).toBe("");
    expect(sanitizeString(undefined)).toBe("");
    expect(sanitizeString(123)).toBe("123");
    expect(sanitizeString(true)).toBe("true");
  });
});

describe("security: sanitizeFormula", () => {
  it("prefixes strings starting with formula characters with a single quote", () => {
    expect(sanitizeFormula("=SUM(A1:A5)")).toBe("'=SUM(A1:A5)");
    expect(sanitizeFormula("+100")).toBe("'+100");
    expect(sanitizeFormula("-200")).toBe("'-200");
    expect(sanitizeFormula("@ref")).toBe("'@ref");
  });

  it("leaves standard strings untouched", () => {
    expect(sanitizeFormula("Bandra Station")).toBe("Bandra Station");
    expect(sanitizeFormula("123 miles")).toBe("123 miles");
  });

  it("handles non-string values by converting to string or empty string", () => {
    expect(sanitizeFormula(null)).toBe("");
    expect(sanitizeFormula(undefined)).toBe("");
    expect(sanitizeFormula(456)).toBe("456");
  });
});

describe("security: validateAddress", () => {
  it("rejects non-strings and extremely short or long strings", () => {
    expect(validateAddress(null)).toBe(false);
    expect(validateAddress("a")).toBe(false); // too short
    expect(validateAddress("a".repeat(251))).toBe(false); // too long
  });

  it("rejects scripting keywords to prevent injections", () => {
    expect(validateAddress("Bandra <script>")).toBe(false);
    expect(validateAddress("javascript:alert(1)")).toBe(false);
  });

  it("accepts valid address formats", () => {
    expect(validateAddress("Bandra Kurla Complex, Mumbai")).toBe(true);
    expect(validateAddress("Delhi Metro Rail Corporation, Metro Bhawan, Fire Brigade Lane, Barakhamba Road, New Delhi")).toBe(true);
  });
});
