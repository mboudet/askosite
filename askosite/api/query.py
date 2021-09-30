from flask import (Blueprint, current_app, request)

import requests

query = Blueprint('query', __name__, url_prefix='/')


@query.route('/api/startpoints')
def startpoints():

    full_url = current_app.config.get('ASKOMICS_URL') + "/api/query/startpoints"
    resp = requests.get(full_url)
    return resp.content, resp.status_code, resp.headers.items()


@query.route('/api/abstraction')
def abstraction():

    full_url = current_app.config.get('ASKOMICS_URL') + "/api/query/abstraction"
    resp = requests.get(full_url)
    return resp.content, resp.status_code, resp.headers.items()


@query.route('/api/query', methods=['POST'])
def send_query():

    full_url = current_app.config.get('ASKOMICS_URL') + "/api/query/preview"
    resp = requests.post(full_url, json=request.get_json())
    return resp.content, resp.status_code, resp.headers.items()


@query.route('/api/data/<string:uri>', methods=['GET'])
def data(uri):

    full_url = current_app.config.get('ASKOMICS_URL') + "/api/data/{}".format(uri)
    resp = requests.get(full_url)
    return resp.content, resp.status_code, resp.headers.items()
