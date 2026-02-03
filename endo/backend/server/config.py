"""
TODO: Write docstring here
"""
# -- Import standard modules --
import os

# -- Import database --
import sqlalchemy.pool

# -- Import settings package --
import settings.loader

# Service name
SERVICE_NAME = 'server'

# Load env for server
env = settings.loader.load_env(SERVICE_NAME)



class Config:
    """Base configuration."""
    
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///default.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY= os.getenv('JWT_SECRET_KEY', 'default_secret_key')
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

class DevelopmentConfig(Config):
    """Development configuration."""
    
    DEBUG = True
    ENV = 'development'

class ProductionConfig(Config):
    """Production configuration."""
    

    DEBUG = False
    ENV = 'production'

class TestingConfig(Config):
    """Testing configuration."""
    
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"check_same_thread": False},
        "poolclass": sqlalchemy.pool.StaticPool,
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
configs = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}


# Set current configuration based on environment
current = configs.get(env, DevelopmentConfig)()