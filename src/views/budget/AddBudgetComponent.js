import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import BudgetService from "../../api/BudgetService";
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../common/AuthenticationService.js';
import SubFundingSourceService from '../../api/SubFundingSourceService';

const initialValues = {
    budget: '',
    programId: '',
    subFundingSourceId: '',
    budgetAmt: '',
    startDate: '',
    stopDate: '',
    programList: [],
    subFundingSourceList: []
}

const validationSchema = function (values) {
    return Yup.object().shape({
        budget: Yup.string()
            .required('Please enter Budget'),
        programId: Yup.string()
            .required('Please select Program'),
        subFundingSourceId: Yup.string()
            .required('Please select Sub Funding source'),
        budgetAmt: Yup.string()
            .required('Please enter Budget amount'),
        startDate: Yup.string()
            .required('Please enter Start date'),
        stopDate: Yup.string()
            .required('Please enter Stop date')
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
class AddBudgetComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programs: [],
            subFundingSources: [],
            budget: {
                program: {
                },
                subFundingSource: {
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
        let { budget } = this.state;
        if (event.target.name === "budget") {
            budget.label.label_en = event.target.value;
        }
        if (event.target.name === "programId") {
            budget.program.programId = event.target.value;
        }
        if (event.target.name === "subFundingSourceId") {
            budget.subFundingSource.subFundingSourceId = event.target.value;
        }
        if (event.target.name === "budgetAmt") {
            budget.budgetAmt = event.target.value;
        }
        if (event.target.name === "startDate") {
            budget.startDate = event.target.value;
        }
        if (event.target.name === "stopDate") {
            budget.stopDate = event.target.value;
        }
        this.setState({
            budget
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            budget: true,
            programId: true,
            subFundingSourceId: true,
            budgetAmt: true,
            startDate: true,
            stopDate: true
        }
        );
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('budgetForm', (fieldName) => {
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
        ProgramService.getProgramList()
            .then(response => {
                // console.log(response.data);
                this.setState({
                    programs: response.data.data
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );

        SubFundingSourceService.getSubFundingSourceListAll()
            .then(response => {
                this.setState({
                    subFundingSources: response.data.data
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
    }

    render() {
        const { programs } = this.state;
        const { subFundingSources } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {item.label.label_en}
                </option>
            )
        }, this);
        let subFundingSourceList = subFundingSources.length > 0 && subFundingSources.map((item, i) => {
            return (
                <option key={i} value={item.subFundingSourceId}>
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
                                <i className="icon-note"></i><strong>Add Budget</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    BudgetService.addBudget(this.state.budget)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/budget/listBudget/${response.data.message}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.message
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
                                                            console.log("Error code unkown");
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
                                            <Form onSubmit={handleSubmit} noValidate name='budgetForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="budget">Budget</Label>
                                                        <Input type="text"
                                                            name="budget"
                                                            id="budget"
                                                            bsSize="sm"
                                                            valid={!errors.budget}
                                                            invalid={touched.budget && !!errors.budget}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        <FormFeedback>{errors.budget}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="programId">Program</Label>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            valid={!errors.programId}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.programId}
                                                        >
                                                            <option value="0">Please select</option>
                                                            {programList}
                                                        </Input>
                                                        <FormFeedback>{errors.programId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="subFundingSourceId">Sub Funding source</Label>
                                                        <Input
                                                            type="select"
                                                            name="subFundingSourceId"
                                                            id="subFundingSourceId"
                                                            bsSize="sm"
                                                            valid={!errors.subFundingSourceId}
                                                            invalid={touched.subFundingSourceId && !!errors.subFundingSourceId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.subFundingSourceId}
                                                        >
                                                            <option value="0">Please select</option>
                                                            {subFundingSourceList}
                                                        </Input>
                                                        <FormFeedback>{errors.subFundingSourceId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="budgetAmt">Budget Amount</Label>
                                                        <Input type="text"
                                                            name="budgetAmt"
                                                            id="budgetAmt"
                                                            bsSize="sm"
                                                            valid={!errors.budgetAmt}
                                                            invalid={touched.budgetAmt && !!errors.budgetAmt}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            placeholder="Enter your Budget amount in USD"
                                                            required />
                                                        <FormFeedback>{errors.budgetAmt}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="startDate">Start date</Label>
                                                        <Input type="text"
                                                            name="startDate"
                                                            id="startDate"
                                                            bsSize="sm"
                                                            valid={!errors.startDate}
                                                            invalid={touched.startDate && !!errors.startDate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="date"
                                                            placeholder="Start date of Budget"
                                                            required />
                                                        <FormFeedback>{errors.startDate}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="stopDate">Stop date</Label>
                                                        <Input type="text"
                                                            name="stopDate"
                                                            id="stopDate"
                                                            bsSize="sm"
                                                            valid={!errors.stopDate}
                                                            invalid={touched.stopDate && !!errors.stopDate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="date"
                                                            placeholder="Stop date of Budget"
                                                            required />
                                                        <FormFeedback>{errors.stopDate}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> Reset</Button> */}
                                                        <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> Cancel</Button>
                                                        <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>Submit</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )} />
                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{this.state.message}</h6>
                    <h6>{this.props.match.params.message}</h6>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/budget/listBudget/` + "Action Canceled")
    }
}

export default AddBudgetComponent;
