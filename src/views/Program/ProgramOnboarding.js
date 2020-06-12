import React, { Component } from 'react';
// import "../node_modules/react-step-progress-bar/styles.css";
import "../../../node_modules/react-step-progress-bar/styles.css"
import { ProgressBar, Step } from "react-step-progress-bar";
import {
    Row, Col,
    Card, CardHeader, CardFooter,
    Button, FormFeedback, CardBody,
    FormText, Form, FormGroup, Label, Input,
    InputGroupAddon, InputGroupText
} from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import i18n from '../../i18n';
import HealthAreaService from "../../api/HealthAreaService";
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
import getLabelText from '../../CommonComponent/getLabelText'
import MapPlanningUnits from './MapPlanningUnits';
import StepOne from './StepOne.js';
import StepTwo from './StepTwo.js';
import StepThree from './StepThree.js';
import StepFour from './StepFour.js';
import StepSix from './StepSix.js'

const entityname = i18n.t('static.program.programMaster');
export default class ProgramOnboarding extends Component {
    constructor(props) {
        super(props);
        this.state = {
            program: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    realmId: ''
                },
                realmCountry: {
                    realmCountryId: ''
                },
                organisation: {
                    id: ''
                },
                programManager: {
                    userId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                airFreightPerc: '',
                seaFreightPerc: '',
                // deliveredToReceivedLeadTime: '',
                draftToSubmittedLeadTime: '',
                plannedToDraftLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                monthsInFutureForAmc: '',
                monthsInPastForAmc: '',

                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                arrivedToDeliveredLeadTime: '',

                healthArea: {
                    id: ''
                },
                programNotes: '',
                regionArray: [],
                programPlanningUnits: []
            },
            lang: localStorage.getItem('lang'),
            regionId: '',
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            healthAreaList: [],
            programManagerList: [],
            regionList: [],
            message: '',

            progressPer: 0
        }
        this.Capitalize = this.Capitalize.bind(this);

        this.dataChange = this.dataChange.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);



        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.finishedStepTwo = this.finishedStepTwo.bind(this);
        this.finishedStepThree = this.finishedStepThree.bind(this);
        this.finishedStepFour = this.finishedStepFour.bind(this);
        this.finishedStepFive = this.finishedStepFive.bind(this);
        this.finishedStepSix = this.finishedStepSix.bind(this);
        this.finishedStepSeven = this.finishedStepSeven.bind(this);

        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);
        this.previousToStepThree = this.previousToStepThree.bind(this);
        this.previousToStepFour = this.previousToStepFour.bind(this);
        this.previousToStepFive = this.previousToStepFive.bind(this);
        this.previousToStepSix = this.previousToStepSix.bind(this);

        this.removeMessageText = this.removeMessageText.bind(this);

        this.addRowInJexcel = this.addRowInJexcel.bind(this);
    }
    componentDidMount() {
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';

        AuthenticationService.setupAxiosInterceptors();
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }
    finishedStepOne() {
        this.setState({ progressPer: 17 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    finishedStepTwo() {
        this.setState({ progressPer: 34 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    finishedStepThree() {
        this.setState({ progressPer: 51 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    finishedStepFour() {
        this.setState({ progressPer: 68 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'block';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    finishedStepFive() {
        this.setState({ progressPer: 85 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'block';
        document.getElementById('stepSeven').style.display = 'none';
    }
    finishedStepSix() {
        this.setState({ progressPer: 102 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'block';
    }


    removeMessageText() {
        this.setState({ message: '' });
    }

    finishedStepSeven() {
        let { program } = this.state;
        var j = this.refs.child.myFunction();
        var validation = this.refs.child.checkValidation();
        program.programPlanningUnits = j;
        this.setState({ program }, () => { });

        console.log("validation status----", validation)
        console.log("planningUnit ----------------", j);
        console.log("program-----------", this.state.program);

        if (validation == true) {
            AuthenticationService.setupAxiosInterceptors();
            ProgramService.programInitialize(this.state.program).then(response => {
                if (response.status == "200") {
                    console.log("in success--------");
                    this.props.history.push(`/program/listProgram/` + i18n.t(response.data.messageCode, { entityname }))
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }
            )
        } else {
            this.setState({ message: "Please Enter Valid Data." });
        }
    }

    addRowInJexcel() {
        this.refs.child.addRow();
    }

    previousToStepOne() {
        this.setState({ progressPer: 0 });
        document.getElementById('stepOne').style.display = 'block';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }

    previousToStepTwo() {
        this.setState({ progressPer: 17 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'block';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }

    previousToStepThree() {
        this.setState({ progressPer: 34 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'block';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }

    previousToStepFour() {
        this.setState({ progressPer: 51 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'block';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    previousToStepFive() {
        this.setState({ progressPer: 68 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'block';
        document.getElementById('stepSix').style.display = 'none';
        document.getElementById('stepSeven').style.display = 'none';
    }
    previousToStepSix() {
        this.setState({ progressPer: 85 });
        document.getElementById('stepOne').style.display = 'none';
        document.getElementById('stepTwo').style.display = 'none';
        document.getElementById('stepThree').style.display = 'none';
        document.getElementById('stepFour').style.display = 'none';
        document.getElementById('stepFive').style.display = 'none';
        document.getElementById('stepSix').style.display = 'block';
        document.getElementById('stepSeven').style.display = 'none';
    }
    Capitalize(str) {
        let { program } = this.state
        program.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == "programName") {
            program.label.label_en = event.target.value;
        } if (event.target.name == "realmId") {
            program.realm.realmId = event.target.value;
            this.refs.child.getRealmId();
            this.refs.countryChild.getRealmCountryList();
            this.refs.healthAreaChild.getHealthAreaList();
            this.refs.organisationChild.getOrganisationList();
            this.refs.sixChild.getProgramManagerList();
        } if (event.target.name == 'realmCountryId') {
            program.realmCountry.realmCountryId = event.target.value;
            // this.refs.regionChild.getRegionList();
        } if (event.target.name == 'organisationId') {
            program.organisation.id = event.target.value;
        } if (event.target.name == 'airFreightPerc') {
            program.airFreightPerc = event.target.value;
        } if (event.target.name == 'seaFreightPerc') {
            program.seaFreightPerc = event.target.value;
        } 
        // if (event.target.name == 'deliveredToReceivedLeadTime') {
        //     program.deliveredToReceivedLeadTime = event.target.value;
        // } 
        if (event.target.name == 'draftToSubmittedLeadTime') {
            program.draftToSubmittedLeadTime = event.target.value;
        } if (event.target.name == 'plannedToDraftLeadTime') {
            program.plannedToDraftLeadTime = event.target.value;
        } if (event.target.name == 'submittedToApprovedLeadTime') {
            program.submittedToApprovedLeadTime = event.target.value;
        } if (event.target.name == 'approvedToShippedLeadTime') {
            program.approvedToShippedLeadTime = event.target.value;
        } if (event.target.name == 'monthsInFutureForAmc') {
            program.monthsInFutureForAmc = event.target.value;
        } if (event.target.name == 'monthsInPastForAmc') {
            program.monthsInPastForAmc = event.target.value;
        } if (event.target.name == 'healthAreaId') {
            program.healthArea.id = event.target.value;
        } if (event.target.name == 'userId') {
            program.programManager.userId = event.target.value;
        }if (event.target.name == 'shippedToArrivedByAirLeadTime') {
            program.shippedToArrivedByAirLeadTime = event.target.value;
        }
        if (event.target.name == 'shippedToArrivedBySeaLeadTime') {
            program.shippedToArrivedBySeaLeadTime = event.target.value;
        }
        if (event.target.name == 'arrivedToDeliveredLeadTime') {
            program.arrivedToDeliveredLeadTime = event.target.value;
        }
        else if (event.target.name == 'programNotes') {
            program.programNotes = event.target.value;
        }

        this.setState({ program }, () => { })

    }

    getDependentLists(e) {
        // AuthenticationService.setupAxiosInterceptors();
        // ProgramService.getProgramManagerList(e.target.value)
        //     .then(response => {
        //         if (response.status == 200) {
        //             this.setState({
        //                 programManagerList: response.data
        //             })h4
        //         } else {
        //             this.setState({
        //                 message: response.data.messageCode
        //             })
        //         }
        //     })

        // ProgramService.getRealmCountryList(e.target.value)
        //     .then(response => {
        //         if (response.status == 200) {
        //             this.setState({
        //                 realmCountryList: response.data
        //             })
        //         } else {
        //             this.setState({
        //                 message: response.data.messageCode
        //             })
        //         }
        //     })

        // AuthenticationService.setupAxiosInterceptors();
        // ProgramService.getOrganisationList(e.target.value)
        //     .then(response => {
        //         if (response.status == 200) {
        //             this.setState({
        //                 organisationList: response.data
        //             })
        //         } else {
        //             this.setState({
        //                 message: response.data.messageCode
        //             })
        //         }
        //     })


        // AuthenticationService.setupAxiosInterceptors();
        // ProgramService.getHealthAreaList(e.target.value)
        //     .then(response => {
        //         if (response.status == 200) {
        //             this.setState({
        //                 healthAreaList: response.data
        //             })
        //         } else {
        //             this.setState({
        //                 message: response.data.messageCode
        //             })
        //         }
        //     })
    }

    getRegionList(e) {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getRegionList(e.target.value)
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    this.setState({
                        regionId: '',
                        regionList: regList
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }
    updateFieldData(value) {
        let { program } = this.state;
        this.setState({ regionId: value });
        var regionId = value;
        var regionIdArray = [];
        for (var i = 0; i < regionId.length; i++) {
            regionIdArray[i] = regionId[i].value;
        }
        program.regionArray = regionIdArray;
        this.setState({ program: program });
    }


    render() {
        // const { realmList } = this.state;
        // const { programManagerList } = this.state;
        // const { realmCountryList } = this.state;
        // const { organisationList } = this.state;
        // const { healthAreaList } = this.state;

        // let realms = realmList.length > 0
        //     && realmList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.realmId}>
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);

        // let realmCountries = realmCountryList.length > 0
        //     && realmCountryList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.realmCountryId}>
        //                 {getLabelText(item.country.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);

        // let realmOrganisation = organisationList.length > 0
        //     && organisationList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.organisationId}>
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);

        // let realmHealthArea = healthAreaList.length > 0
        //     && healthAreaList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.healthAreaId}>
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);


        // let programManagers = programManagerList.length > 0
        //     && programManagerList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.userId}>
        //                 {item.username}
        //             </option>
        //         )
        //     }, this);



        return (




            <div className="animated fadeIn">
                <h5></h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Setup Program</strong>{' '}
                            </CardHeader>
                            <CardBody>

                                <ProgressBar
                                    percent={this.state.progressPer}
                                    filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
                                    style={{ width: '75%' }}
                                >
                                    <Step transition="scale">
                                        {({ accomplished }) => (

                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                // src="https://pngimg.com/uploads/number1/number1_PNG14871.png"
                                                src="../../../../public/assets/img/numbers/number1.png"
                                            />


                                        )}

                                    </Step>

                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number2.png"
                                            // src="https://cdn.clipart.email/096a56141a18c8a5b71ee4a53609b16a_data-privacy-news-five-stories-that-you-need-to-know-about-_688-688.png"
                                            />
                                            // <h2>2</h2>
                                        )}

                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number3.png"
                                            // src="https://www.obiettivocoaching.it/wp-content/uploads/2016/04/recruit-circle-3-icon-blue.png"
                                            />
                                            // <h2>3</h2>
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number4.png"
                                            // src="https://pngriver.com/wp-content/uploads/2017/12/number-4-digit-png-transparent-images-transparent-backgrounds-4.png"
                                            />
                                            // <h2>4</h2>
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (

                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number5.png"
                                            // src="https://dwidude.com/wp-content/uploads/2016/09/recruit-circle-5-icon-blue.png"
                                            />
                                            // <h2>5</h2>
                                        )}
                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number6.png"
                                            // src="http://pngimg.com/uploads/number6/number6_PNG18583.png"
                                            />
                                            // <h2>6</h2>
                                        )}
                                    </Step>

                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number7.png"
                                            // src="https://www.library.ucla.edu/sites/default/files/styles/custom_crop/public/static_images/BYS7.jpg?itok=9890vsGz"
                                            />
                                            // <h2>7</h2>
                                        )}
                                    </Step>
                                </ProgressBar>

                                <div className="d-sm-down-none  progressbar">
                                    <ul>
                                        <li className="progressbartext1">Realm</li>
                                        <li className="progressbartext2">Country</li>
                                        <li className="progressbartext3">Health Area</li>
                                        <li className="progressbartext4">Organization</li>
                                        <li className="progressbartext5">Region</li>
                                        <li className="progressbartext6">Program Data</li>
                                        <li className="progressbartext7">Planning Units</li>
                                    </ul>
                                </div>

                                <br></br>
                                <div id="stepOne">

                                    <StepOne finishedStepOne={this.finishedStepOne} dataChange={this.dataChange} getDependentLists={this.getDependentLists} items={this.state}></StepOne>
                                    {/* <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>

                                        <Input
                                            bsSize="sm"
                                            className="col-md-6"
                                            type="select" name="realmId" id="realmId"
                                            onChange={(e) => { this.dataChange(e); this.getDependentLists(e) }}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realms}
                                        </Input>
                                        <Button color="info" size="md" className="float-right mr-1 nextbtn" type="button" name="planningPrevious" id="planningPrevious" onClick={this.finishedStepOne} >Next <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </FormGroup> */}
                                </div>
                                <div id="stepTwo">
                                    <StepTwo ref='countryChild' finishedStepTwo={this.finishedStepTwo} previousToStepOne={this.previousToStepOne} dataChange={this.dataChange} getRegionList={this.getRegionList} items={this.state}></StepTwo>
                                    {/* getRegionList={this.getRegionList}  */}
                                    {/* realmCountryList={this.state.realmCountryList} */}
                                    {/* <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onChange={(e) => { this.dataChange(e); this.getRegionList(e) }}
                                            bsSize="sm"
                                            className="col-md-6"
                                            type="select" name="realmCountryId" id="realmCountryId">
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmCountries}
                                        </Input>
                                    </FormGroup>
                                    <Button color="info" size="md" className="float-right mr-1 nextbtn" type="button" name="countrySub" id="countrySub" onClick={this.finishedStepTwo} >Next <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepOne} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                    &nbsp; */}

                                </div>
                                <div id="stepThree">
                                    <StepThree ref="healthAreaChild" finishedStepThree={this.finishedStepThree} previousToStepTwo={this.previousToStepTwo} dataChange={this.dataChange} items={this.state}></StepThree>
                                    {/* <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            bsSize="sm"
                                            type="select"
                                            name="healthAreaId"
                                            id="healthAreaId"
                                            className="col-md-6"
                                            onChange={(e) => { this.dataChange(e) }}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmHealthArea}
                                        </Input>
                                        <Button color="info" size="md" className="float-right mr-1 nextbtn" type="button" name="healthAreaSub" id="healthAreaSub" onClick={this.finishedStepThree} >Next <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.previousToStepTwo} ><i className="fa fa-angle-double-left"></i> Previous</Button>
                                        &nbsp;

                                    </FormGroup> */}
                                </div>
                                <div id="stepFour">
                                    <StepFour ref='organisationChild' finishedStepFour={this.finishedStepFour} previousToStepThree={this.previousToStepThree} dataChange={this.dataChange} items={this.state}></StepFour>

                                    {/* <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            bsSize="sm"
                                            type="select"
                                            name="organisationId"
                                            id="organisationId"
                                            className="col-md-6"
                                            onChange={(e) => { this.dataChange(e) }}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmOrganisation}

                                        </Input>
                                        <Button color="info" size="md" className="float-right mr-1 nextbtn" type="button" name="organizationSub" id="organizationSub" onClick={this.finishedStepFour} >Next <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-right mr-1" type="button" name="organizationPrevious" id="organizationPrevious" onClick={this.previousToStepThree} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                        &nbsp;

                                    </FormGroup> */}
                                </div>
                                <div id="stepFive">
                                    {/* <StepFive ref='regionChild' finishedStepFive={this.finishedStepFive} previousToStepFour={this.previousToStepFour} updateFieldData={this.updateFieldData}></StepFive> */}
                                    <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span><span class="red Reqasterisk">*</span></Label>
                                        <Select
                                            onChange={(e) => { this.updateFieldData(e) }}
                                            className="col-md-4 ml-field"
                                            bsSize="sm"
                                            name="regionId"
                                            id="regionId"
                                            multi
                                            options={this.state.regionList}
                                            value={this.state.regionId}
                                        />
                                    </FormGroup>

                                    <FormGroup>

                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1 nextbtn" type="button" name="regionSub" id="regionSub" onClick={this.finishedStepFive}>Next <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;

                                    </FormGroup>
                                </div>
                                <div id="stepSix">
                                    <StepSix ref='sixChild' dataChange={this.dataChange} Capitalize={this.Capitalize} finishedStepSix={this.finishedStepSix} previousToStepFive={this.previousToStepFive} items={this.state}></StepSix>
                                    {/* <Row>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                type="text" name="programName"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e); this.Capitalize(e.target.value) }}
                                                value={this.state.program.label.label_en}
                                                id="programName" placeholder={i18n.t('static.program.programtext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="select">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="select" name="userId" id="userId">
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {programManagers}
                                            </Input>
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="select">{i18n.t('static.program.notes')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="textarea" name="programNotes" id="programNotes" />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.airfreightperc')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="airFreightPerc" id="airFreightPerc" placeholder={i18n.t('static.program.airfreightperctext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.seafreightperc')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="seaFreightPerc" id="seaFreightPerc" placeholder={i18n.t('static.program.seafreightperc')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.draftleadtime')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="plannedToDraftLeadTime" id="plannedToDraftLeadTime" placeholder={i18n.t('static.program.draftleadtext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.drafttosubmitleadtime')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="draftToSubmittedLeadTime" id="draftToSubmittedLeadTime" placeholder={i18n.t('static.program.drafttosubmittext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.submittoapproveleadtime')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" placeholder={i18n.t('static.program.submittoapprovetext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.approvetoshipleadtime')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" placeholder={i18n.t('static.program.approvetoshiptext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.delivertoreceivetext')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="deliveredToReceivedLeadTime" id="deliveredToReceivedLeadTime" placeholder={i18n.t('static.program.delivertoreceivetext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.monthpastamc')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="monthsInPastForAmc" id="monthsInPastForAmc" placeholder={i18n.t('static.program.monthpastamctext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="company">{i18n.t('static.program.monthfutureamc')}<span class="red Reqasterisk">*</span></Label>
                                            <Input

                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                type="number"
                                                min="0"
                                                name="monthsInFutureForAmc" id="monthsInFutureForAmc" placeholder={i18n.t('static.program.monthfutureamctext')} />
                                        </FormGroup>
                                        <FormGroup className="col-md-12">
                                            <Button color="info" size="md" className="float-right mr-1" type="button" name="regionSub" id="regionSub" onClick={this.finishedStepSix}>Next <i className="fa fa-angle-double-right"></i></Button>
                                            &nbsp;
                                    <Button color="info" size="md" className="float-right mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.previousToStepFive} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                        </FormGroup>

                                    </Row> */}
                                </div>
                                <div id="stepSeven">
                                    <MapPlanningUnits ref="child" message={this.state.message} removeMessageText={this.removeMessageText} items={this.state}></MapPlanningUnits>
                                    <FormGroup>
                                        <Button color="success" size="md" className="float-right mr-1" type="button" name="regionSub" id="regionSub" onClick={this.finishedStepSeven}> <i className="fa fa-check"></i> Submit</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRowInJexcel}> <i className="fa fa-plus"></i> Add Row</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.previousToStepSix} > <i className="fa fa-angle-double-left "></i> Previous</Button>
                                        &nbsp;
                                    </FormGroup>
                                </div>
                            </CardBody></Card></Col></Row></div>





        );
    }
}