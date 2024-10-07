import CryptoJS from 'crypto-js';
import classNames from 'classnames';
import moment from 'moment';
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import { MultiSelect } from 'react-multi-select-component';
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut, HorizontalBar, Pie } from 'react-chartjs-2';
import { Search } from 'react-bootstrap-table2-toolkit';
import { confirmAlert } from 'react-confirm-alert';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import {
  ButtonGroup,
  Card,
  CardBody,
  Carousel,
  CarouselCaption,
  CarouselIndicators,
  CarouselItem,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Input,
  FormGroup,
  Label,
  Popover,
  Table,
  PopoverBody
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_HELPDESK_CUSTOMER_PORTAL_URL, SECRET_KEY, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH } from '../../Constants.js';
import DashboardService from "../../api/DashboardService";
import ProgramService from "../../api/ProgramService";
import DropdownService from "../../api/DropdownService";
import imageHelp from '../../assets/img/help-icon.png';
import i18n from '../../i18n';
import AuthenticationService from '../../views/Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent, roundARU } from '../../CommonComponent/JavascriptCommonFunctions';
import { Dashboard } from '../Dashboard/Dashboard.js';
/**
 * Formats a numerical value by adding commas as thousand separators.
 * @param {string|number} cell1 - The numerical value to be formatted.
 * @param {Object} row - The row object if applicable.
 * @returns {string} The formatted numerical value with commas as thousand separators.
 */
function addCommas(cell1, row) {
  if (cell1 != null && cell1 != "") {
      cell1 += '';
      var x = cell1.replaceAll(",", "").split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1].slice(0, 8) : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
  } else {
      return "";
  }
}
/**
 * Component for showing the dashboard.
 */
class ApplicationDashboard extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      isDarkMode: false,
      popoverOpenMa: false,
      id: this.props.match.params.id,
      dropdownOpen: false,
      radioSelected: 2,
      activeIndex: 0,
      activeIndexProgram: 0,
      problemActionList: [],
      programList: [],
      datasetList: [],
      message: '',
      dashboard: '',
      users: [],
      lang: localStorage.getItem('lang'),
      openIssues: '',
      addressedIssues: '',
      supplyPlanReviewCount: '',
      roleArray: [],
      dashboardTopList: [],
      topProgramId: localStorage.getItem('topProgramId') ? JSON.parse(localStorage.getItem('topProgramId')) : [],
      bottomProgramId: localStorage.getItem('bottomProgramId'),
      displayBy: 1,
      onlyDownloadedTopProgram: localStorage.getItem("topLocalProgram"),
      onlyDownloadedBottomProgram: localStorage.getItem("bottomLocalProgram"),
      rangeValue: localStorage.getItem("bottomReportPeriod") ? JSON.parse(localStorage.getItem("bottomReportPeriod")) : { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
    };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    this.getPrograms = this.getPrograms.bind(this);
    this.consolidatedProgramList = this.consolidatedProgramList.bind(this);
    this.checkNewerVersions = this.checkNewerVersions.bind(this);
    this.checkNewerVersionsDataset = this.checkNewerVersionsDataset.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateDashboard = this.updateStateDashboard.bind(this);
    this.getDataSetList = this.getDataSetList.bind(this);
    this.deleteProgram = this.deleteProgram.bind(this);
    this.deleteSupplyPlanProgram = this.deleteSupplyPlanProgram.bind(this);
    this.buildForecastErrorJexcel = this.buildForecastErrorJexcel.bind(this);
    this.buildShipmentsTBDJexcel = this.buildShipmentsTBDJexcel.bind(this);
    this.buildExpiriesJexcel = this.buildExpiriesJexcel.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
  }
  /**
   * Deletes a supply plan program.
   * @param {string} programId - The ID of the program to be deleted.
   * @param {string} versionId - The version ID of the program to be deleted.
   */
  deleteSupplyPlanProgram(programId, versionId) {
    confirmAlert({
      title: i18n.t('static.program.confirm'),
      message: i18n.t("static.dashboard.deleteThisProgram"),
      buttons: [
        {
          label: i18n.t('static.program.yes'),
          onClick: () => {
            this.setState({
              loading: true
            })
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var id = programId + "_v" + versionId + "_uId_" + userId;
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
            }.bind(this);
            openRequest.onsuccess = function (e) {
              db1 = e.target.result;
              var transaction = db1.transaction(['programData'], 'readwrite');
              var programTransaction = transaction.objectStore('programData');
              var deleteRequest = programTransaction.delete(id);
              deleteRequest.onsuccess = function (event) {
                var transaction1 = db1.transaction(['downloadedProgramData'], 'readwrite');
                var programTransaction1 = transaction1.objectStore('downloadedProgramData');
                var deleteRequest1 = programTransaction1.delete(id);
                deleteRequest1.onsuccess = function (event) {
                  var transaction2 = db1.transaction(['programQPLDetails'], 'readwrite');
                  var programTransaction2 = transaction2.objectStore('programQPLDetails');
                  var deleteRequest2 = programTransaction2.delete(id);
                  deleteRequest2.onsuccess = function (event) {
                    this.setState({
                      loading: false,
                      message: i18n.t("static.dashboard.programDeletedSuccessfully"),
                      color: 'green'
                    }, () => {
                      hideSecondComponent()
                    })
                    this.getPrograms();
                  }.bind(this)
                }.bind(this)
              }.bind(this)
            }.bind(this)
          }
        }, {
          label: i18n.t('static.program.no'),
          onClick: () => {
            this.setState({
              message: i18n.t('static.actionCancelled'), loading: false, color: "red"
            })
            this.setState({ loading: false, color: "red" }, () => {
              hideSecondComponent()
            })
          }
        }
      ]
    })
  }
  /**
   * Deletes a program.
   * @param {string} programId - The ID of the program to be deleted.
   * @param {string} versionId - The version ID of the program to be deleted.
   */
  deleteProgram(programId, versionId) {
    confirmAlert({
      title: i18n.t('static.program.confirm'),
      message: i18n.t("static.dashboard.deleteThisProgram"),
      buttons: [
        {
          label: i18n.t('static.program.yes'),
          onClick: () => {
            this.setState({
              loading: true
            })
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var id = programId + "_v" + versionId + "_uId_" + userId;
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
            }.bind(this);
            openRequest.onsuccess = function (e) {
              db1 = e.target.result;
              var transaction = db1.transaction(['datasetData'], 'readwrite');
              var programTransaction = transaction.objectStore('datasetData');
              var deleteRequest = programTransaction.delete(id);
              deleteRequest.onsuccess = function (event) {
                var transaction2 = db1.transaction(['datasetDetails'], 'readwrite');
                var programTransaction2 = transaction2.objectStore('datasetDetails');
                var deleteRequest2 = programTransaction2.delete(id);
                deleteRequest2.onsuccess = function (event) {
                  this.setState({
                    loading: false,
                    message: i18n.t("static.loadDelDataset.datasetDeleteSuccessfully"),
                    color: 'green'
                  }, () => {
                    hideSecondComponent()
                  })
                  this.getDataSetList();
                }.bind(this)
              }.bind(this)
            }.bind(this)
          }
        }, {
          label: i18n.t('static.program.no'),
          onClick: () => {
            this.setState({
              message: i18n.t('static.actionCancelled'), loading: false, color: "red"
            })
            this.setState({ loading: false, color: "red" }, () => {
              hideSecondComponent()
            })
          }
        }
      ]
    })
  }
  /**
   * Redirects the user to a specified URL.
   * @param {string} url - The URL to redirect to.
   */
  redirectToCrud = (url) => {
    this.props.history.push(url);
  }
  /**
   * Redirects the user to a specified URL and stores data in local storage based on the provided parameters.
   * @param {string} url - The URL to redirect to.
   * @param {string} programId - The program ID.
   * @param {string} versionId - The version ID.
   * @param {number} typeId - The type ID.
   */
  redirectToCrudWithValue = (url, programId, versionId, typeId) => {
    if (typeId == 1) {
      let obj = { label: this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0].programCode, value: programId }
      localStorage.setItem("sesForecastProgramIds", JSON.stringify([obj]));
    } else {
      localStorage.setItem("sesDatasetId", this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0].id);
    }
    this.props.history.push(url);
  }
  /**
   * Clears the timeout when the component is unmounted.
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  /**
   * Toggles the state of the dropdownOpen variable in the component's state.
   */
  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => { 
      localStorage.setItem("bottomReportPeriod", JSON.stringify(value))
     })
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  _handleClickRangeBox(e) {
      this.refs.reportPeriod.show()
  }
  /**
   * Checks for newer versions of programs and updates local storage with the latest program information.
   * @param {Array} programs - List of programs to check for newer versions.
   */
  checkNewerVersions(programs) {
    if (localStorage.getItem('sessionType') === 'Online') {
      ProgramService.checkNewerVersions(programs)
        .then(response => {
          localStorage.removeItem("sesLatestProgram");
          localStorage.setItem("sesLatestProgram", response.data);
        })
    }
  }
  /**
   * Checks for newer versions of datasets and updates local storage with the latest dataset information.
   * @param {Array} datasets - List of datasets to check for newer versions.
   */
  checkNewerVersionsDataset(programs) {
    if (localStorage.getItem('sessionType') === 'Online') {
      ProgramService.checkNewerVersions(programs)
        .then(response => {
          localStorage.removeItem("sesLatestDataset");
          localStorage.setItem("sesLatestDataset", response.data);
        })
    }
  }
  /**
    * Retrieves the list of programs.
    */
  getPrograms() {
    if (localStorage.getItem("sessionType") === 'Online') {
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
            .then(response => {
                var proList = []
                for (var i = 0; i < response.data.length; i++) {
                    var programJson = {
                        id: response.data[i].id,
                        programId: response.data[i].id,
                        label: response.data[i].label,
                        programCode: response.data[i].code
                    }
                    proList[i] = programJson
                }
                this.setState({
                  programList: proList, loading: false
                }, () => { this.consolidatedProgramList() })
            }).catch(
                error => {
                    this.setState({
                      programList: []
                    }, () => { this.consolidatedProgramList() })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        });
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
        this.consolidatedProgramList()
    }
  }
  /**
   * Retrieves supply plan programs from indexedDB and updates the state with the fetched program list.
   */
  consolidatedProgramList() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: '#BA0C2F'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
      var program = transaction.objectStore('programQPLDetails');
      var getRequest = program.getAll();
      var programList = this.state.programList;
      let tempProgramList = [];
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: '#BA0C2F',
          loading: false
        })
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
        for (var i = 0; i < filteredGetRequestList.length; i++) {
          var f = 0
          for (var k = 0; k < programList.length; k++) {
              if (filteredGetRequestList[i].programId == programList[k].programId) {
                  f = 1;
              }
          }
          // if (f == 0) {
            tempProgramList.push({
              openCount: filteredGetRequestList[i].openCount,
              addressedCount: filteredGetRequestList[i].addressedCount,
              programCode: filteredGetRequestList[i].programCode + " ~v"+ filteredGetRequestList[i].version + " (Local)",
              programVersion: filteredGetRequestList[i].version,
              programId: filteredGetRequestList[i].programId,
              versionId: filteredGetRequestList[i].version,
              id: filteredGetRequestList[i].id,
              loading: false,
              local: true,
              cutOffDate: filteredGetRequestList[i].cutOffDate != undefined && filteredGetRequestList[i].cutOffDate != null && filteredGetRequestList[i].cutOffDate != "" ? filteredGetRequestList[i].cutOffDate : ""
            });
          // }
        }
        tempProgramList.sort(function (a, b) {
          a = a.programCode.toLowerCase();
          b = b.programCode.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({
          programList: tempProgramList.concat(programList)
        })
        this.checkNewerVersions(programList.filter(x => x.local));
      }.bind(this);
    }.bind(this)
  }
  /**
   * Retrieves forecast programs from indexedDB and updates the state with the fetched program list.
   */
  getDataSetList() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: 'red'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['datasetData'], 'readwrite');
      var program = transaction.objectStore('datasetData');
      var getRequest = program.getAll();
      var datasetList = [];
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: 'red',
          loading: false
        })
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
        for (var i = 0; i < filteredGetRequestList.length; i++) {
          var bytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programName, SECRET_KEY);
          var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
          var programDataBytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programData, SECRET_KEY);
          var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
          var programJson1 = JSON.parse(programData);
          datasetList.push({
            programCode: filteredGetRequestList[i].programCode,
            programVersion: filteredGetRequestList[i].version,
            programId: filteredGetRequestList[i].programId,
            versionId: filteredGetRequestList[i].version,
            id: filteredGetRequestList[i].id,
            loading: false,
            forecastStartDate: (programJson1.currentVersion.forecastStartDate ? moment(programJson1.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
            forecastStopDate: (programJson1.currentVersion.forecastStopDate ? moment(programJson1.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
          });
        }
        this.setState({
          datasetList: datasetList
        })
        this.checkNewerVersionsDataset(datasetList);
      }.bind(this);
    }.bind(this)
  }
  /**
    * Handle region change function.
    * This function updates the state with the selected region values and generates a list of regions.
    * @param {array} regionIds - An array containing the IDs and labels of the selected regions.
    */
  handleTopProgramIdChange = (programIds) => {
    localStorage.setItem("topProgramId", JSON.stringify(programIds))//programIds.map(x => x.value).toString())
    this.setState({
      topProgramId: programIds //this.state.programList.filter(x => programIds.map(ids => ids.value).includes(x.id)),
    }, () => { 
      Dashboard(this, localStorage.getItem("bottomProgramId"), this.state.displayBy, true, true)  
    });
  }
  /**
    * Handles data change in the budget form.
    * @param {Event} event - The change event.
    */
  dataChange(event) {
    let bottomProgramId = this.state.bottomProgramId;
    let displayBy = this.state.displayBy;
    if (event.target.name === "bottomProgramId") {
      bottomProgramId = event.target.value;
      localStorage.setItem("bottomProgramId", bottomProgramId);
      if(bottomProgramId.split("_").length == 1) {
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        localStorage.setItem("bottomReportPeriod", JSON.stringify({ from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } }));
        this.setState({
          rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } }
        })
      }
      Dashboard(this, bottomProgramId, this.state.displayBy, true, true);
    }
    if (event.target.name === "displayBy") {
      displayBy = event.target.value;
      Dashboard(this, bottomProgramId, displayBy, true, true);
    }
    this.setState({
      bottomProgramId,
      displayBy
    }, () => { });
  };
  /**
    * Handles the change event of the diplaying only downloaded programs.
    * @param {Object} event - The event object containing the checkbox state.
    */
  changeOnlyDownloadedTopProgram(event) {
    localStorage.setItem("topLocalProgram", event.target.checked);
    var flag = event.target.checked ? 1 : 0
        if (flag) {
            this.setState({
                onlyDownloadedTopProgram: true,
            }, () => {
                this.getPrograms();
            })
        } else {
            this.setState({
                onlyDownloadedTopProgram: false,
            }, () => {
                this.getPrograms();
            })
        }
  }
  /**
    * Handles the change event of the diplaying only downloaded programs.
    * @param {Object} event - The event object containing the checkbox state.
    */
  changeOnlyDownloadedBottomProgram(event) {
    localStorage.setItem("bottomLocalProgram", event.target.checked);
    var flag = event.target.checked ? 1 : 0
        if (flag) {
            this.setState({
                onlyDownloadedBottomProgram: true,
            }, () => {
                this.getPrograms();
            })
        } else {
            this.setState({
                onlyDownloadedBottomProgram: false,
            }, () => {
                this.getPrograms();
            })
        }
  }
  /**
   * Reterives dashboard data from server on component mount
   */
  componentDidMount() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: '#BA0C2F'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
      var program = transaction.objectStore('programQPLDetails');
      var getRequest = program.getAll();
      let tempProgramList = [];
      getRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: '#BA0C2F',
          loading: false
        })
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
        for (var i = 0; i < filteredGetRequestList.length; i++) {
          tempProgramList.push({
            openCount: filteredGetRequestList[i].openCount,
            addressedCount: filteredGetRequestList[i].addressedCount,
            programCode: filteredGetRequestList[i].programCode + " ~v"+ filteredGetRequestList[i].version + " (Local)",
            programVersion: filteredGetRequestList[i].version,
            programId: filteredGetRequestList[i].programId,
            versionId: filteredGetRequestList[i].version,
            id: filteredGetRequestList[i].id,
            loading: false,
            local: true,
            cutOffDate: filteredGetRequestList[i].cutOffDate != undefined && filteredGetRequestList[i].cutOffDate != null && filteredGetRequestList[i].cutOffDate != "" ? filteredGetRequestList[i].cutOffDate : ""
          });
        }
        tempProgramList.sort(function (a, b) {
          a = a.programCode.toLowerCase();
          b = b.programCode.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        if(tempProgramList.length > 0) {
          Dashboard(this, localStorage.getItem("bottomProgramId"), this.state.displayBy, true, true);
        }
      }.bind(this);
    }.bind(this);
    Chart.plugins.register({
      beforeDraw: function (chart) {
        if (chart.config.type === 'doughnut') {
          const width = chart.chart.width;
          const height = chart.chart.height;
          const ctx = chart.chart.ctx;
          ctx.restore();
          const fontSize = "1";
          ctx.font = `bold ${fontSize}em Arial`;
          ctx.textBaseline = "middle";

          const text = chart.config.data.datasets[0].data[1] + " missing",
            textX = Math.round((width - ctx.measureText(text).width) / 2),
            textY = height / 1.5;

          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      },
      afterDatasetsDraw: function (chart) {
        if (chart.config.type === 'horizontalBar') {
          const ctx = chart.ctx;
          chart.data.datasets.forEach(function (dataset, i) {
            const meta = chart.getDatasetMeta(i);

            meta.data.forEach(function (element, index) {
              // Get the percentage value
              const dataValue = dataset.data[index];
              const percentageText = dataValue == 0 ? '' : `${dataValue}%`;

              // Calculate position for centered text
              const position = element.tooltipPosition();
              const barWidth = element._model.x - element._model.base; // Get the width of the bar
              const centerX = element._model.base + barWidth / 2; // Center horizontally in the bar segment

              // Set text style
              ctx.fillStyle = 'white'; // Set text color
              ctx.font = 'bold 12px Arial'; // Set font
              ctx.textAlign = 'center'; // Horizontally align text to center
              ctx.textBaseline = 'middle'; // Vertically align text to middle

              // Draw the text at the center of each segment
              ctx.fillText(percentageText, centerX, position.y);
            });
          });
        }
      }
    });
    if (localStorage.getItem('sessionType') === 'Online') {
      if (this.state.id == 1) {
        DashboardService.applicationLevelDashboard()
          .then(response => {
            this.setState({
              dashboard: response.data
            })
          })
        DashboardService.applicationLevelDashboardUserList()
          .then(response => {
            this.setState({
              users: response.data
            })
          })
      }
      if (this.state.id == 2) {
        DashboardService.realmLevelDashboard(this.state.realmId)
          .then(response => {
            this.setState({
              dashboard: response.data
            })
          })
        DashboardService.realmLevelDashboardUserList()
          .then(response => {
            this.setState({
              users: response.data
            })
          })
      }
      let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
      let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
      var roleList = decryptedUser.roleList;
      var roleArray = []
      for (var r = 0; r < roleList.length; r++) {
        roleArray.push(roleList[r].roleId)
      }
      this.setState({
        roleArray: roleArray
      })
      if (roleArray.includes('ROLE_SUPPLY_PLAN_REVIEWER') && this.state.id != 2) {
        DashboardService.supplyPlanReviewerLevelDashboard()
          .then(response => {
            this.setState({
              supplyPlanReviewCount: response.data
            })
          })
      }
    }
    this.getPrograms();
    this.getDataSetList();
    if (localStorage.getItem('sessionType') === 'Online') {
      DashboardService.openIssues()
        .then(response => {
          this.setState({
            openIssues: response.data.openIssues,
            addressedIssues: response.data.addressedIssues
          })
        })
    }
    hideFirstComponent();

    // Detect initial theme
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    this.setState({ isDarkMode });

    // Listening for theme changes
    const observer = new MutationObserver(() => {
      const updatedDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      this.setState({ isDarkMode: updatedDarkMode });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });



  }
  /**
   * Callback function invoked when an animation is about to start exiting.
   * Used in components that utilize animations or transitions to perform specific actions just before the exit animation begins.
   */
  onExiting() {
    this.animating = true;
  }
  /**
   * Callback function invoked when an animation has completed exiting.
   * Used in components that utilize animations or transitions to perform specific actions after the exit animation has finished.
   */
  onExited() {
    this.animating = false;
  }
  /**
   * Move to the next item in the carousel.
   */
  next() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === this.state.users.length - 1 ? 0 :
      this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }
  /**
   * Move to the previous item in the carousel.
   */
  previous() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === 0 ? this.state.users.length - 1 :
      this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  }
  /**
   * Navigate to a specific index in the carousel.
   * @param {number} newIndex The index of the item to navigate to.
   * @returns 
   */
  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }
  /**
   * Update a specific key-value pair in the state's programList array.
   * @param {string} key The key of the item in the programList array to update.
   * @param {any} value The new value to set for the specified key.
   */
  updateState(key, value) {
    var programList = this.state.programList;
    var index = programList.findIndex(c => c.id == key);
    programList[index].loading = value;
    this.setState({
      'programList': programList
    })
  }
  /**
   * Update a specific key-value pair in the state's programList array.
   * @param {string} key The key of the item in the programList array to update.
   * @param {any} value The new value to set for the specified key.
   */
  updateStateDashboard(key, value) {
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.setState({
      [key]: value
    }, () => {
      if (key == "dashboardBottomData") {
        // if(this.state.topProgramId.split("(Local)").length > 1){
        //   DashboardService.getDashboardTop()
        //     .then(response => {
        //       this.setState({
        //         dashboardTopList: response.data
        //       }, () => {
        //         if(this.state.bottomProgramId.split("_").length > 1){
        //           DashboardService.getDashboardBottom()
        //             .then(response => {
        //               this.setState({
        //                 dashboardBottomData: response.data
        //               }, () => {
        
        //               })
        //             })
        //         }
        //       })
        //     })
        // } else {

        // }
        this.buildForecastErrorJexcel();
        this.buildShipmentsTBDJexcel();
        this.buildExpiriesJexcel();
        this.setState({
          rangeValue: this.state.bottomProgramId && this.state.bottomProgramId.split("_").length > 1 ? { from: { year: this.state.dashboardStartDateBottom.split("-")[0], month: this.state.dashboardStartDateBottom.split("-")[1] }, to: { year: this.state.dashboardStopDateBottom.split("-")[0], month: this.state.dashboardStopDateBottom.split("-")[1] } } : { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
        }, () => {
          localStorage.setItem("bottomReportPeriod", JSON.stringify(this.state.rangeValue))
        })
      }
    })
  }
  /**
   * Retrieves the problem list after calculation for a specific program ID.
   * @param {number} id The ID of the program for which to retrieve the problem list. 
   */
  getProblemListAfterCalculation(id) {
    this.updateState(id, true);
    if (id != 0) {
      this.refs.problemListChild.qatProblemActions(id, id, false);
    } else {
      this.updateState(id, false);
    }
  }
  /**
     * Toggles info for confidence level
     */
  togglepopoverOpenMa() {
    this.setState({
      popoverOpenMa: !this.state.popoverOpenMa,
    });
  }

  buildForecastErrorJexcel() {
    var forecastErrorList = this.state.dashboardBottomData.forecastErrorList;
    var missingPUList = [
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
    ];
    var dataArray = [];
    let count = 0;
    if (forecastErrorList.length > 0) {
      for (var j = 0; j < forecastErrorList.length; j++) {
        data = [];
        data[0] = forecastErrorList[j].name
        data[1] = forecastErrorList[j].percentage
        dataArray[count] = data;
        count++;
      }
    }
    this.el = jexcel(document.getElementById("forecastErrorJexcel"), '');
    jexcel.destroy(document.getElementById("forecastErrorJexcel"), true);
    var data = dataArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [20, 80],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: "PU",
          type: 'text',
          editable: false,
          readOnly: true
        },
        {
          title: "Average %",
          type: 'text',
          editable: false,
          readOnly: true
        }
      ],
      onload: (instance, cell) => { jExcelLoadedFunctionWithoutPagination(instance) },
      pagination: false,
      search: true,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      height: 100,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var forecastErrorJexcel = jexcel(document.getElementById("forecastErrorJexcel"), options);
    this.el = forecastErrorJexcel;
    this.setState({
      forecastErrorJexcel
    }
    );
  }

  buildShipmentsTBDJexcel() {
    var shipmentWithFundingSourceTbdList = this.state.dashboardBottomData.shipmentWithFundingSourceTbd;
    var missingPUList = [
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
      { name: "TLD30", percentage: "50%" },
      { name: "TLD60", percentage: "100%" },
      { name: "TLD90", percentage: "60%" },
      { name: "TLD120", percentage: "70%" },
    ];
    var dataArray = [];
    let count = 0;
    if (shipmentWithFundingSourceTbdList.length > 0) {
      for (var j = 0; j < shipmentWithFundingSourceTbdList.length; j++) {
        data = [];
        data[0] = shipmentWithFundingSourceTbdList[j].name
        data[1] = shipmentWithFundingSourceTbdList[j].percentage
        dataArray[count] = data;
        count++;
      }
    }
    this.el = jexcel(document.getElementById("shipmentsTBDJexcel"), '');
    jexcel.destroy(document.getElementById("shipmentsTBDJexcel"), true);
    var data = dataArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [20, 80],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: "PU",
          type: 'text',
          editable: false,
          readOnly: true
        },
        {
          title: "# of Shipments",
          type: 'text',
          editable: false,
          readOnly: true
        }
      ],
      onload: (instance, cell) => { jExcelLoadedFunctionWithoutPagination(instance, 1) },
      pagination: false,
      search: true,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      height: 100,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var shipmentsTBDJexcel = jexcel(document.getElementById("shipmentsTBDJexcel"), options);
    this.el = shipmentsTBDJexcel;
    this.setState({
      shipmentsTBDJexcel
    }
    );
  }

  buildExpiriesJexcel() {
    var expiriesList = this.state.dashboardBottomData.expiriesList;
    var dataArray = [];
    let count = 0;
    if (expiriesList.length > 0) {
      for (var j = 0; j < expiriesList.length; j++) {
        data = [];
        data[0] = expiriesList[j].planningUnit.label.label_en
        data[1] = addCommas(roundARU(expiriesList[j].expiringQty, 1))
        data[2] = moment(expiriesList[j].expDate).format("DD-MMMM-YY")
        data[3] = addCommas(roundARU(expiriesList[j].expiryAmt, 1))
        dataArray[count] = data;
        count++;
      }
    }
    this.el = jexcel(document.getElementById("expiriesJexcel"), '');
    jexcel.destroy(document.getElementById("expiriesJexcel"), true);
    var data = dataArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [20, 80],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: "Planning Unit",
          type: 'text',
          editable: false,
          readOnly: true
        },
        {
          title: "Expired/Expiring Quanitity",
          type: 'text',
          editable: false,
          readOnly: true
        },
        {
          title: "Expiry Date",
          type: 'text',
          editable: false,
          readOnly: true
        },
        {
          title: "Total Cost",
          type: 'text',
          editable: false,
          readOnly: true
        }
      ],
      onload: (instance, cell) => { jExcelLoadedFunctionWithoutPagination(instance, 2) },
      pagination: false,
      search: true,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      height: 100,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var expiriesJexcel = jexcel(document.getElementById("expiriesJexcel"), options);
    this.el = expiriesJexcel;
    this.setState({
      expiriesJexcel
    }
    );
  }
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
  /**
   * Renders the application dashboard.
   * @returns {JSX.Element} - Application Dashboard.
   */
  render() {

    const { isDarkMode } = this.state;
    // const backgroundColor = isDarkMode ? darkModeColors : lightModeColors;
    const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
    const gridLineColor = isDarkMode ? '#444' : '#fff';


    const checkOnline = localStorage.getItem('sessionType');
    let defaultModuleId;
    if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != "") {
      defaultModuleId = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8)), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8)).defaultModuleId;
    }
    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SUPPLY_PLANNING_MODULE') && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_FORECASTING_MODULE')) {
      defaultModuleId = defaultModuleId != undefined ? defaultModuleId : 1;
    } else if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SUPPLY_PLANNING_MODULE')) {
      defaultModuleId = 2;
    } else {
      defaultModuleId = 1;
    }
    const activeTab1 = defaultModuleId;
    const { activeIndex } = this.state;
    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );
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
        text: 'All', value: this.state.problemActionList.length
      }]
    }
    const slides = this.state.users.map((item) => {
      return (
        <CarouselItem
          onExiting={this.onExiting}
          onExited={this.onExited}
          key={'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'}
        >
          <div className='carouselCont'>
            <div className='ImgCont'>
              <img width='100%' src={'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1607923e7e2%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1607923e7e2%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.9296875%22%20y%3D%22217.75625%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'} />
            </div>
            <div className='TextCont'>
              <CarouselCaption captionHeader={getLabelText(item.label, this.state.lang)} captionText={item.count} />
            </div>
          </div>
        </CarouselItem>
      );
    });

    const stockStatusData = {
      labels: ['Current Stock Status'],
      datasets: [
        {
          label: 'Overstock',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.overStockPerc*100).toFixed(2)] : [],
          backgroundColor: 'rgba(0, 51, 102, 0.8)', // Dark Blue
        },
        {
          label: 'Adequate',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.adequatePerc*100).toFixed(2)] : [],
          backgroundColor: 'rgba(0, 153, 51, 0.8)', // Green
        },
        {
          label: 'Below Min',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.underStockPerc*100).toFixed(2)] : [],
          backgroundColor: 'rgba(255, 204, 0, 0.8)', // Yellow
        },
        {
          label: 'Stockout',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.stockOutPerc*100).toFixed(2)] : [],
          backgroundColor: 'rgba(204, 0, 0, 0.8)', // Red
        },
        {
          label: 'NA',
          data: this.state.dashboardBottomData ? [(this.state.dashboardBottomData.stockStatus.naPerc*100).toFixed(2)] : [],
          backgroundColor: 'grey', // Red
        }
      ]
    };

    const stockStatusOptions = {
      scales: {
        xAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            display: false // Hide the X-axis values
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            display: false // Hide the Y-axis values
          },
          gridLines: {
            display: false, // Remove grid lines
            color: gridLineColor,
            drawBorder: true,
            lineWidth: 0,
            zeroLineColor: gridLineColor
          }
        }]
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'rect',
          boxWidth: 12,
          fontColor: fontColor,
        }
      },
      tooltips: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const currentValue = dataset.data[tooltipItem.index];
            const label = dataset.label;
            return label + ': ' + currentValue + '%';
          }
        }
      },
      plugins: {
        datalabels: {
          display: true,
          color: 'white',
          anchor: 'center',
          align: 'center',
          formatter: (value) => `${value}%`
        }
      }
    };

    let shipmentDetailsList = [];
    let forecastConsumptionQplCorrectCount = 0;
    let forecastConsumptionQplPuCount = 0;
    let inventoryQplCorrectCount = 0;
    let inventoryQplPuCount = 0;
    let actualConsumptionQplCorrectCount = 0;
    let actualConsumptionQplPuCount = 0;
    let shipmentQplCorrectCount = 0;
    let shipmentQplPuCount = 0;
    let expiryTotal = 0;
    let shipmentTotal = 0;
    if (this.state.dashboardBottomData) {
      forecastConsumptionQplCorrectCount = this.state.dashboardBottomData.forecastConsumptionQpl.correctCount;
      forecastConsumptionQplPuCount = this.state.dashboardBottomData.forecastConsumptionQpl.puCount;
      inventoryQplCorrectCount = this.state.dashboardBottomData.inventoryQpl.correctCount;
      inventoryQplPuCount = this.state.dashboardBottomData.inventoryQpl.puCount;
      actualConsumptionQplCorrectCount = this.state.dashboardBottomData.actualConsumptionQpl.correctCount;
      actualConsumptionQplPuCount = this.state.dashboardBottomData.actualConsumptionQpl.puCount;
      shipmentQplCorrectCount = this.state.dashboardBottomData.shipmentQpl.correctCount;
      shipmentQplPuCount = this.state.dashboardBottomData.shipmentQpl.puCount;
      expiryTotal = this.state.dashboardBottomData.expiryTotal;
      shipmentTotal = this.state.dashboardBottomData.shipmentTotal;
      if(this.state.displayBy == 1 || this.state.displayBy == 2){
        shipmentDetailsList = Object.values(
          this.state.dashboardBottomData.shipmentDetailsList.reduce((acc, curr) => {
            if (!acc[curr.reportBy.code]) {
              acc[curr.reportBy.code] = { code: curr.reportBy.code, cost: curr.cost };
            } else {
              acc[curr.reportBy.code].cost += curr.cost;
            }
            return acc;
          }, {})
        );
      } else {
        shipmentDetailsList = Object.values(
          this.state.dashboardBottomData.shipmentDetailsList.reduce((acc, curr) => {
            if (!acc[getLabelText(curr.reportBy.label, this.state.lang)]) {
              acc[getLabelText(curr.reportBy.label, this.state.lang)] = { code: getLabelText(curr.reportBy.label, this.state.lang), cost: curr.cost };
            } else {
              acc[getLabelText(curr.reportBy.label, this.state.lang)].cost += curr.cost;
            }
            return acc;
          }, {})
        );
      }
    }

    const shipmentsPieData = {
      labels: shipmentDetailsList.map(x => x.code),
      datasets: [{
        label: 'My First Dataset',
        data: shipmentDetailsList.map(x => x.cost),
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    };
    const shipmentsPieOptions = {
      tooltips: {
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
            return "$ "+ x1 + x2;
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'rect',
          boxWidth: 12,
          fontColor: fontColor,
        }
      },
    }

    const forecastConsumptionData = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [forecastConsumptionQplCorrectCount, forecastConsumptionQplPuCount - forecastConsumptionQplCorrectCount],
        backgroundColor: [
          (forecastConsumptionQplCorrectCount / forecastConsumptionQplPuCount) >= (2 / 3) ? "green" : (forecastConsumptionQplCorrectCount / forecastConsumptionQplPuCount) >= (1 / 3) ? "ornage" : "red",
          '#c8ced3'
        ],
        hoverOffset: 4
      }]
    };
    const forecastConsumptionOptions = {
      rotation: -Math.PI, // Start angle (half-circle)
      circumference: Math.PI,
      cutout: '50%', // Doughnut hole size
      responsive: true,
      legend: {
        display: false // Hide the legend
      }
    }

    const actualInventoryData = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [inventoryQplCorrectCount, inventoryQplPuCount - inventoryQplCorrectCount],
        backgroundColor: [
          (inventoryQplCorrectCount / inventoryQplPuCount) >= (2 / 3) ? "green" : (inventoryQplCorrectCount / inventoryQplPuCount) >= (1 / 3) ? "ornage" : "red",
          '#c8ced3'
        ],
        hoverOffset: 4
      }]
    };
    const actualInventoryOptions = {
      rotation: -Math.PI, // Start angle (half-circle)
      circumference: Math.PI,
      cutout: '50%', // Doughnut hole size
      responsive: true,
      legend: {
        display: false // Hide the legend
      }
    }

    const actualConsumptionData = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [actualConsumptionQplCorrectCount, actualConsumptionQplPuCount - actualConsumptionQplCorrectCount],
        backgroundColor: [
          (actualConsumptionQplCorrectCount / actualConsumptionQplPuCount) >= (2 / 3) ? "green" : (actualConsumptionQplCorrectCount / actualConsumptionQplPuCount) >= (1 / 3) ? "ornage" : "red",
          '#c8ced3'
        ],
        hoverOffset: 4
      }]
    };
    const actualConsumptionOptions = {
      rotation: -Math.PI, // Start angle (half-circle)
      circumference: Math.PI,
      cutout: '50%', // Doughnut hole size
      responsive: true,
      legend: {
        display: false // Hide the legend
      }
    }

    const shipmentsData = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [shipmentQplCorrectCount, shipmentQplPuCount - shipmentQplCorrectCount],
        backgroundColor: [
          (shipmentQplCorrectCount / shipmentQplPuCount) >= (2 / 3) ? "green" : (shipmentQplCorrectCount / shipmentQplPuCount) >= (1 / 3) ? "ornage" : "red",
          '#c8ced3'
        ],
        hoverOffset: 4
      }]
    };
    const shipmentsOptions = {
      rotation: -Math.PI, // Start angle (half-circle)
      circumference: Math.PI,
      cutout: '50%', // Doughnut hole size
      responsive: true,
      legend: {
        display: false,// Hide the legend
        color: gridLineColor,
        drawBorder: true,
        lineWidth: 0,
        zeroLineColor: gridLineColor
      }
    }
    let topProgramList = []
    this.state.programList.length > 0 && 
      this.state.programList.filter(c => this.state.onlyDownloadedTopProgram ? c.local : true).map(c => {
        topProgramList.push({ label: c.programCode, value: c.id })
      })
    let bottomProgramList = this.state.programList.length > 0
      && this.state.programList.filter(c => this.state.onlyDownloadedBottomProgram ? c.local : true).map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.programCode}
          </option>
        )
      }, this);
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state
    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }
    return (
      <div className="animated fadeIn">
        <QatProblemActionNew ref="problemListChild" updateState={this.updateState} fetchData={this.consolidatedProgramList} objectStore="programData" page="dashboard"></QatProblemActionNew>
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5 className={this.props.match.params.color} id="div1" style={{ display: this.props.match.params.message == 'Success' ? 'none' : 'block' }}>{i18n.t(this.props.match.params.message)}</h5>
        <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
        <Row className="mt-2">
          {checkOnline === 'Online' && this.state.id == 1 &&
            <>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="p-0">
                    <div class="h1 text-muted text-left mb-0 m-3">
                      <i class="cui-user icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card1' isOpen={this.state.card1} toggle={() => { this.setState({ card1: !this.state.card1 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/listUser")}>{i18n.t('static.list.listUser')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/addUser")}>{i18n.t('static.add.addUser')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                      <Carousel className='trustedMechCarousel' defaultWait={1000} activeIndex={activeIndex} next={this.next} previous={this.previous} ride="carousel">
                        <CarouselIndicators items={this.state.users} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
                        {slides}
                      </Carousel>
                      <div className="chart-wrapper " >
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-table icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card2' isOpen={this.state.card2} toggle={() => { this.setState({ card2: !this.state.card2 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/realm/listRealm")}>{i18n.t('static.list.listRealm')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/realm/addrealm")}>{i18n.t('static.add.addRealm')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.totalRealm')} </div>
                    <div className="text-count">{this.state.dashboard.REALM_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-language icon-color"></i>
                      <ButtonGroup className="float-right">
                        <Dropdown id='card3' isOpen={this.state.card3} toggle={() => { this.setState({ card3: !this.state.card3 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/language/listLanguage")}>{i18n.t('static.list.listLanguage')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/language/addLanguage")}>{i18n.t('static.add.addLanguage')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.language')}</div>
                    <div className="text-count">{this.state.dashboard.LANGUAGE_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </>
          }
          {checkOnline === 'Online' && this.state.id == 2 &&
            <>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="p-0">
                    <div class="h1 text-muted text-left mb-0 m-3">
                      <i class="cui-user icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card1' isOpen={this.state.card1} toggle={() => { this.setState({ card1: !this.state.card1 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/listUser")}>{i18n.t('static.list.listUser')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/user/addUser")}>{i18n.t('static.add.addUser')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                      <Carousel className='trustedMechCarousel' defaultWait={1000} activeIndex={activeIndex} next={this.next} previous={this.previous} ride="carousel">
                        <CarouselIndicators items={this.state.users} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
                        {slides}
                      </Carousel>
                      <div className="chart-wrapper " >
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="cui-globe icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card2' isOpen={this.state.card2} toggle={() => { this.setState({ card2: !this.state.card2 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/realmCountry/listRealmCountry")}>{i18n.t('static.list.listCountry')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/realm/listRealm")}>{i18n.t('static.add.addCountry')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.program.realmcountrydashboard')}</div>
                    <div className="text-count">{this.state.dashboard.REALM_COUNTRY_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-medkit  icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card3' isOpen={this.state.card3} toggle={() => { this.setState({ card3: !this.state.card3 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/healthArea/listHealthArea")}>{i18n.t('static.list.listTechnicalArea')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/healthArea/addHealthArea")}>{i18n.t('static.add.addTechnicalArea')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.program.healtharea')} </div>
                    <div className="text-count">{this.state.dashboard.TECHNICAL_AREA_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="cui-location-pin icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card4' isOpen={this.state.card4} toggle={() => { this.setState({ card4: !this.state.card4 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/realmCountry/listRealmCountry")}>{i18n.t('static.list.listRegion')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/realmCountry/listRealmCountry")}>{i18n.t('static.add.addRegion')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.region.region')} </div>
                    <div className="text-count">{this.state.dashboard.REGION_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-sitemap icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card5' isOpen={this.state.card5} toggle={() => { this.setState({ card5: !this.state.card5 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/organisation/listOrganisation")}>{i18n.t('static.list.listOrganisation')}</DropdownItem>
                            <DropdownItem onClick={() => this.redirectToCrud("/organisation/addOrganisation")}>{i18n.t('static.add.addOrganisation')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.program.organisation')} </div>
                    <div className="text-count">{this.state.dashboard.ORGANIZATION_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-list-alt icon-color"></i>
                      <ButtonGroup className="float-right BtnZindex">
                        <Dropdown id='card8' isOpen={this.state.card8} toggle={() => { this.setState({ card8: !this.state.card8 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud(activeTab1 == 2 ? "/program/listProgram" : "/dataSet/listDataSet")}>{i18n.t('static.list.listProgram')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.add.totalProgram')} </div>
                    <div className="text-count">{activeTab1 == 2 ? this.state.dashboard.PROGRAM_COUNT : this.state.dashboard.DATASET_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-file-text-o icon-color"></i>
                      <ButtonGroup className="float-right">
                        <Dropdown id='card6' isOpen={this.state.card6} toggle={() => { this.setState({ card6: !this.state.card6 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud(activeTab1 == 2 ? "/program/programOnboarding" : "/dataset/addDataSet")}>{i18n.t('static.dashboard.setupprogram')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.setupprogram')} </div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
              {activeTab1 == 2 && <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-calculator  icon-color"></i>
                      <ButtonGroup className="float-right">
                        <Dropdown id='card7' isOpen={this.state.card7} toggle={() => { this.setState({ card7: !this.state.card7 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/report/supplyPlanVersionAndReview/1")}>{i18n.t('static.dashboard.viewSupplyPlan')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.supplyPlanWaiting')} </div>
                    <div className="text-count">{this.state.dashboard.SUPPLY_PLAN_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>}
            </>
          }
          {activeTab1 == 2 && checkOnline === 'Online' && this.state.id != 2 && this.state.roleArray.includes('ROLE_SUPPLY_PLAN_REVIEWER') &&
            <>
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div class="h1 text-muted text-left mb-2  ">
                      <i class="fa fa-calculator  icon-color"></i>
                      <ButtonGroup className="float-right">
                        <Dropdown id='card7' isOpen={this.state.card7} toggle={() => { this.setState({ card7: !this.state.card7 }); }}>
                          <DropdownToggle caret className="p-0" color="transparent">
                          </DropdownToggle>
                          <DropdownMenu right>
                            <DropdownItem onClick={() => this.redirectToCrud("/report/supplyPlanVersionAndReview")}>{i18n.t('static.dashboard.viewSupplyPlan')}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                    <div className="TextTittle ">{i18n.t('static.dashboard.supplyPlanWaiting')} </div>
                    <div className="text-count">{this.state.supplyPlanReviewCount.SUPPLY_PLAN_COUNT}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </>
          }
          {
            this.state.datasetList.length > 0 && activeTab1 == 1 &&
            this.state.datasetList.map((item) => (
              <Col xs="12" sm="6" lg="3">
                <Card className=" CardHeight">
                  <CardBody className="box-p">
                    <div style={{ display: item.loading ? "none" : "block" }}>
                      <div class="h1 text-muted text-left mb-2">
                        <i class="fa fa-list-alt icon-color"></i>
                        <ButtonGroup className="float-right BtnZindex">
                          <Dropdown id={item.id} isOpen={this.state[item.id]} toggle={() => { this.setState({ [item.id]: !this.state[item.id] }); }}>
                            <DropdownToggle caret className="p-0" color="transparent">
                            </DropdownToggle>
                            <DropdownMenu right>
                              <DropdownItem onClick={() => this.deleteProgram(item.programId, item.versionId)}>{i18n.t("static.common.delete")}</DropdownItem>
                              <DropdownItem onClick={() => this.redirectToCrudWithValue("/dataset/versionSettings", item.programId, item.versionId, 1)}>{i18n.t("static.versionSettings.versionSettings")}</DropdownItem>
                              <DropdownItem onClick={() => this.redirectToCrudWithValue("/dataset/listTree", item.programId, item.versionId, 2)}>{i18n.t("static.forecastMethod.tree")}</DropdownItem>
                              <DropdownItem onClick={() => this.redirectToCrudWithValue("/dataentry/consumptionDataEntryAndAdjustment", item.programId, item.versionId, 2)}>{i18n.t("static.supplyPlan.consumption")}</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </ButtonGroup>
                      </div>
                      <div className="TextTittle ">{item.programCode + "~v" + item.versionId}</div>
                      <div className="TextTittle ">{item.forecastStartDate + " to " + item.forecastStopDate}</div>
                    </div>
                    <div style={{ display: item.loading ? "block" : "none" }}>
                      <div className="d-flex align-items-center justify-content-center" style={{ height: "70px" }} >
                        <div class="align-items-center">
                          <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                          <div class="spinner-border blue ml-4" role="status">
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))
          }
          {checkOnline === 'Online' && activeTab1 == 1 &&
            <Col xs="12" sm="6" lg="3">
              <Card className=" CardHeight">
                <CardBody className="box-p">
                  <a href={QAT_HELPDESK_CUSTOMER_PORTAL_URL} target="_blank" title={i18n.t('static.ticket.help')}>
                    <div class="h1 text-muted text-left mb-2  ">
                      <i><img src={imageHelp} className="" style={{ width: '40px', height: '40px', marginTop: '-15px' }} /></i>
                    </div>
                    <div className="TextTittle ">{i18n.t("static.ticket.openIssues")}: {this.state.openIssues}</div>
                    <div className="TextTittle">{i18n.t("static.ticket.addressedIssues")}: {this.state.addressedIssues}</div>
                    <div className="chart-wrapper mt-4 pb-2" >
                    </div>
                  </a>
                </CardBody>
              </Card>
            </Col>
          }
        </Row>
        {activeTab1 == 2 && <>
          <div className='row px-3'>
            {/* <div class="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
              <div>
                <p class="fw-semibold fs-18 mb-0 titleColorModule1">Overview</p>
              </div>
            </div> */}
            <div className='col-md-12'>
              <div className='row'>
                <FormGroup className='col-md-3 pl-lg-0 FormGroupD'>
                  <Label htmlFor="topProgramId">Program<span class="red Reqasterisk">*</span></Label>
                  <MultiSelect
                    name="topProgramId"
                    id="topProgramId"
                    bsSize="sm"
                    value={this.state.topProgramId}
                    onChange={(e) => { this.handleTopProgramIdChange(e) }}
                    options={topProgramList && topProgramList.length > 0 ? topProgramList : []}
                    labelledBy={i18n.t('static.common.regiontext')}
                  />
                </FormGroup>
                <FormGroup className='col-md-3' style={{ marginTop: '34px' }}>
                  <div className="tab-ml-1 ml-lg-3">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      id="onlyDownloadedTopProgram"
                      name="onlyDownloadedTopProgram"
                      checked={this.state.onlyDownloadedTopProgram}
                      onClick={(e) => { this.changeOnlyDownloadedTopProgram(e); }}
                    />
                    <Label
                      className="form-check-label"
                      check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '3px' }}>
                      Only show local program
                    </Label>
                  </div>
                </FormGroup>

              </div>

              <div class="col-xl-12 pl-lg-0 pr-lg-0">
                <div class="card custom-card">
                  <div class="card-body px-0 py-0">
                    <div class="table-responsive fixTableHead tableFixHeadDash">
                      <Table className="table-striped table-bordered text-center">
                        <thead>
                          <th scope="col">Delete</th>
                          <th scope="col">Program</th>
                          <th scope="col"># of active planning units</th>
                          <th scope="col"># of products with stockouts</th>
                          <th scope="col">Expiries*</th>
                          <th scope='col'># of open QAT Problems​</th>
                          <th scope='col'>Last updated date</th>
                          <th scope='col'>Review​(looks at last final vers)</th>
                        </thead>
                        <tbody>
                          {this.state.dashboardTopList.map(d => {
                            return (
                              <tr>
                                <td scope="row"><i class="fa fa-trash" onClick={() => this.deleteSupplyPlanProgram(d.program.id.split("_")[0], d.program.id.split("_")[1].slice(1))}></i></td>
                                <td scope="row">{d.program.code+" ~v"+d.program.version}​</td>
                                <td>
                                  <div id="example-1" class="examples">
                                    <div class="cssProgress">
                                      <div class="progress1">
                                        <div class="cssProgress-bar" data-percent={(d.activePlanningUnits/(d.activePlanningUnits+d.disabledPlanningUnits))*100} style={{ width: (d.activePlanningUnits/(d.activePlanningUnits+d.disabledPlanningUnits))*100+'%' }}>
                                          <span class="cssProgress-label">{d.activePlanningUnits}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                </td>
                                <td>{d.countOfStockOutPU}</td>
                                <td>{d.valueOfExpiredPU ? "$" : ""} {addCommas(roundARU(d.valueOfExpiredPU, 1))}</td>
                                <td>{d.countOfOpenProblem}</td>
                                <td>{moment(d.lastModifiedDate).format('DD-MMMM-YY')}</td>
                                <td>{getLabelText(d.latestFinalVersion.versionStatus.label, this.state.lang)} ({moment(d.latestFinalVersion.lastModifiedDate).format('DD-MMMM-YY')})</td>
                              </tr>)
                          })}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-12'>
              <div className='row'>
                <div className='col-md-3'>
                  <FormGroup className='col FormGroupD'>
                    <Label htmlFor="organisationTypeId">Program<span class="red Reqasterisk">*</span></Label>
                    <Input
                      type="select"
                      name="bottomProgramId"
                      id="bottomProgramId"
                      value={this.state.bottomProgramId}
                      onChange={(e) => { this.dataChange(e) }}
                      bsSize="sm"
                      required
                    >
                      <option selected>Open this select menu</option>
                      {bottomProgramList}
                    </Input>
                  </FormGroup>
                  <FormGroup className='col' style={{ marginTop: '34px' }}>
                    <div className="tab-ml-1 ml-lg-3">
                      <Input
                        className="form-check-input"
                        type="checkbox"
                        id="onlyDownloadedBottomProgram"
                        name="onlyDownloadedBottomProgram"
                        checked={this.state.onlyDownloadedBottomProgram}
                        onClick={(e) => { this.changeOnlyDownloadedBottomProgram(e); }}
                      />
                      <Label
                        className="form-check-label"
                        check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '3px' }}>
                        Only show local program
                      </Label>
                    </div>
                  </FormGroup>
                </div>
                <FormGroup className='col-md-3 pl-lg-0 FormGroupD'>
                  <Label htmlFor="organisationTypeId">Report Period<span class="red Reqasterisk">*</span></Label>
                  <div className="controls edit">
                    <Picker
                      ref="reportPeriod"
                      years={{ min: this.state.minDate, max: this.state.maxDate }}
                      value={rangeValue}
                      lang={pickerLang}
                      key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(rangeValue)}
                      onDismiss={this.handleRangeDissmis}
                    >
                      <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this.state.bottomProgramId && this.state.bottomProgramId.split("_").length > 1 ? "" : this._handleClickRangeBox} />
                    </Picker>
                  </div>
                </FormGroup>
                <FormGroup className='col-md-3 pl-lg-0 FormGroupD'>
                  <Label htmlFor="displayBy">Display By<span class="red Reqasterisk">*</span></Label>
                  <Input
                    type="select"
                    name="displayBy"
                    id="displayBy"
                    bsSize="sm"
                    onChange={(e) => { this.dataChange(e) }}
                    value={this.state.displayBy}
                    required
                  >
                    <option value="1">Funding Source</option>
                    <option value="2">Procurement Agent</option>
                    <option value="3">Status</option>
                  </Input>
                  <div className='col-md-12 pl-lg-0 pt-lg-1'> <p class="mb-2 fs-10 text-mutedDashboard fw-semibold">Total value of all the shipment {shipmentTotal ? "$" : ""} {addCommas(roundARU(shipmentTotal, 1))}</p></div>
                </FormGroup>
              </div>
            </div>
          </div>
          {this.state.dashboardBottomData && <div className='row'>
            <div class="col-xl-12">
              <div className='row pl-lg-1 pr-lg-1'>
                <div className='col-md-12'>
                  <div className='row'>
                    <div className='col-md-3'>
                      <div className="card custom-card CustomHeight">
                        <div class="card-header  justify-content-between">
                          <div class="card-title"> Stock Status </div>
                        </div>
                        <div class="card-body pt-lg-0">
                          <HorizontalBar data={stockStatusData} options={stockStatusOptions} />
                        </div>
                        <div class="card-header  justify-content-between">
                          <div class="card-title"> Stocked out Planning Units ({this.state.dashboardBottomData ? this.state.dashboardBottomData.stockStatus.puStockOutList.length : 0}) </div>
                        </div>
                        <div class="card-body pt-0 pb-0">
                          <ul class="list-unstyled mb-0 pt-0 crm-deals-status">
                            {this.state.dashboardBottomData && this.state.dashboardBottomData.stockStatus.puStockOutList.map(x => {
                              return (<li class="success">
                                <div class="d-flex align-items-center justify-content-between">
                                  <div className='text-mutedDashboard'>{x.planningUnit.name} </div>
                                  <div class="fs-12 text-mutedDashboard">{x.count}​</div>
                                </div>
                              </li>)
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card custom-card CustomHeight">
                        <div class="card-header  justify-content-between">
                          <div class="card-title"> Forecast Error </div>
                        </div>
                        <div class="card-body px-0 py-0" style={{ overflow: 'hidden' }}>
                          <div id="forecastErrorJexcel" className='DashboardreadonlyBg dashboardTable2'>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card custom-card CustomHeight">
                        <div class="card-header  justify-content-between">
                          <div class="card-title">Shipments </div>
                        </div>
                        <div class="card-body">
                          <div className='d-flex align-items-center justify-content-center'>
                            <Pie data={shipmentsPieData} options={shipmentsPieOptions} height={300}/>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card custom-card CustomHeight">
                        <div class="card-header  justify-content-between">
                          <div class="card-title"># of Shipments with funding TBD </div>
                        </div>
                        <div class="card-body px-0 py-0" style={{ overflow: 'hidden' }}>
                          <div id="shipmentsTBDJexcel" className='DashboardreadonlyBg dashboardTable2'>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div class="card custom-card CustomHeight">
                        <div class="card-header  justify-content-between">
                          <div class="card-title"> Data Quality (doesn't use date selector) </div>
                        </div>
                        <div class="card-body py-2">
                          <div className='row pt-lg-1'>
                            <div class="col-md-6 container1">
                              <p class="label-text text-center text-mutedDashboard"><b>Forecasted consumption <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></b></p>
                              <div class="pie-wrapper">
                                <div class="arc" data-value="24"></div>
                                <Doughnut data={forecastConsumptionData} options={forecastConsumptionOptions} height={100} />
                              </div>
                            </div>
                            <div class="col-md-6 container1">
                              <p class="label-text text-center text-mutedDashboard"><b>Actual Inventory <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></b></p>
                              <div class="pie-wrapper">
                                <div class="arc" data-value="24"></div>
                                <Doughnut data={actualInventoryData} options={actualInventoryOptions} height={100} />
                              </div>
                            </div>
                          </div>
                          <div className='row pt-lg-1'>
                            <div class="col-md-6 container1">
                              <p class="label-text text-center text-mutedDashboard"><b>Actual consumption <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></b></p>
                              <div class="pie-wrapper">
                                <div class="arc" data-value="24"></div>
                                <Doughnut data={actualConsumptionData} options={actualConsumptionOptions} height={100} />
                              </div>
                            </div>
                            <div class="col-md-6 container1">
                              <p class="label-text text-center text-mutedDashboard"><b>Shipments <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></b></p>
                              <div class="pie-wrapper">
                                <div class="arc" data-value="24"></div>
                                <Doughnut data={shipmentsData} options={shipmentsOptions} height={100} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='row'>
                        <div class="col-md-12 pl-lg-4 pr-lg-4">
                          <div class="card custom-card CustomHeight">
                            <div class="card-header justify-content-between">
                              <div class="card-title"> Expiries</div>
                            </div>
                            <div class="card-body px-0 py-0" style={{ overflow: 'hidden' }}>
                              <p className='mb-2 fs-10 text-mutedDashboard fw-semibold pt-lg-0 pl-lg-2'>Total value of all the Expiries {expiryTotal ? "$" : ""} {addCommas(roundARU(expiryTotal, 1))}</p>
                              <div id="expiriesJexcel" className='DashboardreadonlyBg dashboardTable2'>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}
        </>}
      </div >
    );
  }
}
export default ApplicationDashboard;
