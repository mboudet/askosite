from flask import (Blueprint, current_app, request)

import requests

query = Blueprint('start', __name__, url_prefix='/')


@query.route('/api/startpoints')
def startpoints():

    full_url = current_app.config.get('ASKOMICS_URL') + "/api/query/startpoints"
    abstraction = requests.get(full_url)
    return abstraction.json


@query.route('/api/abstraction')
def abstraction():

    full_url = current_app.config.get('ASKOMICS_URL') + "/api/query/abstraction"
    abstraction = requests.get(full_url)
    return abstraction.json


@query.route('/api/query', methods=['POST'])
def query():

    full_url = current_app.config.get('ASKOMICS_URL') + "/api/query/preview"
    abstraction = requests.post(full_url, json=request.get_json())
    return abstraction.json
