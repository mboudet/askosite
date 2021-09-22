import React from 'react';
import { Badge, Button, Card, CardTitle, CardBody, CardText, Form, FormGroup, Input, Label} from 'reactstrap'
import PropTypes from 'prop-types'


export default function About() {

    return (
        <div className="container">
        <Card>
          <CardBody>
            <CardTitle tag="h3">About </CardTitle>
            <CardText tag="div">
                <hr/>
                <h4>What is Askosite?</h4>

                <p>
                    Askosite is an extension of Askomics. It aims to provide an interactible data catalog
                </p>

                <h4>Related links</h4>
                <p>
                  <a target="_newtab" rel="noopener noreferrer" href="https://www.genouest.org/">The GenOuest platform</a>
                </p>
                <p>
                  <a target="_newtab" rel="noopener noreferrer" href="https://github.com/askomics/flaskomics">Askomics github repository</a>
                </p>
                <p>
                  <a target="_newtab" rel="noopener noreferrer" href="https://github.com/mboudet/askosite">Askosite github repository</a>
                </p>
                <h4>Need help?</h4>
                <p>
                  Use <a target="_newtab" rel="noopener noreferrer" href="https://github.com/mboudet/askosite/issues">Github issues</a> to report a bug, get help or request for a new feature.
                </p>
            </CardText>
          </CardBody>
        </Card>
        </div>
    );
}
