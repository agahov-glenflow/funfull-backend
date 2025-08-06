// ./src/utils/googleCredentials.js

export function googleCredentials() {
    return {
        "type": process.env.GOOGLE_CREDENTIALS_TYPE,
        "project_id": process.env.GOOGLE_CREDENTIALS_PROJECT_ID,
        "private_key_id": process.env.GOOGLE_CREDENTIALS_PRIVATE_ID,
        "private_key": process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY,
        "client_email": process.env.GOOGLE_CREDENTIALS_CLIENT_EMAIL,
        "client_id": process.env.GOOGLE_CREDENTIALS_CLIENT_ID,
        "auth_uri": process.env.GOOGLE_CREDENTIALS_AUTH_URI,
        "token_uri": process.env.GOOGLE_CREDENTIALS_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.GOOGLE_CREDENTIALS_AUTH_CERT_URL,
        "client_x509_cert_url": process.env.GOOGLE_CREDENTIALS_CLIENT_CERT_URL,
        "universe_domain": process.env.GOOGLE_CREDENTIALS_UNIVERSE_DOMAIN
    }
}