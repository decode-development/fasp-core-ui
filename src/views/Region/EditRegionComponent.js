import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText, FormText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

const entityname = i18n.t('static.region.region');

let initialValues = {
    region: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        region: Yup.string()
            .required(i18n.t('static.region.validregion'))
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

class EditRegionComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // region: this.props.location.state.region,
            region: {
                realmCountry: {
                    country: {
                        countryCode: '',
                        label: {
                            label_en: '',
                            label_fr: '',
                            label_sp: '',
                            label_pr: ''
                        }
                    },
                },
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                },

            },
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
    }
    changeMessage(message) {
        this.setState({ message: message })
    }

    dataChange(event) {
        let { region } = this.state;
        if (event.target.name == "region") {
            region.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            region.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            region
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            region: true
        }
        )
        this.validateForm(errors)
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
    Capitalize(str) {
        if (str != null && str != "") {
            let { region } = this.state;
            region.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        }
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        RegionService.getRegionById(this.props.match.params.regionId).then(response => {
            this.setState({
                region: response.data
            });

        }).catch(
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

    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', entityname)}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ region: getLabelText(this.state.region.label, this.state.lang) }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    // AuthenticationService.setupAxiosInterceptors();
                                    RegionService.updateRegion(this.state.region)
                                        .then(response => {
                                            console.log("---------->", response);
                                            if (response.status == 200) {
                                                this.props.history.push(`/region/listRegion/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        }).catch(
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
                                                        <Label htmlFor="realmCountryId">{i18n.t('static.region.country')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="realmCountryId"
                                                            id="realmCountryId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={getLabelText(this.state.region.realmCountry.country.label, this.state.lang)}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="region">{i18n.t('static.region.region')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="region"
                                                            id="region"
                                                            bsSize="sm"
                                                            valid={!errors.region}
                                                            invalid={touched.region && !!errors.region}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={getLabelText(this.state.region.label, this.state.lang)}
                                                            required />

                                                        <FormText className="red">{errors.region}</FormText>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.region.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.common.active')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="active"
                                                                value={false}
                                                                checked={this.state.region.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        {/* <Button type="reset" size="md" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
        this.props.history.push(`/region/listRegion/` + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        // AuthenticationService.setupAxiosInterceptors();
        RegionService.getRegionById(this.props.match.params.regionId).then(response => {
            this.setState({
                region: response.data
            });

        }).catch(
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
}

export default EditRegionComponent;
