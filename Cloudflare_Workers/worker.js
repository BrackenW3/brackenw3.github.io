/**
 * Cloudflare Worker - Secure API Proxy
 *
 * This worker acts as a secure gateway. It verifies an Authorization header
 * (simulating a token check) before processing the request.
 *
 * It implements a strict CORS policy whitelisting specific origins.
 */

const ALLOWED_ORIGINS = [
  "https://willbracken.com",
  "https://brackenw3.github.io",
  "https://bracken-analytics.pages.dev"
];

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");

  // Check if origin is in whitelist or matches localhost regex
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || (origin && /^http:\/\/localhost(:\d+)?$/.test(origin));

  if (isAllowed) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin"
    };
  }

  // If not allowed, we return restrictive headers or simply "null"
  return {
    "Access-Control-Allow-Origin": "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env, ctx) {
    // Wrap entire logic in try-catch to avoid crashing the worker
    try {
      const corsHeaders = getCorsHeaders(request);

      // Handle CORS Preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: corsHeaders,
        });
      }

      const url = new URL(request.url);

      // Endpoint: /api/secure-data
      if (url.pathname === "/api/secure-data") {
        return await handleSecureData(request, env, corsHeaders);
      }

      // Default Response
      return new Response("Welcome to the Secure Worker API", {
        status: 200,
        headers: corsHeaders
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};

async function handleSecureData(request, env, corsHeaders) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  }

  const token = authHeader.split(" ")[1];

  // REAL VERIFICATION: Validate against GitHub API
  try {
    const userAgent = 'Cloudflare-Worker-Auth-Check';
    const response = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${token}`,
            'User-Agent': userAgent,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (response.ok) {
        // Token is valid
        const userData = await response.json();

        return new Response(JSON.stringify({
          message: "Access Granted",
          user: userData.login,
          data: {
            id: 123,
            secret_info: "The treasure is buried under the palm tree.",
            timestamp: new Date().toISOString()
          }
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          },
        });
    } else {
        // Token is invalid or expired
        return new Response(JSON.stringify({ error: "Forbidden: Invalid GitHub Token" }), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            },
        });
    }
  } catch (error) {
      return new Response(JSON.stringify({ error: "Internal Server Error during verification" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          },
      });
  }
}
