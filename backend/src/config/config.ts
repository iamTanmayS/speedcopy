import dotenv from "dotenv"

dotenv.config()

function getEnv(key: string): string {
    const value = process.env[key];


    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
}


export const env = {
    database_url: getEnv("DATABASE_URL"),
    jwt_secret: getEnv("JWT_SECRET"),
    jwt_refresh_secret: getEnv("JWT_REFRESH_SECRET"),
    google_web_client_id: getEnv("WEB_CLIENT_ID"),
    google_android_client_id: getEnv("ANDROID_CLIENT_ID"),
    stripe_client_secret: getEnv("STRIPE_CLIENT_SECRET"),
    brevo_api_key: process.env.BREVO_API_KEY || "",
    brevo_sender_email: process.env.BREVO_SENDER_EMAIL || "",
}