import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Pie, HorizontalBar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Col,
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
import { SECRET_KEY } from '../../Constants.js'
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
// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

// Return with commas in between
var numberWithCommas = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var dataPack1 = [40, 47, 44, 38, 27];
var dataPack2 = [10, 12, 7, 5, 4];
var dataPack3 = [17, 11, 22, 18, 12];
var dates = ["Some l-o-o-o-o-o-o-o-o-o-o-o-n-n-n-n-n-n-g-g-g-g-g-g-g label", "AAA", "BBB", "CCC", "DDDDDDDDD"];

var bar_ctx = document.getElementById('bar-chart');
const colors = ['#004876', '#0063a0', '#007ecc', '#0093ee', '#82caf8', '#c8e6f4'];
const options = {
    title: {
        display: true,
        text: "Global Demand (Units)",
        fontColor: 'black'
    },
    scales: {
        xAxes: [{

            stacked: true,
            labelString: "Units",
            gridLines: {
                display: false
            },
        }],
        yAxes: [{
            stacked: true,
            labelString: "Planning Unit"
        }],
    },
    tooltips: {
        enabled: false,
        custom: CustomTooltips
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
const optionsPie = {
    title: {
        display: true,
        text: "Funding Source (USD)",
        fontColor: 'black'
    },
    legend: {
        position: 'bottom'
        //   labels: {
        //     boxWidth: 10
        //   }
    }
}

const chartData = {
    labels: ['Male Condom (Latex) Lubricated,Be Safe,53 mm,3000 Pieces', 'Female Condom (Nitrile) Lubricated, 17 cm,1000 Each', 'Female Condom (Nitrile) Lubricated, 17 cm, 20 Each'],
    datasets: [{
        label: 'Ordered Shipments',
        data: [20000, 10000, 2000],
        backgroundColor: '#6a82a8',
        borderWidth: 0

    },
    {
        label: 'Planned Shipments',
        data: [20000, 20000, 2000],
        backgroundColor: '#dee7f8',
        borderWidth: 0,
    }
    ]
};

// var bar_chart = new Chart(bar_ctx, {
//     type: 'bar',
//     data: chartData,
//     options: options,

// }
// );

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



class ShipmentGlobalDemandView extends Component {
    constructor(props) {
        super(props);

        this.toggledata = this.toggledata.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

        this.state = {
            labels: ['PSM', 'GF', 'Local', 'Govt'],
            datasets: [{
                data: [5615266, 13824000, 0, 26849952],
                backgroundColor: ['#4dbd74', '#f86c6b', '#8aa9e6', '#EDB944'],
                legend: {
                    position: 'bottom'
                }
            }],
            dropdownOpen: false,
            radioSelected: 2,
            lang: localStorage.getItem('lang'),
            countrys: [],
            versions: [],
            planningUnits: [],
            consumptions: [],
            productCategories: [],
            countryValues: [],
            countryLabels: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            programValues: [],
            programLabels: [],
            programs: [],
            message: '',
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



        };
        this.getCountrys = this.getCountrys.bind(this);
        this.filterData = this.filterData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPrograms = this.getPrograms.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.getRandomColor = this.getRandomColor.bind(this)
        this.handleChangeProgram = this.handleChangeProgram.bind(this)
        this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    exportCSV() {

        var csvRow = [];
        csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
        this.state.countryLabels.map(ele =>
            csvRow.push(i18n.t('static.dashboard.country') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        this.state.programLabels.map(ele =>
            csvRow.push(i18n.t('static.program.program') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.dashboard.productcategory')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        this.state.planningUnitLabels.map(ele =>
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        var re;

        var A = [[(i18n.t('static.dashboard.country')).replaceAll(' ', '%20'), (i18n.t('static.report.month')).replaceAll(' ', '%20'), (i18n.t('static.consumption.consumptionqty')).replaceAll(' ', '%20')]]

        re = this.state.consumptions

        for (var item = 0; item < re.length; item++) {
            A.push([[getLabelText(re[item].realmCountry.label), re[item].consumptionDateString, re[item].planningUnitQty]])
        }
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.globalconsumption') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
        document.body.appendChild(a)
        a.click()
    }



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
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()


            //  var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
            // var reader = new FileReader();

            //var data='';
            // Use fs.readFile() method to read the file 
            //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
            //}); 
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                /*doc.addImage(data, 10, 30, {
                  align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.globalconsumption'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.toString(), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 110, planningText)

                    planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString(), doc.internal.pageSize.width * 3 / 4);

                    doc.text(doc.internal.pageSize.width / 8, 130, planningText)
                    doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, this.state.programLabels.size > 2 ? 170 : 150, {
                        align: 'left'
                    })
                    planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);

                    doc.text(doc.internal.pageSize.width / 8, this.state.programLabels.size > 2 ? 190 : 170, planningText)
                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(10);

        const title = "Consumption Report";
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);

        doc.addImage(canvasImg, 'png', 50, 220, 750, 260, 'CANVAS');

        const headers = [[i18n.t('static.dashboard.country'), i18n.t('static.report.month'), i18n.t('static.consumption.consumptionqty')]]
        const data = this.state.consumptions.map(elt => [getLabelText(elt.realmCountry.label), elt.consumptionDateString, this.formatter(elt.planningUnitQty)]);

        let content = {
            margin: { top: 80 },
            startY: height,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

        };


        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("GlobalConsumption.pdf")
        //creates PDF from img
        /*  var doc = new jsPDF('landscape');
          doc.setFontSize(20);
          doc.text(15, 15, "Cool Chart");
          doc.save('canvas.pdf');*/
    }










    handleChange(countrysId) {

        this.setState({
            countryValues: countrysId.map(ele => ele.value),
            countryLabels: countrysId.map(ele => ele.label)
        }, () => {

            this.filterData(this.state.rangeValue)
        })
    }
    handleChangeProgram(programIds) {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.filterData(this.state.rangeValue)
        })

    }

    handlePlanningUnitChange(planningUnitIds) {

        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele.value),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            // this.filterData(this.state.rangeValue)
        })
    }


    filterData(rangeValue) {
        /*this.setState({
          consumptions: {date:["04-2019","05-2019","06-2019","07-2019"],countryData:[{label:"c1",value:[10,4,5,7]},
          {label:"c2",value:[13,2,8,7]},
          {label:"c3",value:[9,1,0,7]},
          {label:"c4",value:[5,4,3,7]}]}
        })
        */
        setTimeout('', 10000);
        let productCategoryId = document.getElementById("productCategoryId").value;
        let CountryIds = this.state.countryValues;
        let planningUnitIds = this.state.planningUnitValues;
        let programIds = this.state.programValues
        let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        if (CountryIds.length > 0 && planningUnitIds.length > 0 && programIds.length > 0) {

            var inputjson = {
                "realmCountryIds": CountryIds, "programIds": programIds, "planningUnitIds": planningUnitIds, "startDate": startDate, "stopDate": stopDate
            }
            console.log('***' + inputjson)
            AuthenticationService.setupAxiosInterceptors();

            ReportService.getGlobalConsumptiondata(inputjson)
                .then(response => {
                    console.log(JSON.stringify(response.data));
                    this.setState({
                        consumptions: response.data,
                        message: ''
                    })
                }).catch(
                    error => {
                        this.setState({
                            consumptions: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else if (CountryIds.length == 0) {
            this.setState({ message: i18n.t('static.program.validcountrytext'), consumptions: [] });

        } else if (programIds.length == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] });

        } else if (productCategoryId == -1) {
            this.setState({ message: i18n.t('static.common.selectProductCategory'), consumptions: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] });

        }
    }

    getCountrys() {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            RealmCountryService.getRealmCountryrealmIdById(realmId)
                .then(response => {
                    this.setState({
                        countrys: response.data
                    })
                }).catch(
                    error => {
                        this.setState({
                            countrys: []
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
                                default:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                    break;
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );

        } else {
            const lan = 'en';
            var db1;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['CountryData'], 'readwrite');
                var Country = transaction.objectStore('CountryData');
                var getRequest = Country.getAll();
                var proList = []
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
                            var bytes = CryptoJS.AES.decrypt(myResult[i].CountryName, SECRET_KEY);
                            var CountryNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                            var CountryJson = {
                                name: getLabelText(JSON.parse(CountryNameLabel), lan) + "~v" + myResult[i].version,
                                id: myResult[i].id
                            }
                            proList[i] = CountryJson
                        }
                    }
                    this.setState({
                        countrys: proList
                    })

                }.bind(this);

            }

        }


    }

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;

        if (versionId.includes('Local')) {
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
                    var programId = (document.getElementById("programId").value).split("_")[0];
                    var proList = []
                    console.log(myResult)
                    for (var i = 0; i < myResult.length; i++) {
                        if (myResult[i].program.id == programId) {

                            proList[i] = myResult[i]
                        }
                    }
                    this.setState({
                        planningUnits: proList, message: ''
                    })
                }.bind(this);
            }.bind(this)


        }
        else {
            AuthenticationService.setupAxiosInterceptors();
            console.log("programid----------------" + programId);
            //let productCategoryId = document.getElementById("productCategoryId").value;
            ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
                console.log('**' + JSON.stringify(response.data))
                this.setState({
                    planningUnits: response.data, message: ''
                }, () => {
                    // this.fetchData();
                })
            })
                .catch(
                    error => {
                        this.setState({
                            planningUnits: [],
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        }


    }
    getPrograms() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProgramService.getProgramByRealmId(realmId)
            .then(response => {
                console.log(JSON.stringify(response.data))
                this.setState({
                    programs: response.data
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
    }

    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (navigator.onLine) {
                    this.setState({
                        versions: []
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
                versions: []
            })
        }
    }
    consolidatedVersionList = (programId) => {
        const lan = 'en';
        const { versions } = this.state
        var verList = versions;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
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

                console.log(verList)
                this.setState({
                    versions: verList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                })

            }.bind(this);



        }.bind(this)


    }

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: []
        }, () => {
            if (versionId.includes('Local')) {
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
                        var programId = (document.getElementById("programId").value).split("_")[0];
                        var proList = []
                        console.log(myResult)
                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId) {

                                proList[i] = myResult[i]
                            }
                        }
                        this.setState({
                            planningUnits: proList, message: ''
                        }, () => {
                            this.fetchData();
                        })
                    }.bind(this);
                }.bind(this)


            }
            else {
                AuthenticationService.setupAxiosInterceptors();

                //let productCategoryId = document.getElementById("productCategoryId").value;
                ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
                    console.log('**' + JSON.stringify(response.data))
                    this.setState({
                        planningUnits: response.data, message: ''
                    }, () => {
                        this.fetchData();
                    })
                })
                    .catch(
                        error => {
                            this.setState({
                                planningUnits: [],
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
                                        this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                                        break;
                                    default:
                                        this.setState({ message: 'static.unkownError' });
                                        break;
                                }
                            }
                        }
                    );
            }
        });

    }
    fetchData = () => {
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;

        let planningUnitIds = this.state.planningUnitValues;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

        if (programId > 0 && versionId != 0 && planningUnitIds.length > 0) {
            if (versionId.includes('Local')) {
                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
                var openRequest = indexedDB.open('fasp', 1);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext')
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
                    console.log(program)
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        console.log(programRequest)
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var inventoryList = []
                        planningUnitIds.map(planningUnitId =>
                            inventoryList = [...inventoryList, ...((programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && moment(c.inventoryDate).isBetween(startDate, endDate, null, '[)')))]);
                        var dates = new Set(inventoryList.map(ele => ele.inventoryDate))
                        var data = []
                        planningUnitIds.map(planningUnitId => {
                            dates.map(dt => {

                                var list = inventoryList.filter(c => c.inventoryDate === dt && c.planningUnit.id == planningUnitId)
                                console.log(list)
                                if (list.length > 0) {
                                    var adjustment = 0;
                                    list.map(ele => adjustment = adjustment + ele.adjustmentQty);

                                    var json = {
                                        program: programJson,
                                        inventoryDate: new moment(dt).format('MMM YYYY'),
                                        planningUnit: list[0].planningUnit,
                                        stockAdjustemntQty: adjustment,
                                        lastModifiedBy: programJson.currentVersion.lastModifiedBy,
                                        lastModifiedDate: programJson.currentVersion.lastModifiedDate,
                                        notes: list[0].notes
                                    }
                                    data.push(json)
                                } else {

                                }
                            })
                        })
                        console.log(data)
                        this.setState({
                            data: data
                            , message: ''
                        })
                    }.bind(this)
                }.bind(this)
            } else {
                var inputjson = {
                    programId: programId,
                    versionId: versionId,
                    startDate: new moment(startDate),
                    stopDate: new moment(endDate),
                    planningUnitIds: planningUnitIds
                }
                AuthenticationService.setupAxiosInterceptors();
                ReportService.stockAdjustmentList(inputjson)
                    .then(response => {
                        console.log(JSON.stringify(response.data))
                        this.setState({
                            data: response.data
                        }, () => { this.consolidatedProgramList() })
                    }).catch(
                        error => {
                            this.setState({
                                data: []
                            }, () => { this.consolidatedProgramList() })
                            if (error.message === "Network Error") {
                                this.setState({ message: error.message });
                            } else {
                                switch (error.response ? error.response.status : "") {
                                    case 500:
                                    case 401:
                                    case 404:
                                    case 406:
                                    case 412:
                                        this.setState({ message: i18n.t(error.response.data.messageCode) });
                                        break;
                                    default:
                                        this.setState({ message: 'static.unkownError' });
                                        break;
                                }
                            }
                        }
                    );


            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [] });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

        }
    }
    handlePlanningUnitChange = (planningUnitIds) => {
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele.value),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            // this.fetchData()
        })
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.getPrograms();
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }

    show() {
        /* if (!this.state.showed) {
             setTimeout(() => {this.state.closeable = true}, 250)
             this.setState({ showed: true })
         }*/
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
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

    getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    render() {
        
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
                console.log("planningUnits---", planningUnits);
        const { programs } = this.state;
        let programList = [];
        programList = programs.length > 0
            && programs.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.programId }

                )
            }, this);
        const { countrys } = this.state;
        // console.log(JSON.stringify(countrys))
        let countryList = countrys.length > 0 && countrys.map((item, i) => {
            console.log(JSON.stringify(item))
            return ({ label: getLabelText(item.country.label, this.state.lang), value: item.realmCountryId })
        }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                return (
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
                    </option>
                )
            }, this);

        const backgroundColor = [
            '#4dbd74',
            '#c8ced3',
            '#000',
            '#ffc107',
            '#f86c6b',
        ]
        let country = [...new Set(this.state.consumptions.map(ele => (getLabelText(ele.realmCountry.label, this.state.lang))))]
        let consumptiondata = [];
        let data = [];
        for (var i = 0; i < country.length; i++) {
            data = this.state.consumptions.filter(c => country[i].localeCompare(getLabelText(c.realmCountry.label, this.state.lang)) == 0).map(ele => (ele.planningUnitQty))
            console.log(data)
            consumptiondata.push(data)
        }

        const bar = {

            labels: [...new Set(this.state.consumptions.map(ele => (ele.consumptionDateString)))],
            datasets: consumptiondata.map((item, index) => ({ stack: 1, label: country[index], data: item, backgroundColor: backgroundColor[index] }))
            /* datasets: [
               {
                 label: 'Actual Cconsumptionsonsuconsumptionsmption',
                 backgroundColor: '#86CD99',
                 borderColor: 'rgba(179,181,198,1)',
                 pointBackgroundColor: 'rgba(179,181,198,1)',
                 pointBorderColor: '#fff',
                 pointHoverBackgroundColor: '#fff',
                 pointHoverBorderColor: 'rgba(179,181,198,1)',
                 data: this.state.consumptions.map((item, index) => (item.Actual)),
               }, {
                 type: "line",
                 label: "Forecast Consumption",
                 backgroundColor: 'transparent',
                 borderColor: 'rgba(179,181,158,1)',
                 borderStyle: 'dotted',
                 ticks: {
                   fontSize: 2,
                   fontColor: 'transparent',
                 },
                 showInLegend: true,
                 yValueFormatString: "$#,##0",
                 data: this.state.consumptions.map((item, index) => (item.forcast))
               }
             ],*/

        };
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        return (
            <div className="animated fadeIn" >
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>

                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>Shipment Global Demand View</strong>
                        {/* {this.state.consumptions.length > 0 && */}
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />

                            </a>
                        </div>
                        {/* } */}
                    </CardHeader>
                    <CardBody>
                        <div ref={ref}>

                            <Form >
                                <Col md="12 pl-0">
                                    <div className="row">
                                        <FormGroup  className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="Region-box-icon fa fa-sort-desc"></span></Label>
                                            <div className="controls  Regioncalender">
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
                                                        <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>


                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">Program</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="programId"
                                                        id="programId"
                                                        bsSize="sm"
                                                        onChange={this.filterVersion}
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
                                        <FormGroup  className="col-md-3">
                                            <Label htmlFor="appendedInputButton">Version</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="versionId"
                                                        id="versionId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.getPlanningUnit(); }}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.select')}</option>
                                                        {versionList}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>

                                        <FormGroup  className="col-md-3">
                                            <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls">
                                                <InputGroup className="box">
                                                    <ReactMultiSelectCheckboxes
                                                        name="planningUnitId"
                                                        id="planningUnitId"
                                                        bsSize="md"
                                                        onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                    />

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </Col>
                            </Form>
                            <Col md="12 pl-0  mt-4">
                                <div className="row grid-divider">
                                    <Col md="8 pl-0">
                                        <div className="chart-wrapper" style={{ marginTop: '-5%' }}>
                                            <HorizontalBar id="cool-canvas" data={chartData} options={options} />
                                        </div>
                                    </Col>
                                    <Col md="4 pl-0">
                                        <div className="chart-wrapper">
                                            <Pie data={{
                                                labels: this.state.labels,
                                                datasets: this.state.datasets
                                            }} options={optionsPie}
                                            /><br />
                                        </div>
                                    </Col>
                                </div>
                            </Col>
                            <Col md="12 pl-0">
                                <div className="globalviwe-scroll">
                                    {/* <div className="row"> */}
                                    {/* <div className="col-md-12 p-0 grapg-margin " >
                                            <div className="col-md-12">
                                                <div className="chart-wrapper chart-graph-report"> */}
                                    {/* <canvas id="bar-chart" width="600" height="350"></canvas> */}
                                    {/* <Bar id="cool-canvas" data={chartData} 
                                     height='50%' /> */}
                                    {/* <Pie data={{
                                        labels: this.state.labels,
                                        datasets: this.state.datasets
                                    }}
                                        height='60%' /><br /> */}
                                    {/* </div>
                                            </div>
                                        </div> */}

                                    {/* {
                                        this.state.consumptions.length > 0
                                        && */}
                                    {/* <div className="col-md-12 p-0 grapg-margin " >
                                        <div className="col-md-12">
                                            <div className="chart-wrapper chart-graph-report">
                                                <HorizontalBar id="cool-canvas" data={chartData} options={options} height='60%' />
                                            </div>
                                        </div>
                                    </div> */}
                                    <div className="row">
                                        <div className="col-md-12">
                                            {/* {this.state.show && this.state.consumptions.length > 0 && */}
                                            <div className="table-responsive ">
                                                <Table responsive className="table-striped  table-fixed table-hover table-bordered text-center mt-2">

                                                    <thead>
                                                        <tr>
                                                            <th className="text-left" style={{ width: '300px' }} rowSpan="2"> Planning Unit </th>
                                                            <th className="text-center" style={{ width: '200px' }} colSpan="2">GF</th>
                                                            <th className="text-center" style={{ width: '200px' }} colSpan="2">Govt</th>
                                                            <th className="text-center" style={{ width: '200px' }} colSpan="2">Local</th>
                                                            <th className="text-center" style={{ width: '200px' }} colSpan="2">PSM</th>
                                                            <th className="text-center" style={{ width: '200px' }} colSpan="2">Total</th>
                                                        </tr>
                                                        <tr>
                                                            <th className="text-right" style={{ width: '100px' }}> Units </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Amount (USD) </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Units </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Amount (USD) </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Units </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Amount (USD) </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Units </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Amount (USD) </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Total Units </th>
                                                            <th className="text-right" style={{ width: '100px' }}> Total Amount (USD) </th>
                                                            {/* <th className="text-right " style={{ width: '350px' }}> GF</th>
                                                            <th className="text-right" style={{ width: '350px' }}>Gov't</th>
                                                            <th className="text-right" style={{ width: '350px' }}>Local</th>
                                                            <th className="text-right" style={{ width: '350px' }}>PSM</th>
                                                            <th className="text-right" style={{ width: '350px' }}>Total</th> */}
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        <tr id="addr0" key={1} >

                                                            <td className="text-left">Female Condom (Nitrile) Lubricated, 17 cm, 1000 Each</td>
                                                            <td className="text-right" style={{ width: '100px' }}>3,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>5,100,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>5,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>8,500,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}></td>
                                                            <td className="text-right" style={{ width: '100px' }}></td>
                                                            <td className="text-right" style={{ width: '100px' }}>7,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>11,900,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>15,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>25,500,000</td>
                                                        </tr>
                                                        <tr id="addr0" key={2} >

                                                            <td className="text-left">Female Condom (Nitrile) Lubricated, 17 cm, 20 Each</td>
                                                            <td className="text-right" style={{ width: '100px' }}>3,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>5,100,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>5,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>8,500,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}></td>
                                                            <td className="text-right" style={{ width: '100px' }}></td>
                                                            <td className="text-right" style={{ width: '100px' }}>7,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>11,900,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>15,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>25,500,000</td>
                                                        </tr>
                                                        <tr id="addr0" key={3} >

                                                            <td className="text-left">Male Condom (Latex) Lubricated,Be Safe, 53 mm, 3000 Pieces</td>
                                                            <td className="text-right" style={{ width: '100px' }}>3,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>5,100,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>5,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>8,500,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}></td>
                                                            <td className="text-right" style={{ width: '100px' }}></td>
                                                            <td className="text-right" style={{ width: '100px' }}>7,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>11,900,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>15,000</td>
                                                            <td className="text-right" style={{ width: '100px' }}>25,500,000</td>
                                                        </tr>
                                                        {/* <tr id="addr0" key={2} >

                                                            <td className="text-left">Female Condom (Nitrile) Lubricated, 17 cm, 20 Each </td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td className="text-right">5,612,440</td>
                                                            <td className="text-right">5,612,440</td>
                                                        </tr>
                                                        <tr id="addr0" key={3} >

                                                            <td className="text-left">Male Condom (Latex) Lubricated,Be Safe, 53 mm, 3000 Pieces </td>
                                                            <td className="text-right">13,824,000</td>
                                                            <td className="text-right">26,849,952</td>
                                                            <td></td>
                                                            <td></td>
                                                            <td className="text-right">40,673,952</td>
                                                        </tr> */}
                                                    </tbody>
                                                </Table>
                                            </div>
                                            {/* } */}

                                        </div>
                                    </div>
                                </div>
                            </Col>

                        </div>

                    </CardBody>
                </Card>

            </div>
        );
    }
}

export default ShipmentGlobalDemandView;