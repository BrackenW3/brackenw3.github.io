/**
 * Cloudflare Worker - Secure API Proxy
 *
 * This worker acts as a secure gateway. It verifies an Authorization header
 * (simulating a token check) before processing the request.
 *
 * In a real application, you would validate the token against a KV store
 * or an external identity provider (like Auth0 or GitHub).
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const url = new URL(request.url);

    // Endpoint: /api/secure-data
    if (url.pathname === "/api/secure-data") {
      return await handleSecureData(request, env);
    }

    // Default Response
    return new Response("Welcome to the Secure Worker API", { status: 200 });
  },
};

async function handleSecureData(request, env) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
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
            "Access-Control-Allow-Origin": "*"
          },
        });
    } else {
        // Token is invalid or expired
        return new Response(JSON.stringify({ error: "Forbidden: Invalid GitHub Token" }), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
        });
    }
  } catch (error) {
      return new Response(JSON.stringify({ error: "Internal Server Error during verification" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
      });
  }
}
