import React, { Component, lazy, Suspense } from 'react'
import { Badge, Button, Card, CardTitle, CardBody, CardText, Form, FormGroup, Input, Label, Row, Col, ButtonGroup, CustomInput, Alert, InputGroup} from 'reactstrap'
import { Redirect, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import WaitingDiv from './waiting'
import ErrorDiv from './error'
import axios from 'axios'

export default class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      waiting: true,
      error: false,
      errorMessage: null,
      selected: null,
      startpoints: [],
      frontMessage: "",
      startSession: false,
      redirectFormBuilder: false
    }
    this.cancelRequest
    this.handleStart = this.handleStart.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
  }

  handleStart (event) {
    this.setState({
      startSession: true
    })
  }

  handleClick (event) {
    this.setState({
      selected: event.target.id
    })
  }

  handleFilter (event) {
    this.state.startpoints.map((startpoint, i) => {
      let re = new RegExp(event.target.value, 'g')
      let res = startpoint.entity_label.toLowerCase().match(re)
      if (res == null) {
        // don't match, hide
        startpoint.hidden = true
      } else {
        // show
        startpoint.hidden = false
      }
    })
    this.forceUpdate()
  }

  disabledStartButton () {
    return !this.state.selected
  }

  componentDidMount () {

      if (!this.props.waitForStart) {
        let requestUrl = '/api/startpoints'
        axios.get(requestUrl, {baseURL: this.props.config.proxyPath, cancelToken: new axios.CancelToken((c) => { this.cancelRequest = c }) })
          .then(response => {
            var excludedEntities = this.props.config.excludedEntities
	    this.setState({
              waiting: false,
              startpoints: response.data.startpoints.reduce(function(filtered, startpoint) {
                if (! excludedEntities.includes(startpoint.entity)){
                  filtered.push({
                    graphs: startpoint.graphs,
                    entity: startpoint.entity,
                    entity_label: startpoint.entity_label,
                    hidden: false,
                    selected: false
                  })
                }
                return filtered;
              }, []),
            })
          })
          .catch(error => {
            console.log(error, error.response.data.errorMessage)
            this.setState({
              waiting: false,
              error: true,
              errorMessage: error.response.data.errorMessage,
              status: error.response.status
            })
          })
      }
  }

  componentWillUnmount () {
    if (!this.props.waitForStart) {
      this.cancelRequest()
    }
  }

  render () {

    let redirectQueryBuilder
    if (this.state.startSession) {
      redirectQueryBuilder = <Redirect to={{
        pathname: '/query',
        state: {
          config: this.props.config,
          startpoint: this.state.selected
        }
      }} />
    }

    let errorDiv
    if (this.state.error) {
      errorDiv = (
        <div>
          <Alert color="danger">
            <i className="fas fa-exclamation-circle"></i> {this.state.errorMessage}
          </Alert>
        </div>
      )
    }

    let startpoints
    if (!this.state.waiting) {
      startpoints = (
        <div>
          <p>Select an entity to start a session:</p>
          <div className="startpoints-filter-div">
            <InputGroup>
              <Input placeholder="Filter entities" onChange={this.handleFilter} />
            </InputGroup>

          </div>

          <div className="startpoints-div">
            {this.state.startpoints.map(startpoint => {
              return (
              <div key={startpoint.entity} className="input-label" id={startpoint.entity_label}>
              <input className="startpoint-radio" value={startpoint.entity_label} type="radio" name="startpoints" id={startpoint.entity} onClick={this.handleClick}></input>
              <label className="startpoint-label" id={startpoint.name} htmlFor={startpoint.entity}>
              <table hidden={startpoint.hidden ? 'hidden' : '' } className="startpoint-table">
                <tr>
                  <td className="startpoint-table cell1">
                      {startpoint.entity_label}
                  </td>
                </tr>
              </table>
              </label>
              </div>
            )})}
          </div>
          <br />
          <Button disabled={this.disabledStartButton()} onClick={this.handleStart} color="secondary">Start!</Button>
        </div>
      )
    }

    let welcomeMessage = (
      <div>
      <p>Welcome to Askosite!</p>
      <p>Please select an entity on the left side to start:</p>
      </div>
    )

    let frontMessage = (
	<div><h2>Welcome to Askosite</h2>
        <hr />
        </div>
    )

    return (
      <div className="container">
        {redirectQueryBuilder}
        { frontMessage }
        <WaitingDiv waiting={this.state.waiting} center />
          <Row>
            <Col xs="5">
              {startpoints}
            </Col>
            <Col xs="7">
              {welcomeMessage}
            </Col>
          </Row>
          <br />
        <ErrorDiv status={this.state.status} error={this.state.error} errorMessage={this.state.errorMessage} />
      </div>
    )
  }
}

Home.propTypes = {
  waitForStart: PropTypes.bool,
  config: PropTypes.object,
}
