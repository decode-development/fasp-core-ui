import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import RealmService from '../../api/RealmService'
import AuthenticationService from '../common/AuthenticationService.js';

const initialValues = {
    realmCode: '',
    label: '',
    monthInPastForAmc: '',
    monthInFutureForAmc: '',
    orderFrequency: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmCode: Yup.string()
            .required('Please enter realm code'),
        label: Yup.string()
            .required('Please enter realm name'),
        monthInPastForAmc: Yup.string()
            .required('Please enter month in past for amc'),
        monthInFutureForAmc: Yup.string()
            .required('Please enter month in future for amc'),
            orderFrequency: Yup.string()
            .required('Please enter order frequency')
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


export default class AddRealmComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realm: {
                realmCode: '',
                label: {
                    label_en: ''
                },
                monthInPastForAmc: '',
                monthInFutureForAmc: '',
                orderFrequency: '',
                defaultRealm: true
            }

        }
        this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { realm } = this.state
        if (event.target.name === "label") {
            this.state.realm.label.label_en = event.target.value
        }
        if (event.target.name === "realmCode") {
            this.state.realm.realmCode = event.target.value
        }
        if (event.target.name === "monthInPastForAmc") {
            this.state.realm.monthInPastForAmc = event.target.value
        }
        if (event.target.name === "monthInFutureForAmc") {
            this.state.realm.monthInFutureForAmc = event.target.value
        }
        if (event.target.name === "orderFrequency") {
            this.state.realm.orderFrequency = event.target.value
        }
        else if (event.target.name === "defaultRealm") {
            realm.defaultRealm = event.target.id === "realm.active2" ? false : true
        }


        this.setState(
            {
                realm
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            'realmCode': true,
            'label': true,
            'monthInPastForAmc': true,
            'monthInFutureForAmc': true,
            'orderFrequency': true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('realmForm', (fieldName) => {
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
        // $("#realmForm").validate({
        //     ignore: [],
        //     rules: {
        //         'realm.label.label_en': {
        //             required: true,
        //             lettersonlywhitespace: true,
        //             maxlength: 255
        //         },

        //         'realm.realmCode': {
        //             required: true,
        //             lettersonly: true,
        //             maxlength: 4
        //         },
        //         'realm.monthInPastForAmc': {
        //             required: true,
        //             positiveinteger: true

        //         },
        //         'realm.monthInFutureForAmc': {
        //             required: true,
        //             positiveinteger: true

        //         },
        //         'realm.orderFrequency': {
        //             required: true,
        //             positiveinteger: true

        //         }

        //     },
        //     errorPlacement: function (error, element) {
        //         error.insertAfter(element);
        //     }
        // });



    }
    Capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // submitForm() {
    //     if (navigator.onLine) {

    //         RealmService.addRealm(this.state.realm).then(response => {
    //             this.props.history.push(`/realmList/${response.data.message}`)
    //             console.log(response);
    //         }
    //         )
    //             .catch(
    //                 error => {
    //                     switch (error.message) {
    //                         case "Network Error":
    //                             this.setState({
    //                                 message: error.message
    //                             })
    //                             break
    //                         default:
    //                             this.setState({
    //                                 message: error.message
    //                             })
    //                             break
    //                     }
    //                 }
    //             )


    //     } else {
    //         alert("To perform this action you must be online.");

    //     }

    // }
    // render() {
    //     return (
    //         <>

    //             <div><h5>{this.state.message}</h5></div>
    //             <h3>Add Realm </h3>
    //             <form name="realmForm" id="realmForm">
    //                 <div>
    //                     <label>Realm Code:-</label>
    //                     <input type="text" name="realm.realmCode" value={this.Capitalize(this.state.realm.realmCode)} onChange={this.updateFieldData} />
    //                 </div>
    //                 <br /><br />
    //                 <div>
    //                     <label>Realm Name (English) :-</label>
    //                     <input type="text" name="realm.label.label_en" value={this.Capitalize(this.state.realm.label.label_en)} onChange={this.updateFieldData} />
    //                 </div>
    //                 <br /><br />
    //                 <div>
    //                     <label>Month In Past For AMC :-</label>
    //                     <input type="text" name="realm.monthInPastForAmc" value={this.Capitalize(this.state.realm.monthInPastForAmc)} onChange={this.updateFieldData} />
    //                 </div>
    //                 <br></br>
    //                 <div>
    //                     <label>Month In Future For AMC :-</label>
    //                     <input type="text" name="realm.monthInFutureForAmc" value={this.Capitalize(this.state.realm.monthInFutureForAmc)} onChange={this.updateFieldData} />
    //                 </div>
    //                 <br></br>
    //                 <div>
    //                     <label>Order Frequency :-</label>
    //                     <input type="text" name="realm.orderFrequency" value={this.Capitalize(this.state.realm.orderFrequency)} onChange={this.updateFieldData} />
    //                 </div>
    //                 <br></br>
    //                 <div>
    //                     Default:
    //                 <input type="radio" id="realm.active1" name="realm.defaultRealm" value={true} checked={this.state.realm.defaultRealm === true} onChange={this.updateFieldData} /> Active
    //                 <input type="radio" id="realm.active2" name="realm.defaultRealm" value={false} checked={this.state.realm.defaultRealm === false} onChange={this.updateFieldData} /> Disabled
    //                  </div>
    //                 <br /><br />
    //                 <div>
    //                     <button type="button" onClick={this.submitForm}>Submit</button>
    //                 </div>
    //             </form>


    //         </>
    //     );

    // }

    render() {

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Add Realm</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    // alert("----"+this.state.label.label_en);
                                    console.log("------IN SUBMIT------", this.state.country)
                                    RealmService.addRealm(this.state.realm)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/realm/listRealm/${response.data.message}`)
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
                                            <Form onSubmit={handleSubmit} noValidate name='realmForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="realmCode">Realm Code:</Label>
                                                        <Input type="text"
                                                            name="realmCode"
                                                            id="realmCode"
                                                            bsSize="sm"
                                                            valid={!errors.realmCode}
                                                            invalid={touched.realmCode && !!errors.realmCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            // value={this.state.country.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.realmCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">Realm Name (English)</Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.countryCode}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        <FormFeedback>{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="monthInPastForAmc">Month In Past For AMC</Label>
                                                        <Input type="text"
                                                            name="monthInPastForAmc"
                                                            id="monthInPastForAmc"
                                                            bsSize="sm"
                                                            valid={!errors.monthInPastForAmc}
                                                            invalid={touched.monthInPastForAmc && !!errors.monthInPastForAmc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        <FormFeedback>{errors.monthInPastForAmc}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="monthInFutureForAmc">Month In Future For AMC</Label>
                                                        <Input type="text"
                                                            name="monthInFutureForAmc"
                                                            id="monthInFutureForAmc"
                                                            bsSize="sm"
                                                            valid={!errors.monthInFutureForAmc}
                                                            invalid={touched.monthInFutureForAmc && !!errors.monthInFutureForAmc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        <FormFeedback>{errors.monthInFutureForAmc}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="orderFrequency">Order Frequency</Label>
                                                        <Input type="text"
                                                            name="orderFrequency"
                                                            id="orderFrequency"
                                                            bsSize="sm"
                                                            valid={!errors.orderFrequency}
                                                            invalid={touched.orderFrequency && !!errors.orderFrequency}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        <FormFeedback>{errors.orderFrequency}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>Default  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="defaultRealm"
                                                                value={true}
                                                                checked={this.state.realm.defaultRealm === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                Active
                                                                </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="defaultRealm"
                                                                value={false}
                                                                checked={this.state.realm.defaultRealm === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                Disabled
                                                                </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                    <Button type="reset" color="danger" className="mr-1 float-right btn-sm" onClick={this.cancelClicked}><i className="fa fa-times"></i> Cancel</Button>
                                                        <Button type="submit" color="success"className="mr-1 float-right btn-sm"onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>Submit</Button>
                                                     
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
        this.props.history.push(`/realm/listRealm/` + "Action Canceled")
    }

}