import { expect, test, describe } from "vitest";
import { applySecurityHeaders } from "../server";

describe("applySecurityHeaders", () => {
  const defaultHeaders = [
    ["x-content-type-options", "nosniff"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
    ["strict-transport-security", "max-age=63072000; includeSubDomains; preload"],
    ["permissions-policy", "camera=(), microphone=(), geolocation=()"],
    [
      "content-security-policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; worker-src 'self' blob:; img-src 'self' data: blob:; object-src 'none'; base-uri 'self'; form-action 'self'",
    ],
  ];

  test("applies default security headers to public paths", () => {
    const mockRequest = new Request("http://localhost/");
    const mockResponse = new Response("OK");

    const finalResponse = applySecurityHeaders(mockResponse, mockRequest);

    for (const [key, value] of defaultHeaders) {
      expect(finalResponse.headers.get(key)).toBe(value);
    }
    expect(finalResponse.headers.has("x-frame-options")).toBe(false);
  });

  test("applies X-Frame-Options: SAMEORIGIN to authenticated paths", () => {
    const authPaths = ["/dashboard", "/settings", "/review", "/notifications"];

    for (const path of authPaths) {
      const mockRequest = new Request(`http://localhost${path}`);
      const mockResponse = new Response("OK");

      const finalResponse = applySecurityHeaders(mockResponse, mockRequest);

      for (const [key, value] of defaultHeaders) {
        expect(finalResponse.headers.get(key)).toBe(value);
      }
      expect(finalResponse.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    }
  });

  test("applies X-Frame-Options: SAMEORIGIN to nested authenticated paths", () => {
    const mockRequest = new Request("http://localhost/dashboard/settings");
    const mockResponse = new Response("OK");

    const finalResponse = applySecurityHeaders(mockResponse, mockRequest);

    expect(finalResponse.headers.get("x-frame-options")).toBe("SAMEORIGIN");
  });

  test("preserves existing headers", () => {
    const mockRequest = new Request("http://localhost/");
    const mockResponse = new Response("OK", {
      headers: {
        "X-Custom-Header": "CustomValue",
      },
    });

    const finalResponse = applySecurityHeaders(mockResponse, mockRequest);

    expect(finalResponse.headers.get("x-custom-header")).toBe("CustomValue");
  });

  test("handles null body statuses correctly", () => {
    const mockRequest = new Request("http://localhost/");
    const mockResponse = new Response(null, { status: 204 });

    const finalResponse = applySecurityHeaders(mockResponse, mockRequest);

    expect(finalResponse.status).toBe(204);
    expect(finalResponse.body).toBeNull();
  });
});
