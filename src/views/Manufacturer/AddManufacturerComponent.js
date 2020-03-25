import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button,FormText ,FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import ManufacturerService from "../../api/ManufacturerService";
import RealmService from "../../api/RealmService";
import AuthenticationService from '../Common/AuthenticationService.js';

const initialValues = {
  realmId: [],
  manufacturer: ""
}

const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.manufaturer.realmtext')),
    manufacturer: Yup.string()
      .required(i18n.t('static.manufaturer.manufaturertext'))

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
class AddManufacturerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      manufacturer: {
        realm: {
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
    let { manufacturer } = this.state;
    if (event.target.name == "realmId") {
      manufacturer.realm.realmId = event.target.value;
    }
    if (event.target.name == "manufacturer") {
      manufacturer.label.label_en = event.target.value;
    }
    this.setState({
      manufacturer
    },
      () => { });
  };

  touchAll(setTouched, errors) {
    setTouched({
      realmId: true,
      manufacturer: true
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('manufacturerForm', (fieldName) => {
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
    RealmService.getRealmListAll()
      .then(response => {
        this.setState({
          realms: response.data.data
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
    const { realms } = this.state;
    let realmList = realms.length > 0
      && realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {item.label.label_en}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <i className="icon-note"></i><strong>{i18n.t('static.manufacturer.manufactureradd')}</strong>{' '}
              </CardHeader>
              <Formik
                initialValues={initialValues}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  console.log("Submit clicked");
                  ManufacturerService.addManufacturer(this.state.manufacturer)
                    .then(response => {
                      console.log("Response->", response);
                      if (response.data.status == "Success") {
                        this.props.history.push(`/manufacturer/listManufacturer/${response.data.message}`)
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
                      <Form onSubmit={handleSubmit} noValidate name='manufacturerForm'>
                        <CardBody>
                          <FormGroup>
                            <Label htmlFor="realmId">{i18n.t('static.manufacturer.realm')}</Label>
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText>
                              <Input
                                type="select"
                                name="realmId"
                                id="realmId"
                                bsSize="sm"
                                valid={!errors.realmId}
                                invalid={touched.realmId && !!errors.realmId}
                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                onBlur={handleBlur}
                                required
                                value={this.state.realmId}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {realmList}
                              </Input>
                            </InputGroupAddon>

                            <FormText className="red">{errors.realmId}</FormText>
                          </FormGroup>
                          <FormGroup>
                            <Label for="manufacturer">{i18n.t('static.manufacturer.manufacturer')}</Label>
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText><i className="fa fa-industry"></i></InputGroupText>
                              <Input type="text"
                                name="manufacturer"
                                id="manufacturer"
                                bsSize="sm"
                                valid={!errors.manufacturer}
                                invalid={touched.manufacturer && !!errors.manufacturer}
                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                onBlur={handleBlur}
                                required />
                            </InputGroupAddon>
                            <FormText className="red">{errors.manufacturer}</FormText>
                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>
                            <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                            <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;
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
    this.props.history.push(`/manufacturer/listManufacturer/` + "Action Canceled")
  }
}

export default AddManufacturerComponent;