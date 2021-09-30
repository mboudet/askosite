from flask import (Blueprint, current_app, jsonify)


start = Blueprint('start', __name__, url_prefix='/')


@start.route('/api/config')
def config():
    # Return config here
    config = {
        "proxyPath": current_app.config.get('PROXY_PREFIX', '/'),
        "excludedEntities": current_app.config.get('EXCLUDED_ENTITIES', []),
        "excludedAttributes": current_app.config.get('EXCLUDED_ATTRIBUTES', []),
        "namespaceInternal": current_app.config.get("NAMESPACE_INTERNAL"),
        "namespaceData": current_app.config.get("NAMESPACE_DATA")
    }

    json = {
        "error": False,
        "errorMessage": '',
        "config": config
    }

    return jsonify(json)
