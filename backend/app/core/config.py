from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App
    APP_ENV: str = "dev"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # DB
    DATABASE_URL: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # MCP / external
    TAVILY_API_KEY: str | None = None
    TAVILY_MCP_URL: str | None = None

    FLUX_MCP_URL: str | None = None
    FLUX_API_KEY: str | None = None  # only if your Flux server needs it

    # pydantic-settings v2 config
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

settings = Settings()
