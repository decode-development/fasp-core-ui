import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';

import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import DimensionService from '../../api/DimensionService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from "../../api/RealmService";
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { SPACE_REGEX } from '../../Constants.js';

const initialValues = {
    label: ""
}
const entityname = i18n.t('static.dimension.dimension');
const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.message.spacetext'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.dimension.dimensiontext'))
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


export default class AddDimensionComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dimension: {
                label: {
                    label_en: ''
                }
            },
            message: '',
            loading: true,
            realms: [],
            isHide: true,
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addParameter = this.addParameter.bind(this);
        this.clearParameter = this.clearParameter.bind(this);
    }

    addParameter() {
        this.setState({ isHide: false })
    }

    clearParameter() {
        // this.setState({ loading: false })
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    dataChange(event) {
        let { dimension } = this.state
        if (event.target.name === "label") {
            dimension.label.label_en = event.target.value
        }
        this.setState(
            {
                dimension
            }
        )
    };

    Capitalize(str) {
        this.state.dimension.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    touchAll(setTouched, errors) {
        setTouched({
            label: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
        // AuthenticationService.setupAxiosInterceptors();
        this.setState({ loading: false })
        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    realms: listArray, loading: false
                })

            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );


    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}

                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}

                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    console.log(this.state.dimension)
                                    DimensionService.addDimension(this.state.dimension).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/dimension/listDimension/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode, loading: false
                                            },
                                                () => {
                                                    this.hideSecondComponent();
                                                })
                                        }
                                    }
                                    )
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({
                                                        message: 'static.unkownError',
                                                        loading: false
                                                    });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {

                                                        case 401:
                                                            this.props.history.push(`/login/static.message.sessionExpired`)
                                                            break;
                                                        case 403:
                                                            this.props.history.push(`/accessDenied`)
                                                            break;
                                                        case 500:
                                                        case 404:
                                                        case 406:
                                                            this.setState({
                                                                message: error.response.data.messageCode,
                                                                loading: false
                                                            });
                                                            break;
                                                        case 412:
                                                            this.setState({
                                                                message: error.response.data.messageCode,
                                                                loading: false
                                                            });
                                                            break;
                                                        default:
                                                            this.setState({
                                                                message: 'static.unkownError',
                                                                loading: false
                                                            });
                                                            break;
                                                    }
                                                }
                                            }
                                        );
                                    setTimeout(() => {
                                        setSubmitting(false)
                                    }, 2000)
                                }
                                }

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
                                        setTouched,
                                        handleReset
                                    }) => (
                                            <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                                <CardBody>

                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            // valid={!errors.realmId && this.state.realm.id != ''}
                                                            // invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => {
                                                                handleChange(e); this.dataChange(e);
                                                            }}
                                                            onBlur={handleBlur}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.integration.integrationName')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            // valid={!errors.label && this.state.dimension.label.label_en != ''}
                                                            // invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.dimension.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.integration.integrationViewName')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="integrationViewName"
                                                            id="integrationViewName"
                                                            bsSize="sm"
                                                            // valid={!errors.realmId && this.state.realm.id != ''}
                                                            // invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => {
                                                                handleChange(e); this.dataChange(e);
                                                            }}
                                                            onBlur={handleBlur}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                        </Input>
                                                        <FormFeedback className="red">{errors.integrationViewName}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.integration.path')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="path"
                                                            id="path"
                                                            bsSize="sm"
                                                            // valid={!errors.label && this.state.dimension.label.label_en != ''}
                                                            // invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            // value={this.state.dimension.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.path}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.integration.fileName')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="fileName"
                                                            id="fileName"
                                                            bsSize="sm"
                                                            // valid={!errors.label && this.state.dimension.label.label_en != ''}
                                                            // invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            // value={this.state.dimension.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.fileName}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup className="pb-3">
                                                        {this.state.isHide && <Button color="info" size="md" className="float-left mr-1" type="submit" onClick={() => this.addParameter()}><i className="fa fa-plus"></i>{i18n.t('static.integration.addBodyParameter')}</Button>}
                                                        &nbsp;
                                                        <Button color="warning" size="md" className="float-left mr-1" type="submit" onClick={() => this.clearParameter()}><i className="fa fa-refresh"></i>{i18n.t('static.integration.clearBodyParameter')}</Button>
                                                    </FormGroup>

                                                    {!this.state.isHide &&
                                                        <FormGroup>
                                                            <Label htmlFor="bodyParameter">{i18n.t('static.integration.bodyParameter')}</Label>
                                                            <Input
                                                                type="select"
                                                                name="bodyParameter"
                                                                id="bodyParameter"
                                                                bsSize="sm"
                                                                // valid={!errors.realmId && this.state.realm.id != ''}
                                                                // invalid={touched.realmId && !!errors.realmId}
                                                                onChange={(e) => {
                                                                    handleChange(e); this.dataChange(e);
                                                                }}
                                                                onBlur={handleBlur}
                                                                required
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                <option value="1">{i18n.t('static.programOnboarding.programCode')}</option>
                                                                <option value="2">{i18n.t('static.pipelineProgram.programId')}</option>
                                                                <option value="3">{i18n.t('static.program.versionId')}</option>
                                                                <option value="4">{i18n.t('static.common.Date[YMDHMS]')}</option>
                                                                <option value="5">{i18n.t('static.common.Date[YMD]')}</option>
                                                            </Input>
                                                            <FormFeedback className="red">{errors.bodyParameter}</FormFeedback>
                                                        </FormGroup>
                                                    }
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>

                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;

                                                        {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                        &nbsp; */}
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )}

                            />

                        </Card>
                    </Col>
                </Row>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/dimension/listDimension/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { dimension } = this.state
        dimension.label.label_en = '';

        this.setState({
            dimension
        },
            () => { });
    }
} 