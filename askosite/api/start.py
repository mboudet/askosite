from flask import (Blueprint, current_app, jsonify)


start = Blueprint('start', __name__, url_prefix='/')


@start.route('/api/config')
def config():
    # Return config here
    config = {
        "proxyPath": current_app.config.get('PROXY_PREFIX', '/'),
    }

    json = {
        "error": False,
        "errorMessage": '',
        "config": config
    }

    return jsonify(json)
