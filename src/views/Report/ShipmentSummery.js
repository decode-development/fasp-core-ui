import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Pie, HorizontalBar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { Online, Offline } from "react-detect-offline";
import {
    Badge,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    // CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Widgets,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Progress,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    CardColumns,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import paginationFactory from 'react-bootstrap-table2-paginator'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import i18n from '../../i18n'
import Pdf from "react-to-pdf"
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import RealmCountryService from '../../api/RealmCountryService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import ReportService from '../../api/ReportService';
import ProgramService from '../../api/ProgramService';
import MultiSelect from 'react-multi-select-component';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
const colors = ['#004876', '#0063a0', '#007ecc', '#0093ee', '#82caf8', '#c8e6f4'];

const options = {
    title: {
        display: true,
        text: "Shipments",
        fontColor: 'black'
    },
    scales: {
        xAxes: [{
            labelMaxWidth: 100,
            stacked: true,
            gridLines: {
                display: false
            },

            fontColor: 'black'
        }],
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.graph.costInUSD'),
                fontColor: 'black'
            },
            stacked: true,
            ticks: {
                beginAtZero: true,
                fontColor: 'black',
                callback: function (value) {
                    var cell1 = value
                    cell1 += '';
                    var x = cell1.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;

                }
            }
        }],
    },
    tooltips: {
        enabled: false,
        custom: CustomTooltips,
        callbacks: {
            label: function (tooltipItem, data) {

                let label = data.labels[tooltipItem.index];
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                var cell1 = value
                cell1 += '';
                var x = cell1.split('.');
                var x1 = x[0];
                var x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
            }
        }
    },
    maintainAspectRatio: false
    ,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor: 'black'
        }
    }
}

const chartData = {
    labels: ["Jan 2020", "Feb 2020", "Mar 2020", "Apr 2020", "May 2020", "Jun 2020", "Jul 2020", "Aug 2020", "Sep 2020", "Oct 2020", "Nov 2020", "Dec 2020"],
    datasets: [
        {
            label: 'Received',
            data: [0, 3740000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#042e6a',
            borderWidth: 0,
        },

        {
            label: 'Ordered',
            data: [0, 0, 0, 0, 5610000, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#6a82a8',
            borderWidth: 0,
        },
        {
            label: 'Planned',
            data: [0, 0, 0, 0, 0, 7480000, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#dee7f8',
            borderWidth: 0
        }

    ]
};


//Random Numbers
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var elements = 27;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
    data1.push(random(50, 200));
    data2.push(random(80, 100));
    data3.push(65);
}

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


class ShipmentSummery extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            planningUnitValues: [],
            planningUnitLabels: [],
            sortType: 'asc',
            dropdownOpen: false,
            radioSelected: 2,
            realms: [],
            programs: [],
            offlinePrograms: [],
            versions: [],
            planningUnits: [],
            consumptions: [],
            offlineConsumptionList: [],
            offlinePlanningUnitList: [],
            productCategories: [],
            offlineProductCategoryList: [],
            show: false,
            data: {},
            shipmentDetailsFundingSourceList: [],
            shipmentDetailsList: [],
            shipmentDetailsMonthList: [],
            message: '',
            viewById: 1,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 2 },
            maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() },
            loading: true,
            programId: '',
            versionId: ''
        };
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);

    }


    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    formatter = value => {

        var cell1 = value
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    dateFormatter = value => {
        return moment(value).format('MMM YY')
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV() {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version') + '  :  ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.planningUnitLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.display') + '  :  ' + document.getElementById("viewById").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')

        let viewById = this.state.viewById;


        var re;
        var A = [this.addDoubleQuoteToRowContent([(i18n.t('static.budget.fundingsource')).replaceAll(' ', '%20'), (i18n.t('static.report.orders')).replaceAll(' ', '%20'), (i18n.t('static.report.qtyBaseUnit')).replaceAll(' ', '%20'), (i18n.t('static.report.costUsd')).replaceAll(' ', '%20')])]

        this.state.shipmentDetailsFundingSourceList.map(ele => A.push(this.addDoubleQuoteToRowContent([(ele.fundingSource.code).replaceAll(' ', '%20'), ele.orderCount, ele.quantity, ele.cost])))

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }


        csvRow.push('')
        csvRow.push('')
        csvRow.push('')

        var B = [this.addDoubleQuoteToRowContent([(i18n.t('static.report.qatPIDFID')).replaceAll(' ', '%20'), (i18n.t('static.report.planningUnit/ForecastingUnit')).replaceAll(' ', '%20'), (i18n.t('static.report.id')).replaceAll(' ', '%20'),
        i18n.t('static.supplyPlan.consideAsEmergencyOrder').replaceAll(' ', '%20'), i18n.t('static.report.erpOrder').replaceAll(' ', '%20'),
        i18n.t('static.report.localprocurement').replaceAll(' ', '%20'), i18n.t('static.report.orderNo').replaceAll(' ', '%20').replaceAll('#', '%23'),
        (i18n.t('static.report.procurementAgentName')).replaceAll(' ', '%20'),
        (i18n.t('static.budget.fundingsource')).replaceAll(' ', '%20'), (i18n.t('static.common.status')).replaceAll(' ', '%20'), (i18n.t('static.report.qty')).replaceAll(' ', '%20'),
        (i18n.t('static.report.expectedReceiveddate')).replaceAll(' ', '%20'), (i18n.t('static.report.productCost')).replaceAll(' ', '%20'), (i18n.t('static.report.freightCost')).replaceAll(' ', '%20'),
        (i18n.t('static.report.totalCost')).replaceAll(' ', '%20'), (i18n.t('static.program.notes')).replaceAll(' ', '%20')])]


        re = this.state.shipmentDetailsList

        console.log('shipment detail length', re.length)
        for (var item = 0; item < re.length; item++) {
            //console.log(item,'===>',re[item])
            B.push(this.addDoubleQuoteToRowContent([re[item].planningUnit.id, (getLabelText(re[item].planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), re[item].shipmentId,
            re[item].emergencyOrder == true ? i18n.t('static.supplyPlan.consideAsEmergencyOrder').replaceAll(' ', '%20') : '',
            re[item].erpOrder == true ? i18n.t('static.report.erpOrder').replaceAll(' ', '%20') : '',
            re[item].localProcurement == true ? i18n.t('static.supplyPlan.localprocurement').replaceAll(' ', '%20') : '',
            re[item].orderNo != null ? re[item].orderNo : '', (re[item].procurementAgent.code).replaceAll(' ', '%20'), (re[item].fundingSource.code).replaceAll(' ', '%20'), (getLabelText(re[item].shipmentStatus.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
            viewById == 1 ? re[item].shipmentQty : (Number(re[item].shipmentQty) * re[item].multiplier).toFixed(2), (moment(re[item].expectedDeliveryDate, 'yyyy-MM-dd').format('MMM YYYY').replaceAll(',', ' ')).replaceAll(' ', '%20'),
            Number(re[item].productCost).toFixed(2),
            Number(re[item].freightCost).toFixed(2),
            Number(re[item].totalCost).toFixed(2),
            ((re[item].notes).replaceAll('#', ' ')).replaceAll(' ', '%20')
            ]))
        }
        for (var i = 0; i < B.length; i++) {
            console.log(B[i])
            csvRow.push(B[i].join(","))
        }

        var csvString = csvRow.join("%0A")
        console.log(csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.shipmentDetailReport') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
        document.body.appendChild(a)
        a.click()
    }


    exportPDF = () => {
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)

                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()


            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');

                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.shipmentDetailReport'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })

                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.common.display') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 170, planningText)


                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        // const title = "Consumption Report";
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 100;
        var aspectwidth1 = (width - h1);
        let startY = 170 + (this.state.planningUnitLabels.length * 3)
        doc.addImage(canvasImg, 'png', 50, startY, 750, 260, 'CANVAS');

        //Table1
        let content1 = {
            margin: { top: 80, bottom: 100 },
            startY: height,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 190, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 191.89 },
            },
            html: '#mytable1',

            didDrawCell: function (data) {
                if (data.column.index === 4 && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell.textPos;
                    doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
                }
            }
        };
        doc.autoTable(content1);

        //Table2
        let content2 = {
            margin: { top: 80, bottom: 100 },
            startY: doc.autoTableEndPosY() + 50,
            pageBreak: 'auto',
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 46, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 104.89 },
            },
            html: '#mytable2',

            didDrawCell: function (data) {
                if (data.column.index === 15 && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell.textPos;
                    doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
                }
            }
        };

        doc.autoTable(content2);


        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.shipmentDetailReport') + ".pdf")
        //creates PDF from img
        /* var doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text(15, 15, "Cool Chart");
        doc.save('canvas.pdf');*/
    }

    getPrograms = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data, loading: false
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
            // .catch(
            //     error => {
            //         this.setState({
            //             programs: [], loading: false
            //         }, () => { this.consolidatedProgramList() })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message, loading: false });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError', loading: false });
            //                     break;
            //             }
            //         }
            //     }
            // );

        } else {
            console.log('offline')
            this.setState({ loading: false })
            this.consolidatedProgramList()
        }

    }

    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        // console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].programId == programData.programId) {
                                f = 1;
                                console.log('already exist')
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                    }


                }
                var lang = this.state.lang;

                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.filterVersion();
                    })
                } else {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                    })
                }


            }.bind(this);

        }.bind(this);

    }

    filterVersion = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        if (programId != 0) {

            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            // console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        planningUnitValues: []

                    }, () => {
                        this.setState({
                            versions: program[0].versionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedVersionList(programId) });
                    });


                } else {
                    this.setState({
                        versions: []
                    }, () => { this.consolidatedVersionList(programId) })
                }
            } else {

                this.setState({
                    versions: []
                })

            }
        } else {
            this.setState({
                versions: [],
                planningUnits: [],
                planningUnitValues: []
            })
        }
        this.fetchData();
    }

    consolidatedVersionList = (programId) => {
        const lan = 'en';
        const { versions } = this.state
        var verList = versions;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion

                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)

                    }


                }

                // console.log(verList)


                if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
                    this.setState({
                        versions: verList.filter(function (x, i, a) {
                            return a.indexOf(x) === i;
                        }),
                        versionId: localStorage.getItem("sesVersionIdReport")
                    }, () => {
                        this.getPlanningUnit();
                    })
                } else {
                    this.setState({
                        versions: verList.filter(function (x, i, a) {
                            return a.indexOf(x) === i;
                        })
                    })
                }

            }.bind(this);



        }.bind(this)


    }

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: [],
            planningUnitValues: []
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] });
            } else {
                localStorage.setItem("sesVersionIdReport", versionId);
                if (versionId.includes('Local')) {
                    const lan = 'en';
                    var db1;
                    var storeOS;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                            var programId = (document.getElementById("programId").value).split("_")[0];
                            var proList = []
                            // console.log(myResult)
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {

                                    proList[i] = myResult[i]
                                }
                            }
                            var lang = this.state.lang;
                            this.setState({
                                planningUnits: proList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), message: ''
                            }, () => {
                                this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)


                }
                else {
                    // AuthenticationService.setupAxiosInterceptors();

                    //let productCategoryId = document.getElementById("productCategoryId").value;
                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        // console.log('**' + JSON.stringify(response.data))
                        this.setState({
                            planningUnits: response.data, message: ''
                        }, () => {
                            this.fetchData();
                        })
                    }).catch(
                        error => {
                            this.setState({
                                planningUnits: [],
                            })
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                            } else {
                                switch (error.response ? error.response.status : "") {

                                    case 401:
                                        this.props.history.push(`/login/static.message.sessionExpired`)
                                        break;
                                    case 403:
                                        this.props.history.push(`/accessDenied`)
                                        break;
                                    case 500:
                                    case 404:
                                    case 406:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                                            loading: false
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                        break;
                                }
                            }
                        }
                    );
                    // .catch(
                    //     error => {
                    //         this.setState({
                    //             planningUnits: [],
                    //         })
                    //         if (error.message === "Network Error") {
                    //             this.setState({ message: error.message });
                    //         } else {
                    //             switch (error.response ? error.response.status : "") {
                    //                 case 500:
                    //                 case 401:
                    //                 case 404:
                    //                 case 406:
                    //                 case 412:
                    //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                    //                     break;
                    //                 default:
                    //                     this.setState({ message: 'static.unkownError' });
                    //                     break;
                    //             }
                    //         }
                    //     }
                    // );
                }
            }
        });

    }

    handlePlanningUnitChange = (planningUnitIds) => {
        planningUnitIds = planningUnitIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }


    componentDidMount() {
        this.getPrograms();
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value
        }, () => {
            this.filterVersion();
        })
    }

    setVersionId(event) {
        this.setState({
            versionId: event.target.value
        }, () => {
            this.getPlanningUnit();
        })
    }

    fetchData = () => {
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let viewById = document.getElementById("viewById").value;

        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value));
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

        console.log("versionId----", versionId);
        console.log("programId----", programId);
        console.log("planningUnitIds---", planningUnitIds);


        if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0) {

            if (versionId.includes('Local')) {
                planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value));
                console.log("planninuit ids====>", planningUnitIds);
                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        loading: false
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                    var version = (versionId.split('(')[0]).trim()
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var program = `${programId}_v${version}_uId_${userId}`
                    var programDataOs = programDataTransaction.objectStore('programData');
                    // console.log("1----", program)
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        this.setState({ loading: true })
                        // console.log("2----", programRequest)
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var shipmentList = (programJson.shipmentList);
                        console.log("shipmentList------>", shipmentList);
                        const activeFilter = shipmentList.filter(c => c.active == true);
                        // const activeFilter = shipmentList;
                        console.log(startDate, endDate)
                        // let dateFilter = activeFilter.filter(c => moment(c.deliveredDate).isBetween(startDate, endDate, null, '[)'))
                        let dateFilter = activeFilter.filter(c => (c.receivedDate == null || c.receivedDate === '') ? (c.expectedDeliveryDate >= moment(startDate).format('YYYY-MM-DD') && c.expectedDeliveryDate <= moment(endDate).format('YYYY-MM-DD')) : (c.receivedDate >= moment(startDate).format('YYYY-MM-DD') && c.receivedDate <= moment(endDate).format('YYYY-MM-DD')))
                        console.log('dateFilter', dateFilter)
                        let data = [];
                        let planningUnitFilter = [];
                        for (let i = 0; i < planningUnitIds.length; i++) {
                            for (let j = 0; j < dateFilter.length; j++) {
                                if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                    planningUnitFilter.push(dateFilter[j]);
                                }
                            }
                        }
                        console.log('planningUnitFilter', planningUnitFilter)
                        var planningunitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('planningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        var planningList = [];

                        planningunitRequest.onerror = function (event) {
                            // Handle errors!
                            this.setState({
                                loading: false
                            })
                        };


                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            for (var k = 0; k < myResult.length; k++) {
                                var planningUnitObj = {
                                    id: myResult[k].planningUnitId,
                                    multiplier: myResult[k].multiplier
                                }
                                planningList[k] = planningUnitObj
                            }

                            console.log("planningList------>", planningList);




                            for (let i = 0; i < planningUnitFilter.length; i++) {
                                let multiplier = 0;
                                for (let j = 0; j < planningList.length; j++) {
                                    if (planningUnitFilter[i].planningUnit.id == planningList[j].id) {
                                        multiplier = planningList[j].multiplier;
                                        j = planningList.length;
                                    }
                                }

                                let json = {
                                    "shipmentId": planningUnitFilter[i].shipmentId,
                                    "planningUnit": planningUnitFilter[i].planningUnit,
                                    "forecastingUnit": planningUnitFilter[i].planningUnit.forecastingUnit,
                                    "multiplier": multiplier,
                                    "procurementAgent": planningUnitFilter[i].procurementAgent,
                                    "fundingSource": planningUnitFilter[i].fundingSource,
                                    "shipmentStatus": planningUnitFilter[i].shipmentStatus,
                                    "shipmentQty": planningUnitFilter[i].shipmentQty,
                                    "expectedDeliveryDate": planningUnitFilter[i].receivedDate == null || planningUnitFilter[i].receivedDate == '' ? planningUnitFilter[i].expectedDeliveryDate : planningUnitFilter[i].receivedDate,
                                    "productCost": planningUnitFilter[i].productCost * planningUnitFilter[i].currency.conversionRateToUsd,
                                    "freightCost": planningUnitFilter[i].freightCost * planningUnitFilter[i].currency.conversionRateToUsd,
                                    "totalCost": (planningUnitFilter[i].productCost * planningUnitFilter[i].currency.conversionRateToUsd) + (planningUnitFilter[i].freightCost * planningUnitFilter[i].currency.conversionRateToUsd),
                                    "notes": planningUnitFilter[i].notes,
                                    "emergencyOrder": planningUnitFilter[i].emergencyOrder,
                                    "erpFlag": planningUnitFilter[i].erpFlag,
                                    "localProcurement": planningUnitFilter[i].localProcurement,
                                    "orderNo": planningUnitFilter[i].orderNo
                                }
                                data.push(json);



                            }
                            data = data.sort(function (a, b) {
                                return parseInt(a.shipmentId) - parseInt(b.shipmentId);
                            })
                            var shipmentDetailsFundingSourceList = []
                            const fundingSourceIds = [...new Set(data.map(q => q.fundingSource.id))];
                            console.log('fundingSourceIds', fundingSourceIds)
                            fundingSourceIds.map(ele => {
                                var fundingSourceList = data.filter(c => c.fundingSource.id == ele)
                                console.log('fundingSourceList', fundingSourceList)
                                var cost = 0;
                                var quantity = 0;
                                console.log('fundingSourceList', fundingSourceList)
                                fundingSourceList.map(c => {
                                    cost = cost + Number(c.productCost) + Number(c.freightCost)
                                    quantity = quantity + (viewById == 1 ? Number(c.shipmentQty) : (Number(c.shipmentQty) * c.multiplier))
                                })
                                var json = {
                                    "fundingSource": fundingSourceList[0].fundingSource,
                                    "orderCount": fundingSourceList.length,
                                    "cost": cost,
                                    "quantity": quantity
                                }
                                shipmentDetailsFundingSourceList.push(json)
                            })
                            console.log("data ofline----->", data);
                            console.log("shipmentDetailsFundingSourceList ofline----->", shipmentDetailsFundingSourceList);

                            var shipmentDetailsMonthList = [];
                            var monthstartfrom = this.state.rangeValue.from.month
                            for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                                var monthlydata = [];
                                console.log(programJson)
                                for (var month = monthstartfrom; month <= 12; month++) {
                                    var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                                    var enddtStr = from + "-" + String(month).padStart(2, '0') + '-' + new Date(from, month, 0).getDate()
                                    console.log(dtstr, ' ', enddtStr)
                                    var dt = dtstr
                                    var shiplist = planningUnitFilter.filter(c => c.receivedDate == null || c.receivedDate == "" ? (c.expectedDeliveryDate >= dt && c.expectedDeliveryDate <= enddtStr) : (c.receivedDate >= dt && c.receivedDate <= enddtStr))

                                    var onholdCost = 0
                                    var plannedCost = 0
                                    var receivedCost = 0
                                    var shippedCost = 0
                                    var submittedCost = 0
                                    var approvedCost = 0
                                    var arrivedCost = 0
                                    var submittedCost = 0
                                    shiplist.map(ele => {
                                        console.log(ele)
                                        if (ele.shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                            plannedCost = plannedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                        } else if (ele.shipmentStatus.id == DRAFT_SHIPMENT_STATUS) {
                                            //  plannedCost=plannedCost+(ele.sortproductCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                        } else if (ele.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                            submittedCost = submittedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                        } else if (ele.shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                            approvedCost = approvedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                        } else if (ele.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS) {
                                            shippedCost = shippedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                        } else if (ele.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                            arrivedCost = arrivedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                        } else if (ele.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                            receivedCost = receivedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                        } else if (ele.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                            onholdCost = onholdCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                        }
                                    })

                                    let json = {
                                        "dt": new Date(from, month - 1),
                                        "approvedCost": approvedCost,
                                        "arrivedCost": arrivedCost,
                                        "onholdCost": onholdCost,
                                        "plannedCost": plannedCost,
                                        "receivedCost": receivedCost,
                                        "shippedCost": shippedCost,
                                        "submittedCost": submittedCost
                                    }
                                    shipmentDetailsMonthList.push(json)
                                    if (month == this.state.rangeValue.to.month && from == to) {
                                        console.log('shipmentDetailsMonthList', shipmentDetailsMonthList)
                                        this.setState({
                                            shipmentDetailsList: data,
                                            shipmentDetailsFundingSourceList: shipmentDetailsFundingSourceList,
                                            shipmentDetailsMonthList: shipmentDetailsMonthList,
                                            message: '',
                                            viewById: viewById, loading: false
                                        })
                                        return;
                                    }

                                }
                                monthstartfrom = 1

                            }


                        }.bind(this)
                    }.bind(this);
                }.bind(this)
            } else {
                this.setState({ loading: true })
                var inputjson = {
                    programId: programId,
                    versionId: versionId,
                    startDate: startDate,
                    stopDate: endDate,
                    planningUnitIds: planningUnitIds,
                    reportView: viewById
                }

                // console.log("inputJson---->", inputjson);
                ReportService.ShipmentSummery(inputjson)
                    .then(response => {

                        console.log("RESP-------->", response.data);
                        this.setState({
                            data: response.data,
                            shipmentDetailsFundingSourceList: response.data.shipmentDetailsFundingSourceList,
                            shipmentDetailsList: response.data.shipmentDetailsList,
                            shipmentDetailsMonthList: response.data.shipmentDetailsMonthList,
                            viewById: viewById,
                            message: '',
                            loading: false
                        }
                        )
                    }).catch(
                        error => {
                            this.setState({
                                data: [], loading: false
                            })
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                            } else {
                                switch (error.response ? error.response.status : "") {

                                    case 401:
                                        this.props.history.push(`/login/static.message.sessionExpired`)
                                        break;
                                    case 403:
                                        this.props.history.push(`/accessDenied`)
                                        break;
                                    case 500:
                                    case 404:
                                    case 406:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode),
                                            loading: false
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                        break;
                                }
                            }
                        }
                    );
                // .catch(
                //     error => {
                //         this.setState({
                //             data: [], loading: false
                //         })
                //         if (error.message === "Network Error") {
                //             this.setState({ message: error.message, loading: false });
                //         } else {
                //             switch (error.response ? error.response.status : "") {
                //                 case 500:
                //                 case 401:
                //                 case 404:
                //                 case 406:
                //                 case 412:
                //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode) });
                //                     break;
                //                 default:
                //                     this.setState({ message: 'static.unkownError', loading: false });
                //                     break;
                //             }
                //         }
                //     }
                // );


            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [] });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] });

        } else if (this.state.planningUnitValues.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });
        }
    }


    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData();
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }


    render() {
        const { programs } = this.state

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);

        const { planningUnits } = this.state
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        const { rangeValue } = this.state;

        var viewById = this.state.viewById;

        const backgroundColor = [
            '#002f6c',
            '#20a8d8',
            '#118b70',
            '#EDB944',
            '#d1e3f5',
        ]
        /*
                //Graph start
                let shipmentStatus = [...new Set(this.state.data.map(ele => (getLabelText(ele.shipmentStatus.label, this.state.lang))))];
                console.log("shipmentStatus=======>>>", shipmentStatus.sort());
                shipmentStatus=shipmentStatus.sort()
                let shipmentSummerydata = [];
                let data = [];
                var mainData = this.state.data;
                mainData = mainData.sort(function (a, b) {
                    return new Date(a.expectedDeliveryDate) - new Date(b.expectedDeliveryDate);
                });
                console.log("mainData=======>>>>", mainData);
                let dateArray = [...new Set(mainData.map(ele => (moment(ele.expectedDeliveryDate, 'YYYY-MM-dd').format('MM-YYYY'))))]
        
                console.log("dateArray=====>", dateArray);
        
                for (var i = 0; i < shipmentStatus.length; i++) {
        
                    let data1 = mainData.filter(c => shipmentStatus[i].localeCompare(getLabelText(c.shipmentStatus.label, this.state.lang)) == 0).map((item) => {
                        return {
                            shipmentId: item.shipmentId,
                            expectedDeliveryDate: (moment(item.expectedDeliveryDate, 'YYYY-MM-dd').format('MM-YYYY')),
                            totalCost: item.totalCost,
                            forecastCost: item.totalCost * item.multiplier
                        }
                    });
        
                    //logic for add same date data
                    // let result = Object.values(data1.reduce((a, { shipmentId, totalCost, expectedDeliveryDate, forecastCost }) => {
                    //     if (!a[expectedDeliveryDate])
                    //         a[expectedDeliveryDate] = Object.assign({}, { shipmentId, totalCost, expectedDeliveryDate, forecastCost });
                    //     else
                    //         a[expectedDeliveryDate].totalCost += totalCost;
                    //     a[expectedDeliveryDate].forecastCost += forecastCost;
                    //     return a;
                    // }, {}));
        
        
                    var result1 = data1.reduce(function (data1, val) {
                        var o = data1.filter(function (obj) {
                            return obj.expectedDeliveryDate == val.expectedDeliveryDate;
                        }).pop() || { expectedDeliveryDate: val.expectedDeliveryDate, shipmentId: val.shipmentId, totalCost: 0, forecastCost: 0 };
        
                        o.totalCost += val.totalCost;
                        o.forecastCost += val.forecastCost;
                        data1.push(o);
                        return data1;
                    }, []);
                    var result = result1.filter(function (itm, i, a) {
                        return i == a.indexOf(itm);
                    });
                    console.log("result====>", result);
                    let tempdata = [];
                    for (var j = 0; j < dateArray.length; j++) {
                        let hold = 0
                        for (var k = 0; k < result.length; k++) {
                            if (moment(dateArray[j], 'MM-YYYY').isSame(moment(result[k].expectedDeliveryDate, 'MM-YYYY'))) {
                                hold = viewById == 1 ? result[k].totalCost : result[k].forecastCost;
                                k = result.length;
                            } else {
                                hold = 0;
                            }
                        }
                        hold = parseFloat(hold).toFixed(2)
                        tempdata.push(hold);
        
                    }
                    console.log("tempdata==>", tempdata);
                    shipmentSummerydata.push(tempdata);
        
                }
        
                console.log("shipmentSummeryData===>", shipmentSummerydata);
                const bar = {
                    labels: [...new Set(mainData.map(ele => (moment(ele.expectedDeliveryDate, 'YYYY-MM-dd').format('MMM YYYY'))))],
                    datasets: shipmentSummerydata.map((item, index) => ({ label: shipmentStatus[index], data: item, backgroundColor: backgroundColor[index] })),
                };
                //Graph end
        
                //Table-1 start
        
                let tempDataTable = mainData.map((item) => {
                    return {
                        shipmentId: item.shipmentId,
                        fundingSource: item.fundingSource,
                        shipmentQty: item.shipmentQty,
                        totalCost: item.totalCost,
                        forecastCost: item.totalCost * item.multiplier
                    }
                });
        
                console.log("tempDataTable------>>", tempDataTable);
        
                var result1 = tempDataTable.reduce(function (tempDataTable, val) {
                    var o = tempDataTable.filter(function (obj) {
                        return obj.fundingSource.id == val.fundingSource.id;
                    }).pop() || { fundingSource: val.fundingSource, shipmentId: val.shipmentId, shipmentQty: 0, totalCost: 0, forecastCost: 0 };
        
                    o.shipmentQty += val.shipmentQty;
                    o.totalCost += val.totalCost;
                    o.forecastCost += val.forecastCost;
                    tempDataTable.push(o);
                    return tempDataTable;
                }, []);
                var result = result1.filter(function (itm, i, a) {
                    return i == a.indexOf(itm);
                });
        
                console.log("RESULT------->", result);
        
                // let result = Object.values(tempDataTable.reduce((a, { shipmentId, fundingSource, shipmentQty, totalCost, forecastCost }) => {
                //     if (!a[fundingSource.id])
                //         a[fundingSource.id] = Object.assign({}, { shipmentId, fundingSource, shipmentQty, totalCost, forecastCost });
                //     else
                //         a[fundingSource.id].totalCost += totalCost;
                //     a[fundingSource.id].shipmentQty += shipmentQty;
                //     a[fundingSource.id].forecastCost += forecastCost;
                //     return a;
                // }, {}));
                // console.log("RESULT------>>", result);
        
        
                //yessolution
                // var arr = [
                //     { 'name': 'P1', 'value': 150, 'value1': 150 },
                //     { 'name': 'P1', 'value': 150, 'value1': 150 },
                //     { 'name': 'P2', 'value': 200, 'value1': 150 },
                //     { 'name': 'P3', 'value': 450, 'value1': 150 }
                // ];
                // var result1 = arr.reduce(function (acc, val) {
                //     var o = acc.filter(function (obj) {
                //         return obj.name == val.name;
                //     }).pop() || { name: val.name, value: 0, value1: 0 };
        
                //     o.value += val.value;
                //     o.value1 += val.value1;
                //     acc.push(o);
                //     return acc;
                // }, []);
                // var finalresult = result1.filter(function (itm, i, a) {
                //     return i == a.indexOf(itm);
                // });
                // console.log("result1------->>>>>>>>>>", finalresult);
        
        
        
                let perResult = [];
                for (var k = 0; k < result.length; k++) {
                    let count = 0;
                    for (var p = 0; p < mainData.length; p++) {
                        if (result[k].fundingSource.id == mainData[p].fundingSource.id) {
                            count = count + 1;
                        }
                    }
                    let json = {
                        shipmentId: result[k].shipmentId,
                        fundingSource: result[k].fundingSource,
                        shipmentQty: result[k].shipmentQty,
                        totalCost: viewById == 1 ? result[k].totalCost : result[k].forecastCost,
                        orders: count
                    }
                    perResult.push(json);
                }
        
                perResult = perResult.sort((a, b) => parseFloat(b.orders) - parseFloat(a.orders));
        
                // console.log("perResult-------->>", perResult);
        
                //Table-1 end
        
        */
        const bar = {

            labels: this.state.shipmentDetailsMonthList.map((item, index) => (this.dateFormatter(item.dt))),
            datasets: [{
                label: i18n.t('static.supplyPlan.delivered'),
                stack: 1,
                backgroundColor: '#118b70',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.receivedCost))

            }, {
                label: i18n.t('static.report.arrived'),
                backgroundColor: '#436e94',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                stack: 1,
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.arrivedCost
                ))
            },
            {
                label: i18n.t('static.report.shipped'),
                stack: 1,
                backgroundColor: '#1d97c2',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.shippedCost
                ))
            },
            {
                label: i18n.t('static.supplyPlan.ordered'),
                backgroundColor: '#669cdf',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                stack: 1,
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.approvedCost
                ))
            },

            {
                label: i18n.t('static.report.submitted'),
                stack: 1,
                backgroundColor: '#20a8d8',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.submittedCost
                ))
            },
            {
                label: i18n.t('static.report.planned'),
                backgroundColor: '#a5c5ec',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                stack: 1,
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.plannedCost
                ))
            },
            {
                label: i18n.t('static.report.hold'),
                stack: 1,
                backgroundColor: '#7372cb',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.onholdCost
                ))
            }

            ]
        };

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">


                        {
                            this.state.shipmentDetailsMonthList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />

                                    {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>

 
 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }


                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <div className="" >
                            <div ref={ref}>
                                <Form >
                                    {/* <Col md="12 pl-0"> */}
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls  Regioncalender">
                                                    {/* <InputGroup> */}
                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={rangeValue}
                                                        lang={pickerLang}
                                                        //theme="light"
                                                        onChange={this.handleRangeChange}
                                                        onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>

                                                    {/* </InputGroup> */}
                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            // onChange={this.filterVersion}
                                                            // onChange={(e) => { this.filterVersion(); }}
                                                            onChange={(e) => { this.setProgramId(e); }}
                                                            value={this.state.programId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programs.length > 0
                                                                && programs.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.programId}>
                                                                            {getLabelText(item.label, this.state.lang)}
                                                                        </option>
                                                                    )
                                                                }, this)}

                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            // onChange={(e) => { this.getPlanningUnit(); }}
                                                            onChange={(e) => { this.setVersionId(e); }}
                                                            value={this.state.versionId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {versionList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls">

                                                    <MultiSelect
                                                        name="planningUnitId"
                                                        id="planningUnitId"
                                                        bsSize="md"
                                                        value={this.state.planningUnitValues}
                                                        onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                    />


                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="viewById"
                                                            id="viewById"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="1">{i18n.t('static.report.planningUnit')}</option>
                                                            <option value="2">{i18n.t('static.dashboard.forecastingunit')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                        {/* </Col> */}
                                    </div>
                                </Form>

                                <Col md="12 pl-0">
                                    <div className="row">
                                        {
                                            this.state.shipmentDetailsMonthList.length > 0
                                            &&
                                            <div className="col-md-12 p-0">
                                                <div className="col-md-12">
                                                    <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                                                        {/* <Bar id="cool-canvas" data={bar} options={options} /> */}
                                                        <Bar id="cool-canvas" data={bar} options={options} />
                                                    </div>
                                                </div>
                                                {/* <div className="col-md-12">
                                                        <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" style={{ 'marginTop': '7px' }} onClick={this.toggledata}>
                                                            {this.state.show ? 'Hide Data' : 'Show Data'}
                                                        </button>

                                                    </div> */}
                                            </div>
                                        }




                                    </div>


                                    <div className="row">
                                        <div className="col-md-12 pl-0 pr-0">
                                            {this.state.shipmentDetailsFundingSourceList.length > 0 &&
                                                <Table id="mytable1" responsive className="table-bordered table-striped table-hover  text-center mt-2">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '225px', cursor: 'pointer', 'text-align': 'center' }}>{i18n.t('static.budget.fundingsource')}</th>
                                                            <th style={{ width: '225px', cursor: 'pointer', 'text-align': 'right' }}>{i18n.t('static.report.orders')}</th>
                                                            <th style={{ width: '225px', cursor: 'pointer', 'text-align': 'right' }}>{i18n.t('static.report.qtyBaseUnit')}</th>
                                                            <th style={{ width: '225px', cursor: 'pointer', 'text-align': 'right' }}>{i18n.t('static.report.costUsd')}</th>
                                                        </tr>
                                                    </thead>
                                                    {/* <tbody>
                                                        <tr>
                                                            <td style={{ 'text-align': 'center' }}>Global Fund</td>
                                                            <td style={{ 'text-align': 'right' }}>2</td>
                                                            <td style={{ 'text-align': 'right' }}>5,000</td>
                                                            <td style={{ 'text-align': 'right' }}>9,350,000</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ 'text-align': 'center' }}>GHSC-PSM</td>
                                                            <td style={{ 'text-align': 'right' }}>1</td>
                                                            <td style={{ 'text-align': 'right' }}>4,000</td>
                                                            <td style={{ 'text-align': 'right' }}>7,480,000</td>
                                                        </tr>
                                                    </tbody> */}
                                                    <tbody>
                                                        {this.state.shipmentDetailsFundingSourceList.length > 0 &&
                                                            this.state.shipmentDetailsFundingSourceList.map((item, idx) =>
                                                                <tr id="addr0" key={idx} >
                                                                    <td style={{ 'text-align': 'center' }}>{getLabelText(this.state.shipmentDetailsFundingSourceList[idx].fundingSource.label, this.state.lang)}</td>
                                                                    <td style={{ 'text-align': 'right' }}>{this.state.shipmentDetailsFundingSourceList[idx].orderCount}</td>
                                                                    <td style={{ 'text-align': 'right' }}>{(this.state.shipmentDetailsFundingSourceList[idx].quantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                    <td style={{ 'text-align': 'right' }}>{(Number(this.state.shipmentDetailsFundingSourceList[idx].cost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                </tr>
                                                            )}
                                                    </tbody>

                                                </Table>}
                                        </div>
                                    </div>


                                    <div className="row ">
                                        <div className="col-md-12 pl-0 pr-0 mb-2">
                                            {this.state.shipmentDetailsList.length > 0 &&
                                                <Table id="mytable2" responsive className="table-striped table-hover table-bordered text-center mt-2">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.report.planningUnit/ForecastingUnit')}</th>
                                                            <th style={{ 'width': '87px', 'text-align': 'center' }}>{i18n.t('static.report.id')}</th>
                                                            <th style={{ 'width': '87px', 'text-align': 'center' }}>{i18n.t('static.supplyPlan.consideAsEmergencyOrder')}</th>
                                                            <th style={{ 'width': '87px', 'text-align': 'center' }}>{i18n.t('static.report.erpOrder')}</th>
                                                            <th style={{ 'width': '87px', 'text-align': 'center' }}>{i18n.t('static.report.localprocurement')}</th>
                                                            <th style={{ 'width': '87px', 'text-align': 'center' }}>{i18n.t('static.report.orderNo')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.report.procurementAgentName')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.budget.fundingsource')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.common.status')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.report.qty')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.report.expectedReceiveddate')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.report.productCost')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.report.freightCost')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.report.totalCost')}</th>
                                                            <th style={{ 'text-align': 'center' }}>{i18n.t('static.program.notes')}</th>
                                                        </tr>

                                                    </thead>

                                                    {/* <tbody>
                                                        <tr>
                                                            <td style={{ 'text-align': 'left' }}>Ceftriaxone 1 gm Powder Vial, 10 Vials</td>
                                                            <td style={{ 'width': '87px' }}>01</td>
                                                            <td>PEPFAR</td>
                                                            <td>Global Fund</td>
                                                            <td>Received</td>
                                                            <td style={{ 'text-align': 'right' }}>2,000</td>
                                                            <td>Apr-25-2020</td>
                                                            <td style={{ 'text-align': 'right' }}>3,400,000</td>
                                                            <td style={{ 'text-align': 'right' }}>340,000</td>
                                                            <td style={{ 'text-align': 'right' }}>3,740,000</td>
                                                            <td style={{ 'text-align': 'right' }}>1</td>
                                                            <td></td>
                                                        </tr>

                                                        <tr>
                                                            <td style={{ 'text-align': 'left' }}>Ceftriaxone 1 gm Powder Vial, 10 Vials</td>
                                                            <td>02</td>
                                                            <td>PEPFAR</td>
                                                            <td>Global Fund</td>
                                                            <td>Ordered</td>
                                                            <td style={{ 'text-align': 'right' }}>3,000</td>
                                                            <td>Sep-25-2020</td>
                                                            <td style={{ 'text-align': 'right' }}>5,100,000</td>
                                                            <td style={{ 'text-align': 'right' }}>510,000</td>
                                                            <td style={{ 'text-align': 'right' }}>5,610,000</td>
                                                            <td style={{ 'text-align': 'right' }}>1.5</td>
                                                            <td></td>
                                                        </tr>

                                                        <tr>
                                                            <td style={{ 'text-align': 'left' }}>Ceftriaxone 1 gm Powder Vial, 10 Vials</td>
                                                            <td>03</td>
                                                            <td>PEPFAR</td>
                                                            <td>GHSC-PSM</td>
                                                            <td>Planned</td>
                                                            <td style={{ 'text-align': 'right' }}>4,000</td>
                                                            <td>Nov-25-2020</td>
                                                            <td style={{ 'text-align': 'right' }}>6,800,000</td>
                                                            <td style={{ 'text-align': 'right' }}>680,000</td>
                                                            <td style={{ 'text-align': 'right' }}>7,480,000</td>
                                                            <td style={{ 'text-align': 'right' }}>2</td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody> */}

                                                    <tbody>
                                                        {this.state.shipmentDetailsList.length > 0 &&
                                                            this.state.shipmentDetailsList.map((item, idx) =>
                                                                <tr id="addr0" key={idx} >
                                                                    <td style={{ 'text-align': 'left' }}>{getLabelText(this.state.shipmentDetailsList[idx].planningUnit.label, this.state.lang)}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{this.state.shipmentDetailsList[idx].shipmentId}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{(this.state.shipmentDetailsList[idx].emergencyOrder == true ? i18n.t('static.supplyPlan.consideAsEmergencyOrder') : '')}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{(this.state.shipmentDetailsList[idx].erpOrder == true ? i18n.t('static.report.erpOrder') : '')}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{(this.state.shipmentDetailsList[idx].localProcurement == true ? i18n.t('static.report.localprocurement') : '')}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{(this.state.shipmentDetailsList[idx].orderNo != null ? this.state.shipmentDetailsList[idx].orderNo : '')}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{this.state.shipmentDetailsList[idx].procurementAgent.code}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{this.state.shipmentDetailsList[idx].fundingSource.code}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{getLabelText(this.state.shipmentDetailsList[idx].shipmentStatus.label, this.state.lang)}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{viewById == 1 ? (this.state.shipmentDetailsList[idx].shipmentQty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : (Number(this.state.shipmentDetailsList[idx].shipmentQty) * this.state.shipmentDetailsList[idx].multiplier).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{moment(this.state.shipmentDetailsList[idx].expectedDeliveryDate, 'yyyy-MM-dd').format('MMM YYYY')}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{(Number(this.state.shipmentDetailsList[idx].productCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                    <td style={{ 'text-align': 'center' }}>{(Number(this.state.shipmentDetailsList[idx].freightCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                    {/* <td style={{ 'text-align': 'right' }}>{viewById == 1 ? (parseFloat(this.state.data[idx].productCost+this.state.data[idx].freightCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : (parseFloat((this.state.data[idx].productCost+this.state.data[idx].freightCost) * this.state.data[idx].multiplier).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td> */}
                                                                    <td style={{ 'text-align': 'center' }}>{(Number(this.state.shipmentDetailsList[idx].totalCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                    <td style={{ 'text-align': 'left' }}>{this.state.shipmentDetailsList[idx].notes}</td>
                                                                </tr>
                                                            )}
                                                    </tbody>


                                                </Table>}
                                        </div>
                                    </div>

                                </Col>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

export default ShipmentSummery;
