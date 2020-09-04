import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmService from '../../api/RealmService';

const initialValues = {
    summary: "Add / Update Funding Source",
    realmName: "",
    fundingSourceName: "",
    fundingSourceCode: "",    
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({        
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        fundingSourceName: Yup.string()
            .required(i18n.t('static.fundingsource.fundingsourcetext')),
        fundingSourceCode: Yup.string()
            .required(i18n.t('static.fundingsource.fundingsourceCodeText')),        
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

export default class FundingSourceTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fundingSource: {
                summary: "Add / Update Funding Source",
                realmName: "",
                fundingSourceName: "",
                fundingSourceCode: "",                
                notes: ""
            },
            message : '',
            realms: [],
            realmId: ''
        }        
        this.dataChange = this.dataChange.bind(this);        
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }  

    dataChange(event) {        
        let { fundingSource } = this.state
        if(event.target.name == "summary") {
            fundingSource.summary = event.target.value;
        }
        if(event.target.name == "realmName") {
            fundingSource.realmName = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmId : event.target.value
            })
        }
        if(event.target.name == "fundingSourceName") {
            fundingSource.fundingSourceName = event.target.value;
        }
        if(event.target.name == "fundingSourceCode") {
            fundingSource.fundingSourceCode = event.target.value;
        }
        if(event.target.name == "notes") {
            fundingSource.notes = event.target.value;
        }
        this.setState({       
            fundingSource
        }, () => {})
    };

    touchAll(setTouched, errors) {
        setTouched({            
            summary: true,
            realmName: true,
            fundingSourceName: true,
            fundingSourceCode: true,                     
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
        RealmService.getRealmListAll()
            .then(response => {
                this.setState({
                    realms: response.data
                })
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
        let { fundingSource } = this.state;
        fundingSource.summary = '';
        fundingSource.realmName = '';
        fundingSource.fundingSourceName = '';
        fundingSource.fundingSourceCode = '';                     
        fundingSource.notes = '';   
        this.setState({
            fundingSource
        },
            () => { });
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
            <div className="col-md-12">
                <h5 style={{ color: "green" }} id="div2">{i18n.t(this.state.message)}</h5>                
                <h4>{i18n.t('static.fundingsource.fundingsource')}</h4>
                <br></br>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {   
                        JiraTikcetService.addEmailRequestIssue(this.state.fundingSource).then(response => {             
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
                                        valid={!errors.summary && this.state.fundingSource.summary != ''}
                                        invalid={touched.summary && !!errors.summary}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.fundingSource.summary}
                                        required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmName" id="realmName"
                                        bsSize="sm"
                                        valid={!errors.realmName && this.state.fundingSource.realmName != ''}
                                        invalid={touched.realmName && !!errors.realmName}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.realmId}
                                        required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="fundingSourceName">{i18n.t('static.fundingSource.fundingSourceName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="fundingSourceName" id="fundingSourceName"
                                        bsSize="sm"
                                        valid={!errors.fundingSourceName && this.state.fundingSource.fundingSourceName != ''}
                                        invalid={touched.fundingSourceName && !!errors.fundingSourceName}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.fundingSource.fundingSourceName}
                                        required />
                                        <FormFeedback className="red">{errors.fundingSourceName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="fundingSourceCode">{i18n.t('static.fundingsource.fundingsourceCode')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="fundingSourceCode" id="fundingSourceCode"
                                        bsSize="sm"
                                        valid={!errors.fundingSourceCode && this.state.fundingSource.fundingSourceCode != ''}
                                        invalid={touched.fundingSourceCode && !!errors.fundingSourceCode}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.fundingSource.fundingSourceCode}
                                        required />
                                        <FormFeedback className="red">{errors.fundingSourceCode}</FormFeedback>
                                    </FormGroup>                                                                                                                                         
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                        bsSize="sm"
                                        valid={!errors.notes && this.state.fundingSource.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.dataChange(e);}}
                                        onBlur={handleBlur}
                                        value={this.state.fundingSource.notes}
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