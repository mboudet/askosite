import React, { Component } from 'react'
import axios from 'axios'
import { Alert, Button, CustomInput, Row, Col, ButtonGroup, Input, Spinner } from 'reactstrap'
import { Redirect } from 'react-router-dom'
import ErrorDiv from './error'
import update from 'react-addons-update'
import AttributeBox from './attribute'
import ResultsTable from './resultstable'
import PropTypes from 'prop-types'
import WaitingDiv from './waiting'

export default class Query extends Component {

  constructor (props) {
    super(props)
    this.state = {
      config: this.props.location.state.config,
      startpoint: this.props.location.state.startpoint,
      abstraction: [],
      graphState: {
        nodes: [],
        links: [],
        attr: []
      },
      resultsPreview: [],
      headerPreview: [],
      waiting: true,
      error: false,
      errorMessage: null,
      saveTick: false,

      // save query icons
      disableSave: false,
      saveIcon: "play",

      // Preview icons
      disablePreview: false,
      previewIcon: "table",
    }

    this.graphState = {
      nodes: [],
      links: [],
      attr: []
    }

    this.divHeight = 650

    this.cancelRequest

    this.handlePreview = this.handlePreview.bind(this)
    this.handleQuery = this.handleQuery.bind(this)
  }

  getLabel (uri) {
    return this.state.abstraction.entities.map(node => {
      if (node.uri == uri) {
        return node.label
      } else {
        return null
      }
    }).filter(label => label != null).reduce(label => label)
  }


  isFaldoEntity (entityUri) {
    return this.state.abstraction.entities.some(entity => {
      return (entity.uri == entityUri && entity.faldo)
    })
  }

  resetIcons() {
    this.setState({
      previewIcon: "table"
    })
  }

  getAttributeType (typeUri) {
    // FIXME: don't hardcode uri
    if (typeUri == 'http://www.w3.org/2001/XMLSchema#decimal') {
      return 'decimal'
    }
    if (typeUri == this.state.config.namespaceInternal + 'AskomicsCategory') {
      return 'category'
    }
    if (typeUri == 'http://www.w3.org/2001/XMLSchema#string') {
      return 'text'
    }
    if (typeUri == "http://www.w3.org/2001/XMLSchema#boolean") {
      return "boolean"
    }
    if (typeUri == "http://www.w3.org/2001/XMLSchema#date") {
      return "date"
    }
  }

  count_displayed_attributes() {
    return this.graphState.attr.map(attr => {
      return attr.visible ? 1 : 0
    }).reduce((a, b) => a + b)
  }

  setNodeAttributes (nodeUri) {
    let nodeAttributes = []
    let id = 0
    nodeAttributes.push({
      id: id,
      visible: true,
      nodeId: 0,
      humanNodeId: 0,
      uri: 'rdf:type',
      label: 'Uri',
      displayLabel: 'Uri',
      entityLabel: this.getLabel(nodeUri),
      entityDisplayLabel: this.getLabel(nodeUri),
      entityUris: [nodeUri, ],
      type: 'uri',
      faldo: false,
      filterType: 'exact',
      filterValue: '',
      optional: false,
      form: false,
      negative: false,
      linked: false,
      linkedWith: null
    })

    id += 1
    // create label attributes
    if (!this.attributeExist('rdfs:label', nodeId) && labelExist) {
      nodeAttributes.push({
        id: id,
        visible: true,
        nodeId: 0,
        humanNodeId: 0,
        uri: 'rdfs:label',
        label: 'Label',
        displayLabel: 'Label',
        entityLabel: this.getLabel(nodeUri),
        entityDisplayLabel: this.getLabel(nodeUri),
        entityUris: [nodeUri, ],
        type: 'text',
        faldo: false,
        filterType: 'exact',
        filterValue: '',
        optional: false,
        form: false,
        negative: false,
        linked: false,
        linkedWith: null
      })
    }

    id +=1
    // create other attributes
    nodeAttributes = nodeAttributes.concat(this.state.abstraction.attributes.map(attr => {
      let attributeType = this.getAttributeType(attr.type)
      if (attr.entityUri == nodeUri && !this.attributeExist(attr.uri, nodeId)) {
        let nodeAttribute = {
          id: id,
          visible: false,
          nodeId: 0,
          humanNodeId: 0,
          uri: attr.uri,
          label: attr.label,
          displayLabel: attr.displayLabel ? attr.displayLabel : attr.label,
          entityLabel: this.getLabel(nodeUri),
          entityDisplayLabel: attr.entityDisplayLabel ? attr.entityDisplayLabel : this.getLabel(nodeUri),
          entityUris: this.getEntityUris(attr.uri),
          type: attributeType,
          faldo: attr.faldo,
          optional: false,
          form: false,
          negative: false,
          linked: false,
          linkedWith: null
        }

        id += 1

        if (attributeType == 'decimal') {
          nodeAttribute.filters = [
            {
              filterValue: "",
              filterSign: "="
            }
          ]
        }

        if (attributeType == 'text') {
          nodeAttribute.filterType = 'exact'
          nodeAttribute.filterValue = ''
        }

        if (attributeType == 'category') {
          nodeAttribute.exclude = false
          nodeAttribute.filterValues = attr.categories
          nodeAttribute.filterSelectedValues = []
        }

        if (attributeType == 'boolean') {
          nodeAttribute.filterValues = ["true", "false"]
          nodeAttribute.filterSelectedValues = []
        }

        if (attributeType == 'date') {
          nodeAttribute.filters = [
            {
              filterValue: null,
              filterSign: "="
            }
          ]
        }

        return nodeAttribute
      }
    }).filter(attr => {return attr != null}))

    // add attributes to the graph state
    this.graphState.attr = this.graphState.attr.concat(nodeAttributes)
  }

  insertNode (uri) {
    /*
    Insert a new node in the graphState
    */
    let nodeId = 0
    let humanId = 0

    let node = {
      uri: uri,
      type: 'node',
      id: nodeId,
      humanId: humanId,
      specialNodeId: null,
      specialNodeGroupId: null,
      specialPreviousIds: null,
      label: this.getLabel(uri),
      selected: true,
      suggested: false
    }
    this.graphState.nodes.push(node)
    this.setNodeAttributes(uri)
    return node
  }

  updateGraphState (waiting=this.state.waiting) {
    this.setState({
      graphState: this.graphState,
      previewIcon: "table",
      resultsPreview: [],
      headerPreview: [],
      disableSave: false,
      disablePreview: false,
      saveIcon: "play",
      waiting: waiting
    })
  }

  initGraph () {
    this.insertNode(this.state.startpoint)
    this.updateGraphState()
  }

  // Attributes managment -----------------------
  toggleVisibility (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.visible = !attr.visible
        if (!attr.visible) {
          attr.optional = false
        }
      }
    })
    this.updateGraphState()
  }

  toggleExclude (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.exclude = !attr.exclude
        if (attr.exclude) {
          attr.visible = true
        }
      }
    })
    this.updateGraphState()
  }

  toggleOptional (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.optional = !attr.optional
        if (attr.optional) {
          attr.visible = true
        }
      }
    })
    this.updateGraphState()
  }

  toggleFormAttribute (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.form = !attr.form
      }
    })
    this.updateGraphState()
  }

  handleNegative (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.negative = event.target.value == '=' ? false : true
      }
    })
    this.updateGraphState()
  }

  handleFilterType (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.filterType = event.target.value
      }
    })
    this.updateGraphState()
  }

  handleFilterValue (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.filterValue = event.target.value
      }
    })
    this.updateGraphState()
  }

  handleFilterCategory (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.filterSelectedValues = [...event.target.selectedOptions].map(o => o.value)
      }
    })
    this.updateGraphState()
  }

  handleFilterNumericSign (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.filters.map((filter, index) => {
          if (index == event.target.dataset.index) {
            filter.filterSign = event.target.value
          }
        })
      }
    })
    this.updateGraphState()
  }

  toggleAddNumFilter (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.filters.push({
          filterValue: "",
          filterSign: "="
        })
      }
    })
    this.updateGraphState()
  }

  handleFilterNumericValue (event) {
    if (!isNaN(event.target.value)) {
      this.graphState.attr.map(attr => {
        if (attr.id == event.target.id) {
          attr.filters.map((filter, index) => {
            if (index == event.target.dataset.index) {
              filter.filterValue = event.target.value
            }
          })
        }
      })
      this.updateGraphState()
    }
  }

  handleDateFilter (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.filters.map((filter, index) => {
          if (index == event.target.dataset.index) {
            filter.filterSign = event.target.value
          }
        })
      }
    })
    this.updateGraphState()
  }

  toggleAddDateFilter (event) {
    this.graphState.attr.map(attr => {
      if (attr.id == event.target.id) {
        attr.filters.push({
          filterValue: null,
          filterSign: "="
        })
      }
    })
    this.updateGraphState()
  }

  // This is a pain, but JS will auto convert time to UTC
  // And datepicker use the local timezone
  // So without this, the day sent will be wrong
  fixTimezoneOffset (date){
    if(!date){return null};
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  }

  handleFilterDateValue (event) {
    if (!isNaN(event.target.value)) {
      this.graphState.attr.map(attr => {
        if (attr.id == event.target.id) {
          attr.filters.map((filter, index) => {
            if (index == event.target.dataset.index) {
              filter.filterValue = this.fixTimezoneOffset(event.target.value)
            }
          })
        }
      })
      this.updateGraphState()
    }
  }

  // Preview results and Launch query buttons -------

  handlePreview (event) {
    let requestUrl = '/api/query/preview'
    let data = {
      graphState: this.graphState
    }
    this.setState({
      disablePreview: true,
      previewIcon: "spinner"
    })

    // display an error message if user don't display attribute to avoid the virtuoso SPARQL error
    if (this.count_displayed_attributes() == 0) {
      this.setState({
        error: true,
        errorMessage: ["No attribute are displayed. Use eye icon to display at least one attribute", ],
        disablePreview: false,
        previewIcon: "times text-error"
      })
      return
    }

    axios.post(requestUrl, data, { baseURL: this.state.config.askomicsPath, cancelToken: new axios.CancelToken((c) => { this.cancelRequest = c }) })
      .then(response => {
        this.setState({
          resultsPreview: response.data.resultsPreview,
          headerPreview: response.data.headerPreview,
          waiting: false,
          error: false,
          previewIcon: "check text-success"
        })
      })
      .catch(error => {
        console.log(error, error.response.data.errorMessage)
        this.setState({
          error: true,
          errorMessage: error.response.data.errorMessage,
          status: error.response.status,
          disablePreview: false,
          previewIcon: "times text-error"
        })
      })
  }

  // ------------------------------------------------

  componentDidMount () {
    if (!this.props.waitForStart) {
      let requestUrl = '/api/query/abstraction'
      axios.get(requestUrl, { baseURL: this.state.config.askomicsPath, cancelToken: new axios.CancelToken((c) => { this.cancelRequest = c }) })
        .then(response => {
          this.setState({
            waiting: false,
            abstraction: response.data.abstraction,
          })
        })
        .catch(error => {
          this.setState({
            error: true,
            errorMessage: error.response.data.errorMessage,
            status: error.response.status
          })
        }).then(response => {
          this.initGraph()
          this.setState({ waiting: false })
        })
    }
  }

  componentWillUnmount () {
    if (!this.props.waitForStart) {
      this.cancelRequest()
    }
  }

  render () {
    // login page redirection
    let redirectLogin
    if (this.state.status == 401) {
      redirectLogin = <Redirect to="/login" />
    }

    // error div
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

    let visualizationDiv
    let uriLabelBoxes
    let AttributeBoxes
    let previewButton
    let faldoButton
    let launchQueryButton
    let removeButton
    let graphFilters

    if (!this.state.waiting) {
      // attribute boxes (right view) only for node
      if (this.currentSelected) {
        AttributeBoxes = this.state.graphState.attr.map(attribute => {
          if (attribute.nodeId == this.currentSelected.id && this.currentSelected.type == "node") {
            return (
              <AttributeBox
                attribute={attribute}
                graph={this.state.graphState}
                handleChangeLink={p => this.handleChangeLink(p)}
                toggleVisibility={p => this.toggleVisibility(p)}
                toggleExclude={p => this.toggleExclude(p)}
                handleNegative={p => this.handleNegative(p)}
                toggleOptional={p => this.toggleOptional(p)}
                toggleFormAttribute={p => this.toggleFormAttribute(p)}
                handleFilterType={p => this.handleFilterType(p)}
                handleFilterValue={p => this.handleFilterValue(p)}
                handleFilterCategory={p => this.handleFilterCategory(p)}
                handleFilterNumericSign={p => this.handleFilterNumericSign(p)}
                handleFilterNumericValue={p => this.handleFilterNumericValue(p)}
                toggleLinkAttribute={p => this.toggleLinkAttribute(p)}
                toggleAddNumFilter={p => this.toggleAddNumFilter(p)}
                toggleAddDateFilter={p => this.toggleAddDateFilter(p)}
                handleFilterDateValue={p => this.handleFilterDateValue(p)}
                handleDateFilter={p => this.handleDateFilter(p)}
                config={this.state.config}
              />
            )
          }
        })
        // Link view (rightview)
      }
      // buttons
      let previewIcon = <i className={"fas fa-" + this.state.previewIcon}></i>
      if (this.state.previewIcon == "spinner") {
        previewIcon = <Spinner size="sm" color="light" />
      }
      previewButton = <Button onClick={this.handlePreview} color="secondary" disabled={this.state.disablePreview}>{previewIcon} Run & preview</Button>

    }

    // preview
    let resultsTable
    if (this.state.headerPreview.length > 0) {
      resultsTable = (
        <ResultsTable data={this.state.resultsPreview} header={this.state.headerPreview} />
      )
    }

    return (
      <div className="container">
        {redirectLogin}
        <h2>Query Builder</h2>
        <hr />
        <WaitingDiv waiting={this.state.waiting} center />
        <br />
        <Row>
          <Col xs="7">
            <div>
            </div>
          </Col>
          <Col xs="5">
            <div style={{ display: 'block', height: this.divHeight + 'px', 'overflow-y': 'auto' }}>
              {uriLabelBoxes}
              {AttributeBoxes}
            </div>
          </Col>
        </Row>
        {warningDiskSpace}
        <ButtonGroup>
          {previewButton}
        </ButtonGroup>
        <br /> <br />
        <div>
          {resultsTable}
        </div>
        <ErrorDiv status={this.state.status} error={this.state.error} errorMessage={this.state.errorMessage} customMessages={{"504": "Query time is too long, use Run & Save to get your results", "502": "Query time is too long, use Run & Save to get your results"}} />
      </div>
    )
  }
}

Query.propTypes = {
  location: PropTypes.object,
  waitForStart: PropTypes.bool
}
