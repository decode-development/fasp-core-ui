import { Formik } from 'formik';
import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormFeedback, FormGroup, FormText, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import DimensionService from '../../api/DimensionService';
import UnitService from '../../api/UnitService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import '../Forms/ValidationForms/ValidationForms.css';



const initialValues = {
    unitName: "",
    unitCode: "",
    dimensionId:[]
}
const entityname = i18n.t('static.unit.unit');
const validationSchema = function (values) {
    return Yup.object().shape({

        unitName: Yup.string()
            .required(i18n.t('static.unit.unittext')),
        unitCode: Yup.string().required(i18n.t('static.unit.unitcodetext'))

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

class AddUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unit: { dimension: {
            },
            label: {

            }},
            message: '',
            dimensions:[]
        }

        // this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { unit } = this.state;
        if (event.target.name == "dimensionId") {
            unit.dimension.dimensionId = event.target.value;
        }
        if (event.target.name == "unitName") {
            unit.label.label_en = event.target.value;
        }
        if (event.target.name == "unitCode") {
            unit.unitCode = event.target.value;
        }
        this.setState({
            unit
        },
            () => { });
    };

    // Capitalize(str) {
    //     this.setState({unit: str.charAt(0).toUpperCase() + str.slice(1)});
    // }

    touchAll(setTouched, errors) {
        setTouched({
            unitName: true,
            unitCode: true,
            dimensionId: true
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
        AuthenticationService.setupAxiosInterceptors();
        DimensionService.getDimensionListAll()
        .then(response => {
            if (response.status == 200) {
                this.setState({
                    dimensions: response.data
                })
            } else {
                this.setState({ message: response.data.messageCode })
            }
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

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }



    render() {
        const { dimensions } = this.state;
        let dimensionList = dimensions.length > 0
            && dimensions.map((item, i) => {
                return (
                    <option key={i} value={item.dimensionId}>
                        {getLabelText(item.label, this.state.lang)}
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
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    UnitService.addUnit(this.state.unit).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/unit/listUnit/` + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='simpleForm'>
                                                <CardBody>
                                                <FormGroup>
                                                        <Label htmlFor="dimensionId">{i18n.t('static.dimension.dimension')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                            {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                            <Input
                                                                type="select"
                                                                bsSize="sm"
                                                                name="dimensionId"
                                                                id="dimensionId"
                                                                valid={!errors.dimensionId}
                                                                invalid={touched.dimensionId && !!errors.dimensionId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {dimensionList}
                                                            </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.dimensionId}</FormFeedback>
                                                    </FormGroup>
                                                  
                                                    <FormGroup>
                                                        <Label for="unitName">{i18n.t('static.unit.unit')}</Label>
                                                        <Input type="text"
                                                            name="unitName"
                                                            id="unitName"
                                                            bsSize="sm"
                                                            valid={!errors.unitName}
                                                            invalid={touched.unitName && !!errors.unitName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.unitName}
                                                            required />
                                                        <FormText className="red">{errors.unitName}</FormText>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="unitCode">{i18n.t('static.unit.unitCode')}</Label>
                                                        <Input type="text"
                                                            name="unitCode"
                                                            id="unitCode"
                                                            bsSize="sm"
                                                            valid={!errors.unitCpde}
                                                            invalid={touched.unitCode && !!errors.unitCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.unitCode}
                                                            required />
                                                        <FormText className="red">{errors.unitCode}</FormText>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )} />
                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t(this.state.message,{entityname})}</h6>
                    <h6>{i18n.t(this.props.match.params.message,{entityname})}</h6>
                </div>
            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/unit/listUnit/` + i18n.t('static.message.cancelled', { entityname }))
    }


}
export default AddUnitComponent;