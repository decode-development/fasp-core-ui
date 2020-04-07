import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ForecastingUnitService from '../../api/ForecastingUnitService.js'
import RealmService from "../../api/RealmService";
import ProductService from '../../api/ProductService';
import TracerCategoryService from '../../api/TracerCategoryService';
import { stringify } from 'querystring';

const initialValues = {
    realmId: [],
    productCategoryId: [],
    tracerCategoryId: [],
    label: ''
}
const entityname = i18n.t('static.forecastingunit.forecastingunit');
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
            tracerCategoryId: Yup.string()
            .required(i18n.t('static.tracercategory.tracercategoryText')),
            productCategoryId: Yup.string()
            .required(i18n.t('static.productcategory.productcategorytext')),
        label: Yup.string()
            .required(i18n.t('static.forecastingunit.forecastingunittext'))
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


export default class AddForecastingUnitComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            productcategories:[],
            tracerCategories:[],
            forecastingUnit:
            {
                active: '',
                realm: {
                },
                label: {
                    label_en: '',
                    labelId: 0,
                },genericLabel: {
                    label_en: '',
                    labelId: 0,
                },
                productCategory:{},
                tracerCategory:{}
            }
        }

        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);

    }

    dataChange(event) {
        let { forecastingUnit } = this.state
        if (event.target.name === "label") {
            forecastingUnit.label.label_en = event.target.value
        }
        if (event.target.name == "realmId") {
            forecastingUnit.realm.realmId = event.target.value;
        }
        if (event.target.name == "tracerCategoryId") {
            forecastingUnit.tracerCategory.tracerCategoryId = event.target.value;
        }
        if (event.target.name == "productCategoryId") {
            forecastingUnit.productCategory.productCategoryId = event.target.value;
        }
        if (event.target.name == "genericLabel") {
            forecastingUnit.genericLabel.label_en = event.target.value;
        }

        this.setState(
            {
                forecastingUnit
            }, () => {
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            'label': true,
            productCategoryId:true,
            tracerCategoryId:true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('forecastingUnit', (fieldName) => {
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
                    realms: response.data
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
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
            TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                this.setState({
                    tracerCategories: response.data
                })
            }).catch(
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
            ProductService.getProductCategoryList()
            .then(response => {
                this.setState({
                    productcategories: response.data
                })
            }).catch(
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
    }

    Capitalize(str) {
        let { forecastingUnit } = this.state
        forecastingUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
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
            const { tracerCategories } = this.state;
            let tracerCategoryList = tracerCategories.length > 0
                && tracerCategories.map((item, i) => {
                    return (
                        <option key={i} value={item.tracerCategoryId}>
                            {item.label.label_en}
                        </option>
                    )
                }, this);
                const { productcategories } = this.state;
                let productCategoryList = productcategories.length > 0
                    && productcategories.map((item, i) => {
                        return (
                            <option key={i} value={item.productCategoryId}>
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
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log(stringify(this.state.forecastingUnit))
                                    ForecastingUnitService.addForecastingUnit(this.state.forecastingUnit)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/forecastingUnit/listForecastingUnit/` + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form onSubmit={handleSubmit} noValidate name='forecastingUnit'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}</Label>
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
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="tracerCategoryId">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                                        <Input
                                                            type="select"
                                                            name="tracerCategoryId"
                                                            id="tracerCategoryId"
                                                            bsSize="sm"
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.realmId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {tracerCategoryList }
                                                        </Input>
                                                        <FormFeedback className="red">{errors.tracerCategoryId}</FormFeedback>
                                                    </FormGroup>    
                                                    <FormGroup>
                                                        <Label htmlFor="productCategoryId">{i18n.t('static.productcategory.productcategory')}</Label>
                                                        <Input
                                                            type="select"
                                                            name="productCategoryId"
                                                            id="productCategoryId"
                                                            bsSize="sm"
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.realmId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {productCategoryList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.productCategoryId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.forecastingunit.forecastingunit')}</Label> <Input type="text"
                                                                name="label"
                                                                id="label"
                                                                bsSize="sm"
                                                                valid={!errors.label}
                                                                invalid={touched.label && !!errors.label}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                                onBlur={handleBlur}
                                                                value={this.state.forecastingUnit.label.label_en}
                                                                required />
                                                         <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="genericLabel">{i18n.t('static.product.productgenericname')}</Label>
                                                            <Input type="text"
                                                                name="genericLabel"
                                                                id="genericLabel"
                                                                bsSize="sm"
                                                                valid={!errors.genericLabel}
                                                                invalid={touched.genericLabel && !!errors.genericLabel}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required />
                                                        <FormFeedback className="red">{errors.genericLabel}</FormFeedback>
                                                        
                                                    </FormGroup>
                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>

                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />

                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/forecastingUnit/listForecastingUnit/` + i18n.t('static.message.cancelled', { entityname }))
    }
}