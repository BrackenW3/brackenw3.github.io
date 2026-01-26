// auth.js - Authentication Logic for GitHub and HashiCorp Vault

/**
 * Authenticate using a GitHub Personal Access Token (PAT).
 * This implementation verifies the token by fetching the authenticated user's profile.
 *
 * SECURITY NOTE:
 * This is a client-side implementation. The token is sent directly from the browser
 * to GitHub's API. While this avoids sending the token to an intermediate server,
 * it exposes the token to any scripts running on this page. ensure this page
 * is served over HTTPS and free of XSS vulnerabilities.
 *
 * @param {string} token - The GitHub Personal Access Token.
 * @returns {Promise<Object>} - The user profile data if successful.
 */
async function authenticateGitHub(token) {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
        throw new Error('Token cannot be empty.');
    }

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
            const errorData = await response.json().catch(() => ({}));
            const msg = errorData.message || response.statusText;

            if (response.status === 401) {
                throw new Error('Invalid token. Please check your credentials.');
            } else if (response.status === 403) {
                throw new Error('Rate limit exceeded or access forbidden.');
            }
            throw new Error(`GitHub Authentication Failed: ${msg}`);
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('GitHub Auth Error:', error);
        // Re-throw so UI can handle it
        throw error;
    }
}

/**
 * Authenticate using HashiCorp Vault.
 * This implementation verifies a Vault Token by calling the lookup-self endpoint.
 *
 * @param {string} vaultAddress - The URL of the Vault server.
 * @param {string} token - The Vault Token.
 * @returns {Promise<Object>} - The token information if successful.
 */
async function authenticateVault(vaultAddress, token) {
    if (!vaultAddress || !token) {
        throw new Error('Address and Token are required.');
    }

    try {
        // Basic URL validation
        const url = new URL(vaultAddress);
        // Clean the address to remove trailing slash
        const cleanAddress = url.origin + url.pathname.replace(/\/$/, "");
        const apiUrl = `${cleanAddress}/v1/auth/token/lookup-self`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Vault-Token': token
            }
        });

        if (!response.ok) {
            let errorMessage = `Vault Error (${response.status})`;
            try {
                const errorData = await response.json();
                if (errorData.errors) {
                    errorMessage = errorData.errors.join(', ');
                }
            } catch (e) {
                // Ignore JSON parse error
            }

            if (response.status === 403) {
                errorMessage = 'Invalid token or insufficient permissions.';
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Vault Auth Error:', error);
        if (error instanceof TypeError) {
             throw new Error('Network error. Check Vault address and CORS settings.');
        }
        throw error;
    }
}
