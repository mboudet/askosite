import React, { Component } from 'react'
import axios from 'axios'
import { Link, Redirect, withRouter } from 'react-router-dom'
import {Button, Collapse, Navbar, NavbarBrand, Nav, NavItem, Form, Input} from 'reactstrap'
import PropTypes from 'prop-types'

class AskositeNavigation extends Component {
  constructor (props) {
    super(props)
    this.state = {
      redirect: false
    };
  }

  render () {
    let links

    links = (
          <>
          <NavItem><Link className="nav-link" to="/"><i className="fas fa-home"></i> Home</Link></NavItem>
          <NavItem><Link className="nav-link" to="/about"><i className="fas fa-info"></i> About</Link></NavItem>
          </>
    )

    return (
      <div>
        <Navbar color="dark" dark expand="md">
          <div className="container">
            <NavbarBrand href="/"> Askosite</NavbarBrand>
            <Collapse navbar>
              <Nav className="mr-auto" navbar>
                {links}
              </Nav>
            </Collapse>
          </div>
        </Navbar>
        <br />
      </div>
    )
  }
}

AskositeNavigation.propTypes = {
  config: PropTypes.object,
  history: PropTypes.object
}

export default withRouter(AskositeNavigation)
