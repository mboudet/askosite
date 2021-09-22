import os

from flask import Flask, g

from askosite.api.view import view
from askosite.api.start import start

from .middleware import PrefixMiddleware


__all__ = ('create_app', )

BLUEPRINTS = (
    view,
    start
)

CONFIG_KEYS = (
    'SECRET_KEY',
    'BASE_URL',
    'TASK_LOG_DIR',
    'DEBUG',
    'TESTING',
    'PROXY_PREFIX'
)


def create_app(config=None, app_name='askosite', blueprints=None, run_mode=None, is_worker=False):
    app = Flask(app_name,
                static_folder='static',
                template_folder="templates"
                )

    with app.app_context():

        app.is_worker = is_worker

        configs = {
            "dev": "askosite.config.DevelopmentConfig",
            "prod": "askosite.config.ProdConfig"
        }
        if run_mode:
            config_mode = run_mode
        else:
            config_mode = os.getenv('ASKOSITE_RUN_MODE', 'prod')

        if 'ASKOSITE_RUN_MODE' not in app.config:
            app.config['ASKOSITE_RUN_MODE'] = config_mode

        app.config.from_object(configs[config_mode])

        app.config.from_pyfile('../local.cfg', silent=True)
        if config:
            app.config.from_pyfile(config)

        app.config = _merge_conf_with_env_vars(app.config)

        if not app.config.get("SECRET_KEY"):
            raise Exception("Missing secret_key")

        if app.config.get("PROXY_PREFIX"):
            app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix=app.config.get("PROXY_PREFIX").rstrip("/"))

        if blueprints is None:
            blueprints = BLUEPRINTS

        blueprints_fabrics(app, blueprints)
        configure_logging(app)

        gvars(app)

    return app


def blueprints_fabrics(app, blueprints):
    """Configure blueprints in views."""

    for blueprint in blueprints:
        app.register_blueprint(blueprint)


def gvars(app):
    @app.before_request
    def gdebug():
        if app.debug:
            g.debug = True
        else:
            g.debug = False


def configure_logging(app):
    """Configure file(info) and email(error) logging."""

    if app.debug or app.testing:
        # Skip debug and test mode. Just check standard output.
        return

    import logging
    import logging.handlers

    # Set log level
    if app.config['ASKOSITE_RUN_MODE'] == 'test':
        app.logger.setLevel(logging.DEBUG)
    else:
        app.logger.setLevel(logging.INFO)

    info_log = os.path.join(app.config['LOG_FOLDER'], 'info.log')

    if not os.path.exists(app.config['LOG_FOLDER']):
        os.makedirs(app.config['LOG_FOLDER'])

    info_file_handler = logging.handlers.RotatingFileHandler(info_log, maxBytes=100000, backupCount=10)
    info_file_handler.setLevel(logging.INFO)
    info_file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]')
    )
    app.logger.addHandler(info_file_handler)


def _merge_conf_with_env_vars(config):

    for key in CONFIG_KEYS:
        envval = os.getenv(key)
        if envval is not None:
            config[key] = envval

    return config
