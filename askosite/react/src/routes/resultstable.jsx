import React, { Component } from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import axios from 'axios'
import { Redirect } from 'react-router-dom'
import WaitingDiv from './waiting'
import { Badge, Button } from 'reactstrap'
import PropTypes from 'prop-types'
import Utils from './utils'
import update from 'immutability-helper';

export default class ResultsTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
        filter_columns: {},
        uri: "",
        data: {}
    }
    this.utils = new Utils()
    this.custom_compare = this.custom_compare.bind(this)
  }

  custom_compare(a, b, column_name){
    let result, num_a, num_b;
    if (typeof b === 'string') {
      if (this.state.filter_columns[column_name] === true){
        num_a = Number(a)
        num_b = Number(b)
        if (Number.isNaN(num_a) || Number.isNaN(num_b)){
          this.setState({
            filter_columns: update(this.state.filter_columns, {[column_name]: {$set: false}})
          })
          result = b.localeCompare(a);
        } else {
          result = num_a > num_b ? -1 : ((num_a < num_b) ? 1 : 0);
        }
      } else {
        result = b.localeCompare(a);
      }
    } else {
      result = a > b ? -1 : ((a < b) ? 1 : 0);
    }
    return result;
  }

  componentDidMount () {
    let filter_columns = {}
    this.props.header.map((colName, index) => {
      filter_columns[colName] = true;
    })
    this.setState({
      filter_columns: filter_columns
    })
  }

  render () {

    let columns = this.props.header.map((colName, index) => {
      return ({
        dataField: colName,
        text: colName,
        sort: true,
        index: index,
        formatter: (cell, row) => {
          if (this.utils.isUrl(cell)) {
            if (cell.startsWith(this.props.config.namespaceData)){
                return <a href={"/data/" + this.utils.getUri(cell, this.props.config.namespaceData)} target="_blank">{this.utils.getUri(cell, this.props.config.namespaceData)}</a>
            } else {
                return <a href={cell} target="_blank" rel="noreferrer">{this.utils.splitUrl(cell)}</a>
            }
          }
          return cell
        },
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
          if (order === 'asc') {
            return this.custom_compare(a,b, dataField);
          }
          return this.custom_compare(b,a, dataField); // desc
        }
      })
    })

    return (
      <div>
        <h2>{this.props.data.length} result(s) found:</h2>
        <br/>
        <div className="asko-table-height-div">
          <BootstrapTable
            classes="asko-table"
            wrapperClasses="asko-table-wrapper"
            tabIndexCell
            bootstrap4
            keyField='id'
            data={this.props.data}
            columns={columns}
            pagination={paginationFactory()}
            noDataIndication={'No results'}
          />
        </div>
      </div>
    )
  }
}

ResultsTable.propTypes = {
  header: PropTypes.object,
  data: PropTypes.object,
  config: PropTypes.object
}
