import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Date } from 'core-js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import RegionService from "../../api/RegionService";
import UnitService from "../../api/UnitService";
const initialValues = {
    startDate: '',
    stopDate: '',
    realmCountry: [],
    country: ''

}
const entityname = i18n.t('static.dashboad.regioncountry')
const validationSchema = function (values, t) {
    return Yup.object().shape({
        label: Yup.string()
            .required(i18n.t('static.region.validregion')),
        capacityCBM: Yup.number()
            .min(0, i18n.t('static.program.validvaluetext')),
       
    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values, i18n.t)
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

class RealmCountryRegion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            units: [],
            lang: localStorage.getItem('lang'),
            regionCountry: {},
            regions: [],
            realmCountry: {
                realmCountryId: '',
                country: {
                    countryId: '',
                    label: {
                        label_en: ''
                    }
                },
                realm: {
                    realmId: '',
                    label: {
                        label_en: ''
                    }
                }
            }, label: {
                label_en: ''
            },
            capacityCBM:'',
            gln:'',
            rows: []
           
        }
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.handleDisableSpecificRow = this.handleDisableSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.handleEnableSpecificRow = this.handleEnableSpecificRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this)
        this.CapitalizeFull = this.CapitalizeFull.bind(this);
    }
  
    touchAll(setTouched, errors) {
        setTouched({
            label: true,
           
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('countryForm', (fieldName) => {
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

    setTextAndValue = (event) => {
        // let { budget } = this.state;
       
        if (event.target.name === "label") {
            this.state.label.label_en = event.target.value;
        }
        
        if (event.target.name === "capacityCBM") {
            this.state.capacityCBM = event.target.value;

        }
        if (event.target.name === "gln") {
            this.state.gln = event.target.value;

        }
    }
    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }
    CapitalizeFull(str) {
        if (str != null && str != "") {
        return str.toUpperCase() 
    } else {
        return "";
    }
    }


    handleDisableSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = false

        // rows.splice(idx, 1);
        this.setState({ rows })
    }
    handleEnableSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = true

        // rows.splice(idx, 1);
        this.setState({ rows })
    }
    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    submitForm() {
        console.log(JSON.stringify(this.state.rows))
        var regionCountry = this.state.rows


        AuthenticationService.setupAxiosInterceptors();
        RegionService.editRegionsForcountry(regionCountry)
            .then(response => {
                if (response.status == 200) {
                    this.props.history.push(`/realmCountry/listRealmCountry/` + i18n.t(response.data.messageCode, { entityname }))

                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
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
                                this.setState({ message: error.response.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );



    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
            RealmCountryService.getRealmCountryById(this.props.match.params.realmCountryId).then(response => {
            console.log(JSON.stringify(response.data))
            this.setState({
                realmCountry: response.data,
                //  rows:response.data
            })
        }).catch(
            error => {
                console.log(JSON.stringify(error))
                if (error.message === "Network Error") {
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 406:
                        case 412:
                            this.setState({ message: error.response.messageCode });
                            break;
                        default:
                            this.setState({ message: 'static.unkownError' });
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );
        RegionService.getRegionForCountryId(this.props.match.params.realmCountryId).then(response => {
            console.log(response.data);
            this.setState({
                regionCountry: response.data,
                rows: response.data
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
    render() {
        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        const { regions } = this.state;
        let regionList = regions.length > 0
            && regions.map((item, i) => {
                return (
                    <option key={i} value={item.regionId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        return (<div className="animated fadeIn">
            <h5>{i18n.t(this.state.message)}</h5>
            <Row>
                <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                    <Card>
                        <CardHeader>
                            <strong>{i18n.t('static.dashboad.regioncountry')}</strong>
                        </CardHeader>
                        <CardBody>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    if ( this.state.label.label_en != "" ) {
                                        var json =
                                        {
                                            realmCountry: {
                                                id: this.props.match.params.realmCountryId
                                            }
                                            , label: { label_en: this.state.label.label_en },
                                            
                                            capacityCBM: this.state.capacityCBM,

                                            gln: this.state.gln,
                                            active: true

                                        }
                                        this.state.rows.push(json)
                                        this.setState({ rows: this.state.rows })
                                    }
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
                                    }) => (<Form onSubmit={handleSubmit} noValidate name='countryForm'>
                                        <FormGroup>
                                            <Label htmlFor="select">{i18n.t('static.dashboard.realmcountry')}</Label>
                                            <Input
                                                type="text"
                                                name="realmCountry"
                                                id="realmCountry"
                                                bsSize="sm"
                                                readOnly
                                                valid={!errors.realmCountry}
                                                invalid={touched.realmCountry && !!errors.realmCountry}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                onBlur={handleBlur}

                                                value={getLabelText(this.state.realmCountry.realm.label, this.state.lang) + "-" + getLabelText(this.state.realmCountry.country.label, this.state.lang)}
                                            >
                                            </Input>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="label">{i18n.t('static.region.region')}</Label>
                                            <Input type="text"
                                                name="label"
                                                id="label"
                                                bsSize="sm"
                                                valid={!errors.label}
                                                invalid={touched.label && !!errors.label}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); }}
                                                onBlur={handleBlur}
                                                value={ this.Capitalize(this.state.label.label_en)}
                                                required />
                                            <FormFeedback className="red">{errors.label}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="capacityCBM">{i18n.t('static.region.capacitycbm')}</Label>
                                            <Input type="number"
                                                name="capacityCBM"
                                                id="capacityCBM"
                                                bsSize="sm"
                                                valid={!errors.capacityCBM}
                                                invalid={touched.capacityCBM && !!errors.capacityCBM}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); }}
                                                onBlur={handleBlur}
                                                placeholder={i18n.t('static.region.capacitycbmtext')}
                                                />
                                            <FormFeedback className="red">{errors.capacityCBM}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="gln">{i18n.t('static.region.gln')}</Label>
                                            <Input
                                                type="text"
                                                min="0"
                                                name="gln"
                                                id="gln"
                                                bsSize="sm"
                                                valid={!errors.gln}
                                                invalid={touched.gln && !!errors.gln}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e);  }}
                                                value={this.CapitalizeFull(this.state.gln)}
                                                placeholder={i18n.t('static.region.glntext')}
                                            />
                                            <FormFeedback className="red">{errors.gln}</FormFeedback>
                                        </FormGroup>

                                        <FormGroup>
                                            <Button type="submit" size="md" color="success" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                            &nbsp;

                </FormGroup></Form>)} />
                            <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                                <thead>
                                    <tr>
                                        <th className="text-center"> {i18n.t('static.dashboard.region')} </th>
                                        <th className="text-center">{i18n.t('static.region.capacitycbm')}</th>
                                        <th className="text-center">{i18n.t('static.region.gln')}</th>
                                        <th className="text-center">{i18n.t('static.common.status')}</th>
                                        <th className="text-center">{i18n.t('static.common.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.rows.length > 0
                                        &&
                                        this.state.rows.map((item, idx) =>

                                            <tr id="addr0" key={idx} >
                                                <td>

                                                    {this.state.rows[idx].label.label_en}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].capacityCBM}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].gln}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active == true && <Button type="button" size="sm" color="danger" onClick={() => { this.handleDisableSpecificRow(idx) }} ><i className="fa fa-times"></i>Disable</Button>}
                                                    {this.state.rows[idx].active == false && <Button type="button" size="sm" color="success" onClick={() => { this.handleEnableSpecificRow(idx) }}><i className="fa fa-check"></i>Activate</Button>}
                                                    {!this.state.rows[idx].realmCountryRegionId && (<><br/><br/><DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /></>)}

                                                </td>
                                            </tr>)

                                    }
                                </tbody>

                            </Table>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                { <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                        </FormGroup>

                        </CardFooter>
                    </Card>
                </Col>
            </Row>
        </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/realmCountry/listRealmCountry/` + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default RealmCountryRegion
