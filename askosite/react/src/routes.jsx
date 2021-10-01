import React, { Component, createContext } from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import axios from 'axios'

import About from './routes/about'
import Home from './routes/home'
import Query from './routes/query'
import Data from './routes/data'
import AskositeNavigation from './navigation'

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'

export default class Routes extends Component {

  constructor (props) {
    super(props)
    this.state = {
      error: false,
      errorMessage: null,
      waiting: true,
      config: {
        proxyPath: document.getElementById('proxy_path').getAttribute('proxy_path'),
        excludedEntities: [],
        excludedAttributes: [],
        excludedAttributeTypes: [],
        perPage: 30,
        namespaceInternal: 'http://askomics.org/internal/',
        namespaceData: 'http://askomics.org/data/'
      }
    }
    this.cancelRequest
  }


  componentDidMount () {

    let requestUrl = '/api/config'
    axios.get(requestUrl, {baseURL: this.state.config.proxyPath , cancelToken: new axios.CancelToken((c) => { this.cancelRequest = c }) })
      .then(response => {
        this.setState({
          error: false,
          errorMessage: null,
          config: response.data.config,
          waiting: false
        })
      })
      .catch(error => {
        this.setState({
          error: true,
          errorMessage: error.response.data.errorMessage,
          status: error.response.status,
          waiting: false
        })
      })
  }

  render () {

    return (
      <Router basename={this.state.config.proxyPath}>
        <div>
          <AskositeNavigation config={this.state.config} />
          <Switch>
            <Route path="/" exact component={() => (<Home waitForStart={this.state.waiting} config={this.state.config} />)} />
            <Route path="/about" exact component={() => (<About config={this.state.config} />)} />
            <Route path="/query" exact component={Query} />
            <Route path="/data/:uri" exact component={() => (<Data config={this.state.config} waitForStart={this.state.waiting} />)} />
          </Switch>
          <br />
          <br />
        </div>
      </Router>
    )
  }
}
