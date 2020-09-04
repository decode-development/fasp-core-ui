import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';

const initialValues = {
    summary: "Bug Report",
    description: ""
}
const entityname = i18n.t('static.program.realmcountry');
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        description: Yup.string()
            .required(i18n.t('static.common.descriptiontext'))
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

export default class BugReportTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            bugReport: {
                summary: 'Bug Report',
                description: ''
            },
            message: ''
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    dataChange(event) {
        let { bugReport } = this.state
        if (event.target.name == "summary") {
            bugReport.summary = event.target.value;
        }
        if (event.target.name == "description") {
            bugReport.description = event.target.value;
        }
        this.setState({
            bugReport
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            description: true
        })
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
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { bugReport } = this.state;
        bugReport.summary = '';
        bugReport.description = '';
        this.setState({
            bugReport
        },
            () => { });
    }

    render() {

        return (
            <div className="col-md-12">
                <h5 style={{ color: "green" }} id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.common.bugreport')}</h4>
                <br></br>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        JiraTikcetService.addBugReportIssue(values).then(response => {             
                            var msg = "Your query has been raised. ID: "+response.data.id+"\n Key: "+response.data.key+"\n Url: "+response.data.self;
                            if (response.status == 200 || response.status == 201) {
                                this.setState({
                                    message: msg
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })
                                alert(this.state.message);
                            } else {
                                this.setState({
                                    // message: response.data.messageCode
                                    message: 'Error while creating query'
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })
                                alert(this.state.message);
                            }                            
                            this.props.togglehelp();
                        })
                        .catch(
                            error => {
                                switch (error.message) {
                                    case "Network Error":
                                        this.setState({
                                            message: 'Network Error'
                                        })
                                        break
                                    default:
                                        this.setState({
                                            message: 'Error'
                                        })
                                        break
                                }
                                alert(this.state.message);
                                this.props.togglehelp();
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
                            setTouched,
                            handleReset
                        }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm'>
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary"
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.bugReport.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.bugReport.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="description">{i18n.t('static.common.description')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="textarea" name="description" id="description"
                                            bsSize="sm"
                                            valid={!errors.description && this.state.bugReport.description != ''}
                                            invalid={touched.description && !!errors.description}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.bugReport.description}
                                            required />
                                        <FormFeedback className="red">{errors.description}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="pr-1 pl-1" >
                                        <Col>
                                            <Label className="uploadfilelable" htmlFor="file-input">Upload Screenshot</Label>
                                        </Col>
                                        <Col xs="12" className="custom-file">
                                            {/* <Input type="file" id="file-input" name="file-input" /> */}
                                            <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".zip,.png" />
                                            <label className="custom-file-label" id="file-input">Choose file</label>
                                        </Col>
                                    </FormGroup>
                                    <ModalFooter>
                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.props.toggleMain}>{i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
            </div>
        );
    }

}