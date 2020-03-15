import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import RegionService from "../../api/RegionService";
import RealmCountryService from "../../api/RealmCountryService.js";
import AuthenticationService from '../common/AuthenticationService.js';

const initialValues = {
  realmCountryId: [],
  region: ""
}

const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required('Please select Country'),
    region: Yup.string()
      .required('Please enter Region')
  })
}

const validate = (getValidationSchema) => {
  return (values) => {
    const validationSchema = getValidationSchema(values)
    try {
      validationSchema.validateSync(values, { abortEarly: false })
      return {}
    } catch (error) {
      return getErrorsFromValidationError(error)
    }
  }
}

const getErrorsFromValidationError = (validationError) => {
  const FIRST_ERROR = 0
  return validationError.inner.reduce((errors, error) => {
    return {
      ...errors,
      [error.path]: error.errors[FIRST_ERROR],
    }
  }, {})
}
class AddRegionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realmCountries: [],
      region: {
        realmCountry: {
        },
        label: {
        }
      },
      message: ''
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
  }

  dataChange(event) {
    let { region } = this.state;
    if (event.target.name == "realmCountryId") {
      region.realmCountry.realmCountryId = event.target.value;
    }
    if (event.target.name == "region") {
      region.label.label_en = event.target.value;
    }
    this.setState({
      region
    },
      () => { });
  };

  touchAll(setTouched, errors) {
    setTouched({
      realmId: true,
      region: true
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('regionForm', (fieldName) => {
      return Boolean(errors[fieldName])
    })
  }
  findFirstError(formName, hasError) {
    const form = document.forms[formName]
    for (let i = 0; i < form.length; i++) {
      if (hasError(form[i].name)) {
        form[i].focus()
        break
      }
    }
  }

  componentDidMount() {
    AuthenticationService.setupAxiosInterceptors();
    RealmCountryService.getRealmCountryListAll()
      .then(response => {
        this.setState({
          realmCountries: response.data.data
        })
      }).catch(
        error => {
          switch (error.message) {
            case "Network Error":
              this.setState({
                message: error.message
              })
              break
            default:
              this.setState({
                message: error.response.data.message
              })
              break
          }
        }
      );
  }

  render() {
    const { realmCountries } = this.state;
    let realmCountryList = realmCountries.length > 0
      && realmCountries.map((item, i) => {
        return (
          <option key={i} value={item.realmCountryId}>
            {item.country.label.label_en}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <i className="icon-note"></i><strong>Add Region</strong>{' '}
              </CardHeader>
              <Formik
                initialValues={initialValues}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  console.log("Submit clicked");
                  RegionService.addRegion(this.state.region)
                    .then(response => {
                      console.log("Response->",response);
                      if (response.data.status == "Success") {
                        this.props.history.push(`/region/listRegion/${response.data.message}`)
                      } else {
                        this.setState({
                          message: response.data.message
                        })
                      }
                    })
                    .catch(
                      error => {
                        switch (error.message) {
                          case "Network Error":
                            this.setState({
                              message: error.message
                            })
                            break
                          default:
                            this.setState({
                              message: error.response.data.message
                            })
                            break
                        }
                      }
                    );
                }}
                render={
                  ({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    isValid,
                    setTouched
                  }) => (
                      <Form onSubmit={handleSubmit} noValidate name='regionForm'>
                        <CardBody>
                          <FormGroup>
                            <Label htmlFor="realmCountryId">Country</Label>
                            <Input
                              type="select"
                              name="realmCountryId"
                              id="realmCountryId"
                              bsSize="lg"
                              valid={!errors.realmCountryId}
                              invalid={touched.realmCountryId && !!errors.realmCountryId}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                              onBlur={handleBlur}
                              required
                              value={this.state.realmCountryId}
                            >
                              <option value="0">Please select</option>
                              {realmCountryList}
                            </Input>
                            <FormFeedback>{errors.realmCountryId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label for="region">Region</Label>
                            <Input type="text"
                              name="region"
                              id="region"
                              valid={!errors.region}
                              invalid={touched.region && !!errors.region}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                              onBlur={handleBlur}
                              required />
                            <FormFeedback>{errors.region}</FormFeedback>
                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>
                            <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>Submit</Button>
                            <Button type="reset" color="danger" className="mr-1" onClick={this.cancelClicked}>Cancel</Button>
                          </FormGroup>
                        </CardFooter>
                      </Form>

                    )} />

            </Card>
          </Col>
        </Row>
      </div>
    );
  }
  cancelClicked() {
    this.props.history.push(`/region/listRegion/` + "Action Canceled")
  }
}

export default AddRegionComponent;
