// import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
// import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
// import CryptoJS from 'crypto-js';
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import React, { Component, lazy } from 'react';
// import Picker from 'react-month-picker';
// import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
// import {
//     Card, CardBody,
//     // CardFooter,
//     CardHeader, Col, Form, FormGroup, InputGroup, Label, Table
// } from 'reactstrap';
// import ProgramService from '../../api/ProgramService';
// import ReportService from '../../api/ReportService';
// import csvicon from '../../assets/img/csv.png';
// import pdfIcon from '../../assets/img/pdf.png';
// import getLabelText from '../../CommonComponent/getLabelText';
// import { LOGO } from '../../CommonComponent/Logo.js';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// // const { getToggledOptions } = utils;
// const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// // const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
// const ref = React.createRef();

// const brandPrimary = getStyle('--primary')
// const brandSuccess = getStyle('--success')
// const brandInfo = getStyle('--info')
// const brandWarning = getStyle('--warning')
// const brandDanger = getStyle('--danger')
// class ProcurementAgentExport extends Component {
//     constructor(props) {
//         super(props);

//         this.toggledata = this.toggledata.bind(this);
//         this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

//         this.state = {
//             dropdownOpen: false,
//             radioSelected: 2,
//             lang: localStorage.getItem('lang'),
//             procurementAgents: [],
//             programValues: [],
//             programLabels: [],
//             programs: [],
//             message: ''
//         };
//         this.filterData = this.filterData.bind(this);
//         this.getPrograms = this.getPrograms.bind(this)
//         this.handleChangeProgram = this.handleChangeProgram.bind(this)
//     }

//     exportCSV() {

//         var csvRow = [];

//         this.state.programLabels.map(ele =>
//             csvRow.push(i18n.t('static.program.program') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//         csvRow.push('')
//         var re;

//         var A = [[("Program Name").replaceAll(' ', '%20'), ("Freight Cost Sea (%)").replaceAll(' ', '%20'), ("Freight Cost Air (%)").replaceAll(' ', '%20'), ("Plan to Draft LT (Months)").replaceAll(' ', '%20'), ("Draft to Submitted LT (Months)").replaceAll(' ', '%20'), ("Submitted to Approved LT (Months)").replaceAll(' ', '%20'), ("Approved to Shipped LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Sea LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Air LT (Months)").replaceAll(' ', '%20'), ("Arrived to Delivered LT (Months)").replaceAll(' ', '%20'), ("Total LT By Sea (Months)").replaceAll(' ', '%20'), ("Total LT By Air (Months)").replaceAll(' ', '%20')]]

//         re = this.state.procurementAgents

//         for (var item = 0; item < re.length; item++) {
//             let totalSeaLeadTime = re[item].plannedToDraftLeadTime + re[item].draftToSubmittedLeadTime + re[item].submittedToApprovedLeadTime + re[item].approvedToShippedLeadTime + re[item].shippedToArrivedBySeaLeadTime + re[item].arrivedToDeliveredLeadTime;
//             let totalAirLeadTime = re[item].plannedToDraftLeadTime + re[item].draftToSubmittedLeadTime + re[item].submittedToApprovedLeadTime + re[item].approvedToShippedLeadTime + re[item].shippedToArrivedByAirLeadTime + re[item].arrivedToDeliveredLeadTime;
//             A.push([[getLabelText(re[item].label), re[item].seaFreightPerc, re[item].airFreightPerc, re[item].plannedToDraftLeadTime, re[item].draftToSubmittedLeadTime, re[item].submittedToApprovedLeadTime, re[item].approvedToShippedLeadTime, re[item].shippedToArrivedBySeaLeadTime, re[item].shippedToArrivedByAirLeadTime, re[item].arrivedToDeliveredLeadTime, totalSeaLeadTime, totalAirLeadTime]])
//         }
//         for (var i = 0; i < A.length; i++) {
//             csvRow.push(A[i].join(","))
//         }
//         var csvString = csvRow.join("%0A")
//         var a = document.createElement("a")
//         a.href = 'data:attachment/csv,' + csvString
//         a.target = "_Blank"
//         a.download = "Procurement Agent Report.csv"
//         document.body.appendChild(a)
//         a.click()
//     }
//     exportPDF = () => {
//         const addFooters = doc => {

//             const pageCount = doc.internal.getNumberOfPages()

//             doc.setFont('helvetica', 'bold')
//             doc.setFontSize(10)
//             for (var i = 1; i <= pageCount; i++) {
//                 doc.setPage(i)

//                 doc.setPage(i)
//                 doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
//                     align: 'center'
//                 })
//                 doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
//                     align: 'center'
//                 })


//             }
//         }
//         const addHeaders = doc => {

//             const pageCount = doc.internal.getNumberOfPages()
//             doc.setFont('helvetica', 'bold')
//             for (var i = 1; i <= pageCount; i++) {
//                 doc.setFontSize(12)
//                 doc.setPage(i)
//                 doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
//                 doc.setTextColor("#002f6c");
//                 doc.text("Procurement Agent Report", doc.internal.pageSize.width / 2, 60, {
//                     align: 'center'
//                 })
//                 if (i == 1) {
//                     doc.setFontSize(8)
//                     var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString(), doc.internal.pageSize.width * 3 / 4);
//                     doc.text(doc.internal.pageSize.width / 8, 90, planningText)

//                 }

//             }
//         }
//         const unit = "pt";
//         const size = "A4"; // Use A1, A2, A3 or A4
//         const orientation = "landscape"; // portrait or landscape

//         const marginLeft = 10;
//         const doc = new jsPDF(orientation, unit, size, true);

//         doc.setFontSize(8);

//         const title = "Procurement Agent Report";
//         // var canvas = document.getElementById("cool-canvas");
//         //creates image

//         // var canvasImg = canvas.toDataURL("image/png", 1.0);
//         var width = doc.internal.pageSize.width;
//         var height = doc.internal.pageSize.height;
//         var h1 = 50;
//         // var aspectwidth1 = (width - h1);

//         // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

//         const headers = [["Program Name", "Freight Cost Sea (%)", "Freight Cost Air (%)", "Plan to Draft LT (Months)", "Draft to Submitted LT (Months)", "Submitted to Approved LT (Months)", "Approved to Shipped LT (Months)", "Shipped to Arrived by Sea LT (Months)", "Shipped to Arrived by Air LT (Months)", "Arrived to Delivered LT (Months)", "Total LT By Sea (Months)", "Total LT By Air (Months)"]]
//         const data = this.state.procurementAgents.map(elt => [getLabelText(elt.label), elt.seaFreightPerc, elt.airFreightPerc, elt.plannedToDraftLeadTime, elt.draftToSubmittedLeadTime, elt.submittedToApprovedLeadTime, elt.approvedToShippedLeadTime, elt.shippedToArrivedBySeaLeadTime, elt.shippedToArrivedByAirLeadTime, elt.arrivedToDeliveredLeadTime, (elt.plannedToDraftLeadTime + elt.draftToSubmittedLeadTime + elt.submittedToApprovedLeadTime + elt.approvedToShippedLeadTime + elt.shippedToArrivedBySeaLeadTime + elt.arrivedToDeliveredLeadTime), (elt.plannedToDraftLeadTime + elt.draftToSubmittedLeadTime + elt.submittedToApprovedLeadTime + elt.approvedToShippedLeadTime + elt.shippedToArrivedByAirLeadTime + elt.arrivedToDeliveredLeadTime)]);

//         let content = {
//             margin: { top: 80 },
//             startY: 150,
//             head: headers,
//             body: data,
//             styles: { lineWidth: 1, fontSize: 8 }

//         };
//         doc.autoTable(content);
//         addHeaders(doc)
//         addFooters(doc)
//         doc.save("Procurement Agent Report.pdf")
//     }
//     handleChangeProgram(programIds) {

//         this.setState({
//             programValues: programIds.map(ele => ele.value),
//             programLabels: programIds.map(ele => ele.label)
//         }, () => {

//             this.filterData(this.state.rangeValue)
//         })

//     }
//     filterData(rangeValue) {
//         setTimeout('', 10000);
//         let programIds = this.state.programValues;
//         if (programIds.length > 0) {
//             AuthenticationService.setupAxiosInterceptors();

//             ReportService.getProcurementAgentExportData(programIds)
//                 .then(response => {
//                     console.log(JSON.stringify(response.data));
//                     this.setState({
//                         procurementAgents: response.data,
//                         message: ''
//                     })
//                 }).catch(
//                     error => {
//                         this.setState({
//                             procurementAgents: []
//                         })

//                         if (error.message === "Network Error") {
//                             this.setState({ message: error.message });
//                         } else {
//                             switch (error.response ? error.response.status : "") {
//                                 case 500:
//                                 case 401:
//                                 case 404:
//                                 case 406:
//                                 case 412:
//                                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
//                                     break;
//                                 default:
//                                     this.setState({ message: 'static.unkownError' });
//                                     break;
//                             }
//                         }
//                     }
//                 );
//         } else if (programIds.length == 0) {
//             this.setState({ message: i18n.t('static.common.selectProgram'), procurementAgents: [] });

//         } else {
//             this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), procurementAgents: [] });

//         }
//     }


//     getPrograms() {
//         AuthenticationService.setupAxiosInterceptors();
//         let realmId = AuthenticationService.getRealmId();
//         ProgramService.getProgramByRealmId(realmId)
//             .then(response => {
//                 console.log(JSON.stringify(response.data))
//                 this.setState({
//                     programs: response.data
//                 })
//             }).catch(
//                 error => {
//                     this.setState({
//                         programs: []
//                     })
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );
//     }


//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.getPrograms()
//     }

//     toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

//     onRadioBtnClick(radioSelected) {
//         this.setState({
//             radioSelected: radioSelected,
//         });
//     }
//     loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
//     render() {

//         const { programs } = this.state;
//         let programList = [];
//         programList = programs.length > 0
//             && programs.map((item, i) => {
//                 return (

//                     { label: getLabelText(item.label, this.state.lang), value: item.programId }

//                 )
//             }, this);
//         let consumptiondata = [];

//         return (
//             <div className="animated fadeIn" >
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
//                 <h5>{i18n.t(this.state.message)}</h5>

//                 <Card>
//                     <CardHeader>
//                         <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.procurementAgentExport')}</strong>
//                         {this.state.procurementAgents.length > 0 && <div className="card-header-actions">
//                             <a className="card-header-action">
//                                 <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
//                                 <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
//                             </a>
//                         </div>}
//                     </CardHeader>
//                     <CardBody>
//                         <div ref={ref}>
//                             <Form >
//                                 <Col md="2 pl-0">
//                                     <div className="row">
//                                         <FormGroup className="col-md-1">
//                                             <Label htmlFor="programIds">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
//                                             <InputGroup>
//                                                 <ReactMultiSelectCheckboxes
//                                                     bsSize="sm"
//                                                     name="programIds"
//                                                     id="programIds"
//                                                     onChange={(e) => { this.handleChangeProgram(e) }}
//                                                     options={programList && programList.length > 0 ? programList : []}
//                                                 />
//                                                 {!!this.props.error &&
//                                                     this.props.touched && (
//                                                         <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
//                                                     )}
//                                             </InputGroup>
//                                         </FormGroup>
//                                     </div>
//                                 </Col>
//                             </Form>
//                             <Col md="12 pl-0">

//                                 <div className="row">
//                                     <div className="col-md-12">
//                                         {this.state.procurementAgents.length > 0 &&

//                                             <Table responsive className="table-striped  table-hover table-bordered text-center mt-2">

//                                                 <thead>
//                                                     <tr>
//                                                         <th className="text-center "> Program Name </th>
//                                                         <th className="text-center"> Freight Cost Sea (%)</th>
//                                                         <th className="text-center"> Freight Cost Air (%)</th>
//                                                         <th className="text-center"> Plan to Draft LT (Months)</th>
//                                                         <th className="text-center"> Draft to Submitted LT (Months)</th>
//                                                         <th className="text-center"> Submitted to Approved LT (Months)</th>
//                                                         <th className="text-center"> Approved to Shipped LT (Months)</th>
//                                                         <th className="text-center"> Shipped to Arrived by Sea LT (Months)</th>
//                                                         <th className="text-center"> Shipped to Arrived by Air LT (Months)</th>
//                                                         <th className="text-center"> Arrived to Delivered LT (Months)</th>
//                                                         <th className="text-center"> Total LT By Sea (Months)</th>
//                                                         <th className="text-center"> Total LT By Air (Months)</th>
//                                                     </tr>
//                                                 </thead>

//                                                 <tbody>
//                                                     {

//                                                         this.state.procurementAgents.map((item, idx) =>

//                                                             <tr id="addr0" key={idx} >

//                                                                 <td>{getLabelText(this.state.procurementAgents[idx].label, this.state.lang)}</td>

//                                                                 <td>{this.state.procurementAgents[idx].seaFreightPerc}</td>
//                                                                 <td>{this.state.procurementAgents[idx].airFreightPerc}</td>

//                                                                 <td>{this.state.procurementAgents[idx].plannedToDraftLeadTime}</td>
//                                                                 <td>{this.state.procurementAgents[idx].draftToSubmittedLeadTime}</td>
//                                                                 <td>{this.state.procurementAgents[idx].submittedToApprovedLeadTime}</td>
//                                                                 <td>{this.state.procurementAgents[idx].approvedToShippedLeadTime}</td>
//                                                                 <td>{this.state.procurementAgents[idx].shippedToArrivedBySeaLeadTime}</td>
//                                                                 <td>{this.state.procurementAgents[idx].shippedToArrivedByAirLeadTime}</td>
//                                                                 <td>{this.state.procurementAgents[idx].arrivedToDeliveredLeadTime}</td>

//                                                                 <td>{this.state.procurementAgents[idx].plannedToDraftLeadTime + this.state.procurementAgents[idx].draftToSubmittedLeadTime + this.state.procurementAgents[idx].submittedToApprovedLeadTime + this.state.procurementAgents[idx].approvedToShippedLeadTime + this.state.procurementAgents[idx].shippedToArrivedBySeaLeadTime + this.state.procurementAgents[idx].arrivedToDeliveredLeadTime}</td>
//                                                                 <td>{this.state.procurementAgents[idx].plannedToDraftLeadTime + this.state.procurementAgents[idx].draftToSubmittedLeadTime + this.state.procurementAgents[idx].submittedToApprovedLeadTime + this.state.procurementAgents[idx].approvedToShippedLeadTime + this.state.procurementAgents[idx].shippedToArrivedByAirLeadTime + this.state.procurementAgents[idx].arrivedToDeliveredLeadTime}</td>
//                                                             </tr>)

//                                                     }
//                                                 </tbody>
//                                             </Table>
//                                         }

//                                     </div>
//                                 </div>
//                             </Col>

//                         </div>

//                     </CardBody>
//                 </Card>

//             </div>
//         );
//     }
// }
// export default ProcurementAgentExport


//mockups screen

import React, { Component } from 'react';
import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService.js";
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import ProgramService from '../../api/ProgramService';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}



const entityname = i18n.t('static.region.region');

class ProcurementAgentExport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            procurementAgentList: [],
            programList: [],
            planningUnitList: [],
            lang: localStorage.getItem('lang'),
            loading: true,
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
        }
        this.editRegion = this.editRegion.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.filterData(value);
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    filterData() {
        let countryId = document.getElementById("realmCountryId").value;
        if (countryId != 0) {
            const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
            this.setState({
                selRegion: selRegion
            });
        } else {
            this.setState({
                selRegion: this.state.regionList
            });
        }
    }
    editRegion(region) {
        this.props.history.push({
            pathname: `/region/editRegion/${region.regionId}`,
            // state: { region }
        });
    }
    addRegion(region) {
        this.props.history.push({
            pathname: "/region/addRegion"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();

        ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log("RESP----",response.data)
                    this.setState({
                        procurementAgentList: response.data,
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


        let realmId = AuthenticationService.getRealmId();
        ProgramService.getProgramByRealmId(realmId)
            .then(response => {
                console.log(JSON.stringify(response.data))
                this.setState({
                    programList: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        programs: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

        RegionService.getRegionList()
            .then(response => {
                console.log("RESP---", response.data);
                if (response.status == 200) {
                    this.setState({
                        regionList: response.data,
                        selRegion: [
                            {
                                "active": true,
                                "regionId": 1,
                                "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                                "procuremntAgent": "PSM",
                                "planningUnit": "Ceftriaxone 1 gm Vial,50 Vials",
                                "qty": "50,000",
                                "productCost": "7.00",
                                "totalProductCost": "350,000",
                                "freightPer": "10",
                                "freightCost": "35,000",
                                "totalCost": "385,000",
                            },
                            {
                                "active": true,
                                "regionId": 2,
                                "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                                "procuremntAgent": "GF",
                                "planningUnit": "Ceftriaxone 1 gm Vial,10 Vials",
                                "qty": "60,000",
                                "productCost": "8.00",
                                "totalProductCost": "480,000",
                                "freightPer": "12",
                                "freightCost": "57,600",
                                "totalCost": "537,600",
                            },
                            {
                                "active": true,
                                "regionId": 3,
                                "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                                "procuremntAgent": "PEPFAR",
                                "planningUnit": "Ceftriaxone 250 gm Powder Vial,10 Vials",
                                "qty": "40,000",
                                "productCost": "9.00",
                                "totalProductCost": "360,000",
                                "freightPer": "10",
                                "freightCost": "36,000",
                                "totalCost": "396,000",
                            },
                            {
                                "active": true,
                                "regionId": 4,
                                "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                                "procuremntAgent": "Local Procurement Agent",
                                "planningUnit": "Ceftriaxone 250 gm Powder Vial,1 Vial",
                                "qty": "50,000",
                                "productCost": "10.00",
                                "totalProductCost": "500,000",
                                "freightPer": "15",
                                "freightCost": "75,000",
                                "totalCost": "575,000",
                            }
                        ],
                        loading: false
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            })

        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmCountryList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    getPlanningUnit() {
        if (navigator.onLine) {
            console.log('changed')
            AuthenticationService.setupAxiosInterceptors();
            let programId = document.getElementById("programId").value;
            ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
                console.log('**' + JSON.stringify(response.data))
                this.setState({
                    planningUnitList: response.data,
                })
            })
                .catch(
                    error => {
                        this.setState({
                            planningUnitList: [],
                        })
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
        } else {
            const lan = 'en';
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                var planningunitRequest = planningunitOs.getAll();
                var planningList = []
                planningunitRequest.onerror = function (event) {
                    // Handle errors!
                };
                planningunitRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = planningunitRequest.result;
                    console.log("myResult", myResult);
                    var programId = (document.getElementById("programId").value).split("_")[0];
                    console.log('programId----->>>', programId)
                    console.log(myResult);
                    var proList = []
                    for (var i = 0; i < myResult.length; i++) {
                        if (myResult[i].program.id == programId) {
                            var productJson = {
                                name: getLabelText(myResult[i].planningUnit.label, lan),
                                id: myResult[i].planningUnit.id
                            }
                            proList[i] = productJson
                        }
                    }
                    console.log("proList---" + proList);
                    this.setState({
                        planningUnitList: proList
                    })
                }.bind(this);
            }.bind(this)

        }

    }

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { programList } = this.state;
        let programLists = programList.length > 0
            && programList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { planningUnitList } = this.state;
        let planningUnitLists = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnit.id}>
                        {getLabelText(item.planningUnit.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { procurementAgentList } = this.state;
        let procurementAgentLists = procurementAgentList.length > 0
            && procurementAgentList.map((item, i) => {
                return (
                    <option key={i} value={item.procurementAgentId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        const columns = [
            {
                dataField: 'procuremntAgent',
                text: 'Procurement Agent',
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'planningUnit',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'qty',
                text: 'Qty',
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'totalProductCost',
                text: 'Product Cost (USD)',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'freightPer',
                text: 'Freight (%)',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'freightCost',
                text: 'Freight Cost (USD)',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'totalCost',
                text: 'Total Cost (USD)',
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },

        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.selRegion.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>Procurement Agent Report</strong>{' '}
                        <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                    </CardHeader>
                    <CardBody className="pb-lg-0">

                        <Col md="12 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="Region-box-icon fa fa-sort-desc"></span></Label>
                                    <div className="controls SelectGo Regioncalender">
                                        <InputGroup>
                                            <Picker
                                                ref="pickRange"
                                                years={{ min: 2013 }}
                                                value={rangeValue}
                                                lang={pickerLang}
                                                //theme="light"
                                                onChange={this.handleRangeChange}
                                                onDismiss={this.handleRangeDissmis}
                                            >
                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                            </Picker>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Procuremnt Agent</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="procurementAgentId"
                                                id="procurementAgentId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {procurementAgentLists}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Program</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                onChange={this.getPlanningUnit}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {programLists}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {planningUnitLists}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Include Planned Shipments</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="shipmentStatusID"
                                                id="shipmentStatusID"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="1">Yes</option>
                                                <option value="2">No</option>
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>



                        <ToolkitProvider
                            keyField="regionId"
                            data={this.state.selRegion}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (

                                    <div className="TableCust listPrportFundingAlignThtd">
                                        <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            /* rowEvents={{
                                                 onClick: (e, row, rowIndex) => {
                                                     this.editRegion(row);
                                                 }
                                             }}*/
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default ProcurementAgentExport;
