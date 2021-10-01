import React, { Component } from 'react'
import axios from 'axios'
import { Button, Form, FormGroup, Label, Input, Alert, Row, Col, CustomInput } from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import update from 'react-addons-update'
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import Utils from './utils'

class Data extends Component {
  constructor (props) {
    super(props)
    this.state = {
      config: this.props.location.state.config,
      data: this.props.location.state.data,
      uri: this.props.location.state.uri,
      error: false,
      errorMessage: '',
    }
    this.utils = new Utils()
    this.handleData = this.handleData.bind(this)
  }

  handleData (event) {
    // request api to get a preview of file
    let target = event.target.id
    let requestUrl = '/api/data/' + target
    axios.get(requestUrl, {baseURL: this.state.config.proxyPath, cancelToken: new axios.CancelToken((c) => { this.cancelRequest = c }) })
      .then(response => {
        console.log(requestUrl, response.data)
        // set state of resultsPreview
        this.setState({
          redirectUri: true,
          data: response.data.data,
          uri: target
        })
      })
      .catch(error => {
        console.log(error, error.response.data.errorMessage)
        this.setState({
          error: true,
          errorMessage: error.response.data.errorMessage,
          status: error.response.status,
          waiting: false
        })
      })
  }

  render () {
    let uri = this.state.uri

    let columns = [{
      dataField: 'predicate',
      text: 'Property',
      sort: true,
      formatter: (cell, row) => {
        if (this.utils.isUrl(cell)) {
          return this.utils.splitUrl(cell)
        }
        return cell
      }
    },{
      dataField: 'object',
      text: 'Value',
      sort: true,
      formatter: (cell, row) => {
        if (this.utils.isUrl(cell)) {
          if (cell.startsWith(this.state.config.namespaceInternal)){
            return this.utils.getUri(cell, this.state.config.namespaceInternal)
          } else if (cell.startsWith(this.state.config.namespaceData)) {
            return <Button id={this.utils.getUri(cell, this.state.config.namespaceData)} color="link" onClick={this.handleData}>{this.utils.getUri(cell, this.state.config.namespaceData)}</Button>
          } else {
            return <a href={cell} target="_blank" rel="noreferrer">{this.utils.splitUrl(cell)}</a>
          }
        }
        return cell
      }
    }]


    return (
      <div className="container">
        <h2>Information about entity {uri}</h2>
        <br />
        <div className="asko-table-height-div">
          <BootstrapTable
            classes="asko-table"
            wrapperClasses="asko-table-wrapper"
            tabIndexCell
            bootstrap4
            keyField='id'
            data={this.state.data}
            columns={columns}
            pagination={paginationFactory()}
            noDataIndication={'No public results for this URI. You may not have access to any graph including it.'}
          />
        </div>
      </div>
    )
  }
}

Data.propTypes = {
  location: PropTypes.object,
}

export default withRouter(Data)
