class BaseConfig(object):
    DEBUG = False
    TESTING = False

    ASKOSITE_VERSION = "1.0.0"

    # No trailing /
    BASE_URL = "localhost"
    LOG_FOLDER = "/var/log/askosite/"


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    TESTING = True


class ProdConfig(BaseConfig):
    DEBUG = False
    TESTING = False
