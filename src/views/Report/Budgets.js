import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BudgetServcie from '../../api/BudgetService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n';
import { Bar, HorizontalBar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import ProgramService from '../../api/ProgramService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import FundingSourceService from '../../api/FundingSourceService';
import moment from 'moment';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

import CryptoJS from 'crypto-js'
import { SECRET_KEY, DATE_FORMAT_CAP } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ReportService from '../../api/ReportService';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
const ref = React.createRef();
const entityname = i18n.t('static.dashboard.budget');
const chartoptions =
{
    scales: {

        yAxes: [{
            id: 'A',
            position: 'left',
            scaleLabel: {
                display: true,
                fontSize: "12",
                fontColor: 'blue'
            },
            ticks: {
                beginAtZero: true,
                fontColor: 'blue'
            },

        }],
        xAxes: [{
            ticks: {
                fontColor: 'black'
            }
        }]
    },

    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor: 'black'
        }
    }
}


class Budgets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            budgetList: [],
            lang: localStorage.getItem('lang'),
            message: '',
            selBudget: [],
            programValues: [],
            programLabels: [],
            programs: [],
            versions: [],
            show: false
            //loading: true
        }


        this.formatDate = this.formatDate.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.addCommas = this.addCommas.bind(this);
        this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    hideFirstComponent() {
        setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
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
    exportCSV = (columns) => {

        var csvRow = [];
        csvRow.push((i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.report.version') + ' , ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        var re;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        var A = [headers]
        this.state.selBudget.map(ele => A.push([(getLabelText(ele.budget.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.budget.code, (getLabelText(ele.program.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.program.code, (getLabelText(ele.fundingSource.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.currency.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.budgetAmt, ele.plannedBudgetAmt, ele.orderedBudgetAmt, (ele.budgetAmt - (ele.plannedBudgetAmt + ele.orderedBudgetAmt)), this.formatDate(ele.startDate), this.formatDate(ele.stopDate)]));

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.budgetheader') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    exportPDF = (columns) => {
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
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')

                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.budgetheader'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })

                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.selBudget.map(ele => [getLabelText(ele.budget.label), ele.budget.code, getLabelText(ele.program.label), ele.program.code, getLabelText(ele.fundingSource.label), getLabelText(ele.currency.label), this.formatter(ele.budgetAmt), this.formatter(ele.plannedBudgetAmt), this.formatter(ele.orderedBudgetAmt), this.formatter(ele.budgetAmt - (ele.plannedBudgetAmt + ele.orderedBudgetAmt)), this.formatDate(ele.startDate), this.formatDate(ele.stopDate)]);

        let content = {
            margin: { top: 80 },
            startY: 170,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 60 },
            columnStyles: {
                0: { cellWidth: 74.89 },
                2: { cellWidth: 73.5 },
                4: { cellWidth: 73.5 },
            }

        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.budgetheader') + ".pdf")
    }



    filterData() {
        let programId = document.getElementById('programId').value
        let versionId = document.getElementById('versionId').value
        // console.log('programIds.length', programIds.length)
        if (programId.length != 0 && versionId != 0) {
            if (versionId.includes('Local')) {

                var db1;
                getDatabase();
                var openRequest = indexedDB.open('fasp', 1);

                var procurementAgentList = [];
                var fundingSourceList = [];
                var budgetList = [];
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;

                    var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                    var budgetOs = budgetTransaction.objectStore('budget');
                    var budgetRequest = budgetOs.getAll();

                    budgetRequest.onsuccess = function (event) {
                        var budgetResult = [];
                        budgetResult = budgetRequest.result;
                        for (var k = 0, j = 0; k < budgetResult.length; k++) {
                            if (budgetResult[k].program.id == programId)
                                budgetList[j++] = budgetResult[k]
                        }
                        var transaction = db1.transaction(['programData'], 'readwrite');
                        var programTransaction = transaction.objectStore('programData');
                        var version = (versionId.split('(')[0]).trim()
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var program = `${programId}_v${version}_uId_${userId}`
                        var data = [];
                        var programRequest = programTransaction.get(program);

                        programRequest.onsuccess = function (event) {
                            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            console.log(programJson)
                            for (var l = 0; l < budgetList.length; l++) {
                                var shipmentList = programJson.shipmentList.filter(s => s.budget.id == budgetList[l].budgetId);
                                var plannedShipmentbudget = 0;
                                (shipmentList.filter(s => (s.shipmentStatus.id == 1 || s.shipmentStatus.id == 2 || s.shipmentStatus.id == 3 || s.shipmentStatus.id == 9))).map(ele => plannedShipmentbudget = plannedShipmentbudget + (ele.productCost + ele.freightCost) * ele.currency.conversionRateToUsd);

                                var OrderedShipmentbudget = 0;
                                var shiplist = (shipmentList.filter(s => (s.shipmentStatus.id == 4 || s.shipmentStatus.id == 5 || s.shipmentStatus.id == 6 || s.shipmentStatus.id == 7)))
                                console.log(shiplist)
                                shiplist.map(ele => {
                                    console.log(OrderedShipmentbudget, '+', ele.productCost + ele.freightCost)
                                    OrderedShipmentbudget = OrderedShipmentbudget + (ele.productCost + ele.freightCost) * ele.currency.conversionRateToUsd
                                });

                                var json = {
                                    budget: { id: budgetList[l].budgetId, label: budgetList[l].label, code: budgetList[l].budgetCode },
                                    program: { id: budgetList[l].program.id, label: budgetList[l].program.label, code: programJson.programCode },
                                    fundingSource: budgetList[l].fundingSource,
                                    currency: budgetList[l].currency,
                                    plannedBudgetAmt: (plannedShipmentbudget / budgetList[l].currency.conversionRateToUsd) / 1000000,
                                    orderedBudgetAmt: (OrderedShipmentbudget / budgetList[l].currency.conversionRateToUsd) / 1000000,
                                    startDate: budgetList[l].startDate,
                                    stopDate: budgetList[l].stopDate,
                                    budgetAmt: budgetList[l].budgetAmt / 1000000

                                }
                                data.push(json)
                            }
                            this.setState({
                                selBudget: data,
                                message:''
                            })



                        }.bind(this)


                    }.bind(this)
                }.bind(this)

            } else {
                var inputjson = { "programId": programId, "versionId": versionId }
                AuthenticationService.setupAxiosInterceptors();
                ReportService.budgetReport(inputjson)
                    .then(response => {
                        console.log(JSON.stringify(response.data));
                        this.setState({
                            selBudget: response.data, message: ''
                        })
                    }).catch(
                        error => {
                            this.setState({
                                selBudget: []
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
        } else if (programId == 0) {
            this.setState({ selBudget: [], message: i18n.t('static.common.selectProgram') });
        } else {
            this.setState({ selBudget: [], message: i18n.t('static.program.validversion') });
        }
    }
    formatDate(cell) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
        } else {
            return "";
        }
    }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    getPrograms = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            ProgramService.getProgramByRealmId(realmId)
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );

        } else {
            console.log('offline')
            this.consolidatedProgramList()
        }

    }
    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

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
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        console.log(programNameLabel)

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

                this.setState({
                    programs: proList
                })

            }.bind(this);

        }.bind(this);


    }


    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        document.getElementById("versionId").value=0
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


    componentDidMount() {
        this.getPrograms()
    }
    // showSubFundingSourceLabel(cell, row) {
    //   return getLabelText(cell.label, this.state.lang);
    // }

    // showFundingSourceLabel(cell, row) {
    //   return getLabelText(cell.fundingSource.label, this.state.lang);
    // }

    // showStatus(cell, row) {
    //   if (cell) {
    //     return "Active";
    //   } else {
    //     return "Disabled";
    //   }
    // }
    rowClassNameFormat(row, rowIdx) {
        // row is whole row object
        // rowIdx is index of row
        // console.log('in rowClassNameFormat')
        // console.log(new Date(row.stopDate).getTime() < new Date().getTime())
        return new Date(row.stopDate) < new Date() || (row.budgetAmt - row.usedUsdAmt) <= 0 ? 'background-red' : '';
    }
    formatLabel(cell, row) {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }

    addCommas(cell, row) {
        console.log("row---------->", row);
        //  var currencyCode = row.currency.currencyCode;
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        // return "(" + currencyCode + ")" + "  " + x1 + x2;
        // return currencyCode + "    " + x1 + x2;
        return x1 + x2
    }
    handleChangeProgram = (programIds) => {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.filterData()
        })

    }


    render() {

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);
        console.log('budget list', this.state.selBudget)
        var budgets = this.state.selBudget.map((item, index) => (item.budget))

        console.log('budgets', budgets)


        let data1 = []
        let data2 = []
        let data3 = []
        for (var i = 0; i < budgets.length; i++) {
            console.log(this.state.selBudget.filter(c => c.budget.id = budgets[i].id))
            data1 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => (ele.orderedBudgetAmt)))
            data2 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => (ele.plannedBudgetAmt)))

            data3 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => (ele.budgetAmt - (ele.orderedBudgetAmt + ele.plannedBudgetAmt))))
        }

        const bar = {

            labels: budgets.map(ele => getLabelText(ele.label, this.state.lang)),
            datasets: [
                {
                    label: 'Budget Allocated To Shipment (Ordered)',
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#042e6a',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data1
                },
                {
                    label: 'Budget Allocated To Shipment (Planned)',
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#6a82a8',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data2
                },

                {
                    label: 'Budget Remaining',
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#8aa9e6',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data3
                }
            ],




        }

        console.log('datasets', bar)
        const { SearchBar, ClearSearchButton } = Search;
        const { fundingSourceList } = this.state;

        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );



        const columns = [
            {
                dataField: 'budget.label',
                text: i18n.t('static.budget.budget'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'budget.code',
                text: i18n.t('static.budget.budgetCode'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
            },
            {
                dataField: 'program.label',
                text: i18n.t('static.budget.program'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'program.code',
                text: i18n.t('static.program.programCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
            },
            {
                dataField: 'fundingSource.label',
                text: i18n.t('static.budget.fundingsource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatLabel

            },
            {
                dataField: 'currency.label',
                text: i18n.t('static.dashboard.currency'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.formatLabel

            },
            {
                dataField: 'budgetAmt',
                text: i18n.t('static.budget.budgetamount') + i18n.t('static.report.inmillions'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.addCommas
            },
            {
                dataField: 'plannedBudgetAmt',
                text: i18n.t('static.report.plannedBudgetAmt') + i18n.t('static.report.inmillions'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.addCommas
            },
            {
                dataField: 'orderedBudgetAmt',
                text: i18n.t('static.report.orderedBudgetAmt') + i18n.t('static.report.inmillions'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.addCommas
            },
            {
                dataField: 'orderedBudgetAmt',
                text: i18n.t('static.report.remainingBudgetAmt') + i18n.t('static.report.inmillions'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: (cell, row) => {
                    return this.addCommas(row.budgetAmt - (row.plannedBudgetAmt + row.orderedBudgetAmt), row)
                }
            },

            {
                dataField: 'startDate',
                text: i18n.t('static.common.startdate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.formatDate
            },
            {
                dataField: 'stopDate',
                text: i18n.t('static.common.stopdate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.formatDate
            }];
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
                text: 'All', value: this.state.selBudget.length
            }]
        }
        return (
            <div className="animated">
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}{' '}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a className="card-header-action">
                                    {this.state.selBudget.length > 0 && <div className="card-header-actions">
                                        <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                        <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                    </div>}
                                </a>
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">

                        <Col md="10 pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">Program</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                onChange={(e) => { this.filterVersion(); this.filterData() }}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">Version</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="versionId"
                                                id="versionId"
                                                bsSize="sm"
                                                onChange={(e) => { this.filterData() }}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {versionList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                            </div>
                        </Col>
                        <Col md="12 pl-0">
                            <div className="row">
                                {
                                    this.state.selBudget.length > 0
                                    &&
                                    <div className="col-md-12 p-0">
                                        <div className="col-md-12">
                                            <div className="chart-wrapper chart-graph-report">
                                                <HorizontalBar id="cool-canvas" data={bar} options={chartoptions} />

                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                {this.state.show ? 'Hide Data' : 'Show Data'}
                                            </button>

                                        </div>
                                    </div>}


                            </div>



                            {this.state.show && this.state.selBudget.length > 0 &&
                                <ToolkitProvider
                                    keyField="budgetId"
                                    data={this.state.selBudget}
                                    columns={columns}
                                    search={{ searchFormatted: true }}
                                    hover
                                    filter={filterFactory()}
                                >
                                    {
                                        props => (
                                            <div className="TableCust listBudgetAlignThtd">
                                                <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                    {/*<SearchBar {...props.searchProps} />
                                                        <ClearSearchButton {...props.searchProps} />*/}
                                                </div>
                                                <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                    // pagination={paginationFactory(options)}
                                                    rowEvents={{
                                                        onClick: (e, row, rowIndex) => {
                                                        }
                                                    }}
                                                    {...props.baseProps}
                                                />
                                            </div>
                                        )
                                    }
                                </ToolkitProvider>}
                        </Col>
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div className="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div className="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


export default Budgets;