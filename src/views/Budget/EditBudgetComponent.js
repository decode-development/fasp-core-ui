import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, FormText, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText, InputGroup } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText'
import BudgetService from "../../api/BudgetService";
import AuthenticationService from '../Common/AuthenticationService.js';

let initialValues = {
    budget: '',
    programId: '',
    subFundingSourceId: '',
    budgetAmt: '',
    startDate: '',
    stopDate: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        budget: Yup.string()
            .required(i18n.t('static.budget.budgetamountdesc')),
        budgetAmt: Yup.string()
            .required(i18n.t('static.budget.budgetamounttext')),
        startDate: Yup.string()
            .required(i18n.t('static.budget.startdatetext')),
        stopDate: Yup.string()
            .required(i18n.t('static.budget.stopdatetext'))
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

class EditBudgetComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            budget: {
                label: {
                    label_en: ''
                },
                program: {
                    label: {
                        label_en: ''
                    }
                },
                subFundingSource: {
                    label: {
                        label_en: ''
                    }
                },
                startDate: '',
                stopDate: ''

            },
            message: '',
            lang: localStorage.getItem('lang'),
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.currentDate = this.currentDate.bind(this);
    }
    currentDate() {
        var todaysDate = new Date();
        var yyyy = todaysDate.getFullYear().toString();
        var mm = (todaysDate.getMonth() + 1).toString();
        var dd = todaysDate.getDate().toString();
        var mmChars = mm.split('');
        var ddChars = dd.split('');
        let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        // console.log("------date", date)
        return date;
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        BudgetService.getBudgetDataById(this.props.match.params.budgetId)
            .then(response => {
                // console.log("------>", response.data);
                var budget = response.data;
                this.setState({ budget: budget });
                initialValues = {
                    budget: getLabelText(budget.label, this.state.lang),
                    programId: budget.program.programId,
                    subFundingSourceId: budget.subFundingSource.subFundingSourceId,
                    budgetAmt: budget.budgetAmt,
                    startDate: budget.startDate,
                    stopDate: budget.stopDate,
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
                                message: error.message
                            })
                            break
                    }
                }
            );


    }
    dataChange(event) {
        let { budget } = this.state;
        if (event.target.name === "budget") {
            budget.label.label_en = event.target.value;
        }
        if (event.target.name === "budgetAmt") {
            budget.budgetAmt = event.target.value;
        } if (event.target.name === "startDate") {
            budget.startDate = event.target.value;
            budget.stopDate = ''
        } if (event.target.name === "stopDate") {
            budget.stopDate = event.target.value;
        } else if (event.target.name === "active") {
            budget.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            budget
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            budget: true,
            budgetAmt: true,
            startDate: true,
            stopDate: true
        }
        )
        this.validateForm(errors)
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

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.budget.budgetedit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    BudgetService.editBudget(this.state.budget)
                                        .then(response => {
                                            if (response.status == "200") {
                                                this.props.history.push(`/budget/listBudget/${response.data.message}`)
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
                                            <Form onSubmit={handleSubmit} noValidate name='budgetForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="budget">{i18n.t('static.budget.budget')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-money"></i></InputGroupText>
                                                            </InputGroupAddon>
                                                            <Input type="text"
                                                                name="budget"
                                                                id="budget"
                                                                bsSize="sm"
                                                                valid={!errors.budget}
                                                                invalid={touched.budget && !!errors.budget}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                value={getLabelText(this.state.budget.label, this.state.lang)}
                                                                required />
                                                            <FormFeedback className="red">{errors.budget}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="programId">{i18n.t('static.budget.program')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa-object-group"></i></InputGroupText>
                                                            </InputGroupAddon><Input
                                                                type="text"
                                                                name="programId"
                                                                id="programId"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.programId}
                                                                invalid={touched.programId && !!errors.programId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required
                                                                value={this.state.budget.program.label.label_en}
                                                            >
                                                            </Input>
                                                            <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="subFundingSourceId">{i18n.t('static.budget.subfundingsource')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-building-o"></i></InputGroupText>
                                                            </InputGroupAddon> <Input
                                                                type="text"
                                                                name="subFundingSourceId"
                                                                id="subFundingSourceId"
                                                                bsSize="sm"
                                                                valid={!errors.subFundingSourceId}
                                                                invalid={touched.subFundingSourceId && !!errors.subFundingSourceId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                readOnly
                                                                required
                                                                value={this.state.budget.subFundingSource.label.label_en}
                                                            >
                                                            </Input>
                                                            <FormFeedback className="red">{errors.subFundingSourceId}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="budgetAmt">{i18n.t('static.budget.budgetamount')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-usd"></i></InputGroupText>
                                                            </InputGroupAddon>
                                                            <Input type="text"
                                                                name="budgetAmt"
                                                                id="budgetAmt"
                                                                bsSize="sm"
                                                                valid={!errors.budgetAmt}
                                                                invalid={touched.budgetAmt && !!errors.budgetAmt}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number"
                                                                placeholder={i18n.t('static.budget.budgetamountdesc')}
                                                                value={this.state.budget.budgetAmt}
                                                                required />
                                                            <FormFeedback className="red">{errors.budgetAmt}</FormFeedback>
                                                        </InputGroup>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-calendar-plus-o"></i></InputGroupText>
                                                            </InputGroupAddon>  <Input type="text"
                                                                name="startDate"
                                                                id="startDate"
                                                                bsSize="sm"
                                                                valid={!errors.startDate}
                                                                invalid={touched.startDate && !!errors.startDate}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="date"
                                                                min={this.currentDate()}
                                                                value={this.state.budget.startDate}
                                                                placeholder="{i18n.t('static.budget.budgetstartdate')}"
                                                                required />
                                                        </InputGroup>
                                                        <FormFeedback className="red">{errors.startDate}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend">
                                                                <InputGroupText><i className="fa fa-phone"></i></InputGroupText>
                                                            </InputGroupAddon><Input type="text"
                                                                name="stopDate"
                                                                id="stopDate"
                                                                bsSize="sm"
                                                                valid={!errors.stopDate}
                                                                invalid={touched.stopDate && !!errors.stopDate}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="date"
                                                                min={this.state.budget.startDate}
                                                                value={this.state.budget.stopDate}
                                                                placeholder="{i18n.t('static.budget.budgetstopdate')}"
                                                                required />
                                                            <FormFeedback className="red">{errors.stopDate}</FormFeedback>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label>{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>

                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.budget.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-active1">
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
                                                                checked={this.state.budget.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-active2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-ban"></i> Reset</Button> */}
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>Update</Button>
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
        this.props.history.push(`/budget/listBudget/` + "Action Canceled")
    }
}

export default EditBudgetComponent;