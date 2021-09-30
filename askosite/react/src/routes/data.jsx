import React, { Component } from 'react'
import axios from 'axios'
import { Button, Form, FormGroup, Label, Input, Alert, Row, Col, CustomInput } from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import cellEditFactory from 'react-bootstrap-table2-editor'
import update from 'react-addons-update'
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'

class Data extends Component {
  constructor (props) {
    super(props)
    this.state = {
      config: this.props.location.state.config,
      data: this.props.location.state.data,
      entity: this.props.location.state.entity,
      error: false,
      errorMessage: '',
    }
  }

  componentDidMount () {}

  componentWillUnmount () {
    if (!this.props.waitForStart) {
      this.cancelRequest()
    }
  }

  render () {
    let entity = this.state.entity

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
          if (cell.startsWith(this.props.config.namespaceInternal)){
            return this.utils.splitUrl(cell)
          } else {
            return <a href={cell} target="_blank" rel="noreferrer">{this.utils.splitUrl(cell)}</a>
          }
        }
        return cell
      }
    }]


    return (
      <div className="container">
        <h2>Information about entity {entity}</h2>
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
