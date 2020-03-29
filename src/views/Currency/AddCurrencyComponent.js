import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import AuthenticationService from '../Common/AuthenticationService.js';
import CurrencyService from '../../api/CurrencyService.js';
import i18n from '../../i18n';


const entityname = i18n.t('static.currency.currencyMaster');
const initialValues = {
    currencyCode: '',
    currencySymbol: '',
    label: '',
    conversionRate: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        currencyCode: Yup.string()
            .required(i18n.t('static.currency.currencycodetext')),
        currencySymbol: Yup.string()
            .required(i18n.t('static.currency.currencysymboltext')),
        label: Yup.string()
            .required(i18n.t('static.currency.currencytext')),
        conversionRate: Yup.number()
            .required(i18n.t('static.currency.conversionrateNumber')).min(0, i18n.t('static.currency.conversionrateMin'))
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


export default class AddCurrencyComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currencyCode: '',
            currencySymbol: '',
            label: {
                label_en: ''

            },
            conversionRateToUsd: ''   
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        if (event.target.name === "currencyCode") {
            this.state.currencyCode = event.target.value.toUpperCase();
        } if (event.target.name === "currencySymbol") {
            this.state.currencySymbol = event.target.value;
        } if (event.target.name === "label") {
            this.state.label.label_en = event.target.value;
        }
        else if (event.target.name === "conversionRate") {
            this.state.conversionRateToUsd = event.target.value;
        }
        let { currency } = this.state
        this.setState(
            {
                currency
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            currencyCode: true,
            currencySymbol: true,
            label: true,
            conversionRate: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('currencyForm', (fieldName) => {
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
    }

    Capitalize(str) {
        this.state.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    render() {

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.currency.currencyadd')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    CurrencyService.addCurrency(this.state)
                                        .then(response => {
                                            if (response.status == 200) {
                                                // console.log("----------after add",response.data.data);
                                                this.props.history.push(`/currency/listCurrency/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({ message: error.message });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {
                                                        case 500:
                                                        case 401:
                                                        case 404:
                                                        case 406:
                                                        case 412:
                                                            this.setState({ message: error.response.data.messageCode });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
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
                                            <Form onSubmit={handleSubmit} noValidate name='currencyForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="currencyCode">{i18n.t('static.currency.currencycode')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="currencyCode"
                                                            id="currencyCode"
                                                            bsSize="sm"
                                                            valid={!errors.currencyCode}
                                                            invalid={touched.currencyCode && !!errors.currencyCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.currencyCode}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.currencyCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="currencySymbol">{i18n.t('static.currency.currencysymbol')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-usd"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="currencySymbol"
                                                            id="currencySymbol"
                                                            bsSize="sm"
                                                            valid={!errors.currencySymbol}
                                                            invalid={touched.currencySymbol && !!errors.currencySymbol}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.currencySymbol}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.currency.currency')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-money"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.label.label_en}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="laconversionRatebel">{i18n.t('static.currency.conversionrateusd')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-exchange"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="conversionRate"
                                                            id="conversionRate"
                                                            valid={!errors.conversionRate}
                                                            invalid={touched.conversionRate && !!errors.conversionRate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            bsSize="sm"
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.conversionRate}</FormFeedback>
                                                    </FormGroup>

                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-check"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

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
        this.props.history.push(`/currency/listCurrency/` + i18n.t('static.message.cancelled', { entityname }))
    }
}