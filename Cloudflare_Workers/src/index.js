export default {
  async fetch(request, env) {
    // 1. CORS Headers (Allows your frontend to talk to this backend)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://willbracken.com", // Strict security
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle Preflight requests (Browser checking permissions)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Parse the URL Parameters
    const url = new URL(request.url);
    const params = url.searchParams;

    // Get 'repo' and 'path' from the URL, or use defaults
    const repoOwner = "BrackenW3";
    const repoName = params.get("repo") || "VSCode_Folders"; // Default repo
    const filePath = params.get("path");

    // Guardrail: Fail if no path provided
    if (!filePath) {
      return new Response("Error: Missing '?path=' parameter.", { status: 400, headers: corsHeaders });
    }

    // 3. Construct the GitHub API URL
    const ghUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    try {
      const response = await fetch(ghUrl, {
        headers: {
          "User-Agent": "Cloudflare-Worker",
          // ensure 'CF_GH_PAT' matches the variable name in Cloudflare Settings
          "Authorization": `Bearer ${env.CF_GH_PAT}`, 
          "Accept": "application/vnd.github.raw+json"
        }
      });

      if (!response.ok) {
        // Pass the actual GitHub error back so you can see it
        const errText = await response.text();
        return new Response(`GitHub Error ${response.status}: ${errText}`, { status: response.status, headers: corsHeaders });
      }

      // 4. Return the content (Auto-detecting JSON or Text)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return Response.json(data, { headers: corsHeaders });
      } else {
        const text = await response.text();
        return new Response(text, { headers: corsHeaders });
      }

    } catch (e) {
      return new Response(`Worker Exception: ${e.message}`, { status: 500, headers: corsHeaders });
    }
  }
};
