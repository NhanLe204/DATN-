declare const ENV_VARS: {
    PORT: string | number;
    MONGODB_URI: string | undefined;
    JWT_SECRET: string | undefined;
    NODE_ENV: string | undefined;
    TMDB_API_KEY: string | undefined;
    FE_URL: string | undefined;
    EMAIL_USER: string | undefined;
    EMAIL_PASS: string | undefined;
};
export default ENV_VARS;
