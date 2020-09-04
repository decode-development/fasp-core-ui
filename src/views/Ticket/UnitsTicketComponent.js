import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import DimensionService from '../../api/DimensionService';
import getLabelText from '../../CommonComponent/getLabelText';

const initialValues = {
    summary: "Add / Update Units",
    dimension: "",
    unit: "",
    unitCode: "",        
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({        
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        dimension: Yup.string()
            .required(i18n.t('static.unit.dimensiontext')),
        unit: Yup.string()
            .required(i18n.t('static.unit.unittext')),
        unitCode: Yup.string()
            .required(i18n.t('static.unit.unitcodetext')),        
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class UnitsTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            units: {
                summary: 'Add / Update Units',
                dimension: "",
                unit: "",
                unitCode: "",
                notes: ''
            },
            message : '',
            dimensions: [],
            dimensionId : ''
        }        
        this.dataChange = this.dataChange.bind(this);        
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }  

    dataChange(event) {        
        let { units } = this.state
        if(event.target.name == "summary") {
            units.summary = event.target.value;
        }
        if(event.target.name == "dimension") {            
            units.dimension = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                dimensionId : event.target.value
            })            
        }
        if(event.target.name == "unit") {
            units.unit = event.target.value;
        }
        if(event.target.name == "unitCode") {
            units.unitCode = event.target.value;
        }    
        if(event.target.name == "notes") {
            units.notes = event.target.value;
        }
        this.setState({       
            units
        }, () => {})
    };

    touchAll(setTouched, errors) {
        setTouched({            
            summary: true,
            dimension: true,
            unit: true,
            unitCode: true,
            notes: true
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
        DimensionService.getDimensionListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        dimensions: response.data
                    })
                } else {

                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })
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
        let { units } = this.state;
        units.summary = '';
        units.dimension = '';
        units.unit = '';
        units.unitCode = '';              
        units.notes = '';   
        this.setState({
            units
        },
            () => { });
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
            <div className="col-md-12">
                <h5 style={{ color: "green" }} id="div2">{i18n.t(this.state.message)}</h5>                
                <h4>{i18n.t('static.unit.unit')}</h4>
                <br></br>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {   
                        JiraTikcetService.addEmailRequestIssue(this.state.units).then(response => {             
                            var msg = "Your query has been raised. Ticket Code: "+response.data.key;
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
                                        valid={!errors.summary && this.state.units.summary != ''}
                                        invalid={touched.summary && !!errors.summary}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.units.summary}
                                        required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="dimension">{i18n.t('static.dimension.dimension')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="dimension" id="dimension"
                                        bsSize="sm"
                                        valid={!errors.dimension && this.state.units.dimension != ''}
                                        invalid={touched.dimension && !!errors.dimension}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.dimensionId}
                                        required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {dimensionList}
                                        </Input>
                                        <FormFeedback className="red">{errors.dimension}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="unit">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="unit" id="unit"
                                        bsSize="sm"
                                        valid={!errors.unit && this.state.units.unit != ''}
                                        invalid={touched.unit && !!errors.unit}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.units.unit}
                                        required />
                                        <FormFeedback className="red">{errors.unit}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="unitCode">{i18n.t('static.unit.unitCode')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="unitCode" id="unitCode"
                                        bsSize="sm"
                                        valid={!errors.unitCode && this.state.units.unitCode != ''}
                                        invalid={touched.unitCode && !!errors.unitCode}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.units.unitCode}
                                        required />
                                        <FormFeedback className="red">{errors.unitCode}</FormFeedback>
                                    </FormGroup>                                                                                                            
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                        bsSize="sm"
                                        valid={!errors.notes && this.state.units.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.units.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter>
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.props.toggleMaster}>{i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>                                        
                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
            </div>
        );
    }

}