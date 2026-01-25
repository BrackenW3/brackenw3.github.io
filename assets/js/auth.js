// auth.js - Authentication Logic for GitHub and HashiCorp Vault

/**
 * Authenticate using a GitHub Personal Access Token (PAT).
 * This implementation verifies the token by fetching the authenticated user's profile.
 *
 * Instructions for adjustment:
 * - If you want to trigger a GitHub Action instead of just verifying identity,
 *   you can change the apiUrl to a repository dispatch endpoint:
 *   `https://api.github.com/repos/{owner}/{repo}/dispatches`
 *   and use POST method with a body like `{"event_type": "login_attempt"}`.
 *
 * @param {string} token - The GitHub Personal Access Token.
 * @returns {Promise<Object>} - The user profile data if successful.
 */
async function authenticateGitHub(token) {
    // GitHub API endpoint for the authenticated user
    const apiUrl = 'https://api.github.com/user';

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'GitHub authentication failed');
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('GitHub Auth Error:', error);
        throw error;
    }
}

/**
 * Authenticate using HashiCorp Vault.
 * This implementation verifies a Vault Token by calling the lookup-self endpoint.
 *
 * Instructions for adjustment:
 * - If using a specific auth method (like userpass or github), you would need to
 *   call `/v1/auth/{method}/login` instead of just verifying a token.
 *
 * @param {string} vaultAddress - The URL of the Vault server (e.g., https://vault.example.com).
 * @param {string} token - The Vault Token.
 * @returns {Promise<Object>} - The token information if successful.
 */
async function authenticateVault(vaultAddress, token) {
    // Clean the address to remove trailing slash
    const cleanAddress = vaultAddress.replace(/\/$/, "");
    const apiUrl = `${cleanAddress}/v1/auth/token/lookup-self`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Vault-Token': token
            }
        });

        if (!response.ok) {
            // Try to parse error message if possible
            let errorMessage = 'Vault authentication failed';
            try {
                const errorData = await response.json();
                if (errorData.errors) {
                    errorMessage = errorData.errors.join(', ');
                }
            } catch (e) {
                // Ignore JSON parse error on error response
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Vault Auth Error:', error);
        throw error;
    }
}
