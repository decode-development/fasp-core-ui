import React from "react";
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Table } from 'reactstrap';
import i18n from '../../i18n'
import RealmService from '../../api/RealmService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, FIRST_DATA_ENTRY_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ProgramService from '../../api/ProgramService';
import csvicon from '../../assets/img/csv.png'
import pdfIcon from '../../assets/img/pdf.png';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import Pdf from "react-to-pdf"
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Online, Offline } from "react-detect-offline";
import { LOGO } from '../../CommonComponent/Logo.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import { DatePicker } from 'antd';
import 'antd/dist/antd.css';
import MultiSelect from "react-multi-select-component";
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
const { RangePicker } = DatePicker;
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}
const legendcolor = [
  { text: "Low stock", color: '#edb944' }];
const { ExportCSVButton } = CSVExport;
const entityname = i18n.t('static.dashboard.productCatalog');
export default class StockStatusMatrix extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      productCategories: [],
      planningUnits: [],
      data: [],
      programs: [],
      versions: [],
      includePlanningShipments: true,
      years: [],
      pulst: [],
      message: '',
      planningUnitValues: [],
      planningUnitLabels: [],
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 2 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
      startYear: new Date().getFullYear() - 1,
      endYear: new Date().getFullYear(),
      loading: true

    }
    this.filterData = this.filterData.bind(this);
    this.formatLabel = this.formatLabel.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);

  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  show() {

  }
  handleRangeChange(value, text, listIndex) {
    //this.filterData();
  }
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.filterData();
    })

  }
  onYearChange = (value) => {
    this.setState({
      startYear: value[0].format('YYYY'),
      endYear: value[1].format('YYYY')
    }, () => {
      console.log(this.state.startYear, ' ', this.state.endYear)
      this.filterData()
    })
  }
  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  getversion = () => {
    let programId = document.getElementById("programId").value;
    if (programId != 0) {
      const program = this.state.programs.filter(c => c.programId == programId)
      if (program.length == 1) {
        return program[0].currentVersion.versionId

      } else {
        return -1
      }
    }

  }

  handlePlanningUnitChange = (planningUnitIds) => {
    planningUnitIds = planningUnitIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      planningUnitValues: planningUnitIds.map(ele => ele),
      planningUnitLabels: planningUnitIds.map(ele => ele.label)
    }, () => {

      this.filterData()
    })
  }

  handleProductCategoryChange = (planningUnitIds) => {
    console.log('###########################')
    this.setState({
      planningUnitValues: planningUnitIds.map(ele => ele.value),
      planningUnitLabels: planningUnitIds.map(ele => ele.label)
    }, () => {

      this.filterData()
    })
  }

  filterData() {
    //console.log('In filter data---' + this.state.rangeValue.from.year)
    let startDate = this.state.startYear + '-01-01';
    let endDate = this.state.endYear + '-12-' + new Date(this.state.endYear, 12, 0).getDate();
    let programId = document.getElementById("programId").value;
    let planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString())//this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
    let versionId = document.getElementById("versionId").value;
    let includePlannedShipments = document.getElementById("includePlanningShipments").value
    if (this.state.planningUnitValues.length > 0 && programId > 0 && versionId != 0) {

      if (versionId.includes('Local')) {
        this.setState({ loading: true })
        var data = [];
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            loading: false
          })
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
          var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
          var planningunitRequest = planningUnitObjectStore.getAll();
          planningunitRequest.onerror = function (event) {
            // Handle errors!
            this.setState({
              loading: false
            })
          };
          var plunit = []
          planningunitRequest.onsuccess = function (e) {
            var myResult1 = [];
            myResult1 = e.target.result;
            console.log(myResult1)
            var plunit1 = []
            planningUnitIds.map(planningUnitId => {
              plunit = [...plunit, ...(myResult1.filter(c => c.planningUnitId == planningUnitId))]

            })
            console.log(plunit)
          }.bind(this)
          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var version = (versionId.split('(')[0]).trim()
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`

          var programRequest = programTransaction.get(program);

          programRequest.onerror = function (event) {
            this.setState({
              loading: false
            })
          }.bind(this);
          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            
            planningUnitIds.map(planningUnitId => {

              var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId))[0]

              for (var from = this.state.startYear, to = this.state.endYear; from <= to; from++) {
                var monthlydata = [];
                for (var month = 1; month <= 12; month++) {
                  var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                  var enddtStr = from + "-" + String(month).padStart(2, '0') + '-' + new Date(from, month, 0).getDate()
                  console.log(dtstr, ' ', enddtStr)
                  var dt = dtstr
                  var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnitId && c.transDate == dt)
                  console.log(list)
                  if (list.length > 0) {
                    console.log(includePlannedShipments)
                    if (includePlannedShipments.toString() == "true") {
                      monthlydata.push(list[0].mos)
                    }
                    else {
                     
                      monthlydata.push(list[0].mosWps)
                    }
                  } else {
                    monthlydata.push('')
                  }

                }
                console.log(monthlydata)
                var json = {
                  planningUnit: pu.planningUnit,
                  unit: plunit.filter(c => c.planningUnitId == planningUnitId)[0].unit,
                  reorderFrequency: pu.reorderFrequencyInMonths,
                  year: from,
                  minMonthsOfStock: pu.minMonthsOfStock,
                  jan: monthlydata[0] ,
                  feb: monthlydata[1],
                  mar: monthlydata[2] ,
                  apr: monthlydata[3],
                  may: monthlydata[4],
                  jun: monthlydata[5],
                  jul: monthlydata[6],
                  aug: monthlydata[7],
                  sep: monthlydata[8],
                  oct: monthlydata[9] ,
                  nov: monthlydata[10],
                  dec: monthlydata[11],
                }
                data.push(json)

              }
              this.setState({
                data: data,
                message: '', loading: false
              }, () => { console.log(this.state.data) })
            })
          }.bind(this)


        }.bind(this)



















      } else {
        this.setState({ loading: true })

        var inputjson = {
          "programId": programId,
          "versionId": versionId,
          "startDate": startDate,
          "stopDate": endDate,
          "planningUnitIds": planningUnitIds,
          "includePlannedShipments": includePlannedShipments,

        }


        // AuthenticationService.setupAxiosInterceptors();
        ProductService.getStockStatusMatrixData(inputjson)
          .then(response => {
            console.log("data---", response.data)

            this.setState({
              data: response.data,
              message: '', loading: false
            })


          }).catch(
            error => {
              this.setState({
                data: [], loading: false
              })

              if (error.message === "Network Error") {
                this.setState({ message: error.message, loading: false });
              } else {
                switch (error.response ? error.response.status : "") {
                  case 500:
                  case 401:
                  case 404:
                  case 406:
                  case 412:
                    this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                    break;
                  default:
                    this.setState({ loading: false, message: 'static.unkownError' });
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

  getProductCategories() {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;

    this.setState({
      planningUnits: [],
      productCategories: []
    }, () => {
      if (versionId.includes('Local')) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;

          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var version = (versionId.split('(')[0]).trim()
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`

          var programRequest = programTransaction.get(program);

          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            var InventoryList = (programJson.inventoryList);
            let productCategories = [];
            var json;

            InventoryList.map(ele => (
              productCategories.push({
                payload: {
                  productCategoryId: ele.planningUnit.forecastingUnit.productCategory.id,
                  label: ele.planningUnit.forecastingUnit.productCategory.label,
                  active: true
                }
              })

            ))



            console.log(productCategories)
            this.setState({
              productCategories: productCategories.reduce(
                (accumulator, current) => accumulator.some(x => x.productCategoryId === current.productCategoryId) ? accumulator : [...accumulator, current], []
              )
            }, () => { console.log(this.state.productCategories) });


          }.bind(this)

        }.bind(this)
      } else {
        let realmId = AuthenticationService.getRealmId();
        // AuthenticationService.setupAxiosInterceptors();
        let programId = document.getElementById("programId").value;
        ProductService.getProductCategoryListByProgram(realmId, programId)
          .then(response => {
            console.log('***' + JSON.stringify(response.data))
            this.setState({
              productCategories: response.data
            })
          }).catch(
            error => {
              this.setState({
                productCategories: []
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
                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
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
    )
  }

  getPrograms = () => {
    if (navigator.onLine) {
      // AuthenticationService.setupAxiosInterceptors();
      ProgramService.getProgramList()
        .then(response => {
          console.log(JSON.stringify(response.data))
          this.setState({
            programs: response.data, loading: false
          }, () => { this.consolidatedProgramList() })
        }).catch(
          error => {
            this.setState({
              programs: [], loading: false
            }, () => { this.consolidatedProgramList() })
            if (error.message === "Network Error") {
              this.setState({ loading: false, message: error.message });
            } else {
              switch (error.response ? error.response.status : "") {
                case 500:
                case 401:
                case 404:
                case 406:
                case 412:
                  this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                  break;
                default:
                  this.setState({ loading: false, message: 'static.unkownError' });
                  break;
              }
            }
          }
        );

    } else {
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
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: []
    }, () => {

      if (versionId == 0) {
        this.setState({ message: i18n.t('static.program.validversion'), data: [] });
      } else {
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
              console.log(myResult)
              for (var i = 0; i < myResult.length; i++) {
                if (myResult[i].program.id == programId) {

                  proList[i] = myResult[i]
                }
              }
              this.setState({
                planningUnits: proList, message: ''
              }, () => {
                this.filterData();
              })
            }.bind(this);
          }.bind(this)


        }
        else {
          // AuthenticationService.setupAxiosInterceptors();

          //let productCategoryId = document.getElementById("productCategoryId").value;
          ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
            console.log('**' + JSON.stringify(response.data))
            this.setState({
              planningUnits: response.data, message: ''
            }, () => {
              this.filterData();
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
    });

  }

  componentDidMount() {
    this.getPrograms();

  }

  formatter = value => {
    if (value != null) {
      var cell1 = this.roundN(value)
      cell1 += '';
      var x = cell1.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    } else {  
      return ''
    }
  }
  addDoubleQuoteToRowContent=(arr)=>{
    return arr.map(ele=>'"'+ele+'"')
 }
  exportCSV(columns) {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange') + ' , ' + (this.state.startYear + ' ~ ' + this.state.endYear)).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
    this.state.planningUnitLabels.map(ele =>
      csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
    csvRow.push((i18n.t('static.program.isincludeplannedshipment') + ' , ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20'))

    csvRow.push('')
    csvRow.push('')
    csvRow.push('')
    csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
    csvRow.push('')

    const headers = [];
    columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
    var A = [this.addDoubleQuoteToRowContent(headers)]
    var re = this.state.data
    this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.unit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.minMonthsOfStock, ele.reorderFrequency, ele.year, this.roundN(ele.jan), this.roundN(ele.feb), this.roundN(ele.mar), this.roundN(ele.apr), this.roundN(ele.may), this.roundN(ele.jun), this.roundN(ele.jul), this.roundN(ele.aug), this.roundN(ele.sep), this.roundN(ele.oct), this.roundN(ele.nov), this.roundN(ele.dec)])));
    for (var i = 0; i < A.length; i++) {
      console.log(A[i])
      csvRow.push(A[i].join(","))

    }

    var csvString = csvRow.join("%0A")
    console.log('csvString' + csvString)
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.stockstatusmatrix') + "-" + this.state.startYear + '~' + this.state.endYear + ".csv"
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
        doc.text(i18n.t('static.dashboard.stockstatusmatrix'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(i18n.t('static.report.dateRange') + ' : ' + this.state.startYear + ' ~ ' + this.state.endYear, doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })

          var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 8, 150, planningText)

        }

      }
    }

    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(8);


    // const title = i18n.t('static.dashboard.stockstatusmatrix');
    let header = []

    header = [[{ content: i18n.t('static.planningunit.planningunit'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.dashboard.unit'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.common.min'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.program.reorderFrequencyInMonths'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.common.year'), rowSpan: 2, styles: { halign: 'center' } },
    { content: i18n.t('static.report.monthsOfStock'), colSpan: 12, styles: { halign: 'center' } }]
      , [
      { content: i18n.t('static.month.jan'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.feb'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.mar'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.apr'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.may'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.jun'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.jul'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.aug'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.sep'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.oct'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.nov'), styles: { halign: 'center' } },
      { content: i18n.t('static.month.dec'), styles: { halign: 'center' } },]
    ]
    let data;
    data = this.state.data.map(ele => [getLabelText(ele.planningUnit.label, this.state.lang), getLabelText(ele.unit.label, this.state.lang), ele.minMonthsOfStock, ele.reorderFrequency, ele.year, this.formatter(ele.jan), this.formatter(ele.feb), this.formatter(ele.mar), this.formatter(ele.apr), this.formatter(ele.may), this.formatter(ele.jun), this.formatter(ele.jul), this.formatter(ele.aug), this.formatter(ele.sep), this.formatter(ele.oct), this.formatter(ele.nov), this.formatter(ele.dec)]);

    var startY = 170 + (this.state.planningUnitValues.length * 3)
    let content = {
      margin: { top: 80, bottom: 90 },
      startY: startY,
      head: header,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, cellWidth: 38, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 141.89 },
        1: { cellWidth: 50 },
      }
    };

    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.stockstatusmatrix') + ".pdf")
  }


  formatLabel(cell, row) {
    return getLabelText(cell, this.state.lang);
  }
  roundN = num => {
    console.log(num)
    if (num == null) {
      return ''
    } else {
      return parseFloat(Math.round(num * Math.pow(10, 1)) / Math.pow(10, 1)).toFixed(1);
    }
  }
  cellStyle = (min, value) => {
    if (value != null)
      if (min > value) {
        return { backgroundColor: legendcolor[0].color }
      } else {
        return {}
      }
    else {
      return { backgroundColor: legendcolor[0].color }
    }
  }
  render() {


    const { planningUnits } = this.state;
    let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

      }, this);
    const { productCategories } = this.state;
    let productCategoryList = productCategories.length > 0
      && productCategories.map((item, i) => {
        return (
          <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
            {Array(item.level).fill('   ').join('') + (getLabelText(item.payload.label, this.state.lang))}
          </option>
        )
      }, this);
    let productCategoryListcheck = productCategories.length > 0
      && productCategories.filter(c => c.payload.active == true).map((item, i) => {
        console.log(item)

        return ({ label: getLabelText(item.payload.label, this.state.lang), value: item.payload.productCategoryId })

      }, this);
    console.log(productCategoryListcheck)
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state

    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }
    

    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );

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


    let columns = [
      {
        dataField: 'planningUnit.label',
        text: i18n.t('static.planningunit.planningunit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        style: { width: '350px' },
        formatter: this.formatLabel
      },

      {
        dataField: 'unit.label',
        text: i18n.t('static.dashboard.unit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'minMonthsOfStock',
        text: i18n.t('static.common.min'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      }, {
        dataField: 'reorderFrequency',
        text: i18n.t('static.program.reorderFrequencyInMonths'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      }, {
        dataField: 'year',
        text: i18n.t('static.common.year'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      },
      {
        dataField: 'jan',
        text: i18n.t('static.month.jan'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'feb',
        text: i18n.t('static.month.feb'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'mar',
        text: i18n.t('static.month.mar'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'apr',
        text: i18n.t('static.month.apr'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'may',
        text: i18n.t('static.month.may'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'jun',
        text: i18n.t('static.month.jun'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'jul',
        text: i18n.t('static.month.jul'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'aug',
        text: i18n.t('static.month.aug'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'sep',
        text: i18n.t('static.month.sep'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'oct',
        text: i18n.t('static.month.oct'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'nov',
        text: i18n.t('static.month.nov'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }, {
        dataField: 'dec',
        text: i18n.t('static.month.dec'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatter
      }


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
        text: 'All', value: this.state.data.length
      }]
    }
    const MyExportCSV = (props) => {
      const handleClick = () => {
        props.onExport();
      };
      return (
        <div>

          <img style={{ height: '40px', width: '40px' }} src={csvicon} title="Export CSV" onClick={() => handleClick()} />


        </div>
      );
    };

    return (

      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} loading={(loading) => {
          this.setState({ loading: loading })
        }} />
        <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5 className="red">{i18n.t(this.state.message, { entityname })}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Card style={{ display: this.state.loading ? "none" : "block" }}>
          <div className="Card-header-reporticon pb-2">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleStockStatusOverTime() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
              </a>
              {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusmatrix')}</strong>{' '} */}
              {this.state.data.length > 0 && <div className="card-header-actions">
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
              </div>}
            </div>
          </div>
          <CardBody className="pb-md-3 pb-lg-2 pt-lg-0">
            <div className="pl-0">
              <div className="row">
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                  <div className="controls box">
                    <RangePicker
                      picker="year"
                      allowClear={false}
                      id="date" name="date"
                      //  style={{ width: '450px', marginLeft:'20px'}} 
                      onChange={this.onYearChange}
                      value={[moment(this.state.startYear.toString()), moment(this.state.endYear.toString())]} />

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
                        onChange={(e) => { this.filterVersion(); this.filterData(e) }}


                      >
                        <option value="0">{i18n.t('static.common.select')}</option>
                        {programList}
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
                        onChange={(e) => { this.getPlanningUnit(); }}
                      >
                        <option value="0">{i18n.t('static.common.select')}</option>
                        {versionList}
                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">

                    <MultiSelect
                      name="planningUnitId"
                      id="planningUnitId"
                      bsSize="md"
                      value={this.state.planningUnitValues}
                      onChange={(e) => { this.handlePlanningUnitChange(e) }}
                      options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                    />     </div></FormGroup>
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="includePlanningShipments"
                        id="includePlanningShipments"
                        bsSize="sm"
                        onChange={(e) => { this.filterData() }}
                      >
                        <option value="true">{i18n.t('static.program.yes')}</option>
                        <option value="false">{i18n.t('static.program.no')}</option>
                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="col-md-12 mt-2 " style={{ display: this.state.display }}>
                  <ul className="legendcommitversion list-group">
                    {
                      legendcolor.map(item1 => (
                        <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                      ))
                    }
                  </ul>
                </FormGroup>
              </div>
            </div>
            <div class="TableCust">
              {this.state.data.length > 0 &&
                <Table striped bordered hover responsive="md" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th rowSpan="2" className="text-center" style={{ width: "20%" }}>{i18n.t('static.planningunit.planningunit')}</th>
                      <th rowSpan="2" className="text-center" style={{ width: "5%" }}>{i18n.t('static.dashboard.unit')}</th>
                      <th rowSpan="2" className="text-center" style={{ width: "5%" }}>{i18n.t('static.common.min')}</th>
                      <th rowSpan="2" className="text-center" style={{ width: "5%" }}>{i18n.t('static.program.reorderFrequencyInMonths')}</th>
                      <th rowSpan="2" className="text-center" style={{ width: "5%" }} >{i18n.t('static.common.year')}</th>
                      <th colSpan="12" className="text-center">{i18n.t('static.report.monthsOfStock')}</th>

                    </tr>
                    <tr> <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.jan')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.feb')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.mar')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.apr')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.may')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.jun')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.jul')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.aug')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.sep')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.oct')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.nov')}</th>
                      <th className="text-center" style={{ width: "5%" }}>{i18n.t('static.month.dec')}</th></tr>
                  </thead>
                  <tbody>

                    {this.state.data.map(ele => {
                      return (<tr>
                        <td className="text-center"> {getLabelText(ele.planningUnit.label, this.state.lang)}</td>
                        <td className="text-center"> {getLabelText(ele.unit.label, this.state.lang)}</td>
                        <td className="text-center">{ele.minMonthsOfStock}</td>
                        <td className="text-center">{ele.reorderFrequency}</td>
                        <td className="text-center">{ele.year}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.jan)}>{this.formatter(ele.jan)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.feb)} > {this.formatter(ele.feb)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.mar)} > {this.formatter(ele.mar)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.apr)}> {this.formatter(ele.apr)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.may)}> {this.formatter(ele.may)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.jun)}> {this.formatter(ele.jun)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.jul)}> {this.formatter(ele.jul)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.aug)}> {this.formatter(ele.aug)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.sep)}> {this.formatter(ele.sep)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.oct)}> {this.formatter(ele.oct)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.nov)}> {this.formatter(ele.nov)}</td>
                        <td className="text-center" style={this.cellStyle(ele.minMonthsOfStock, ele.dec)}> {this.formatter(ele.dec)}</td></tr>)
                    })}

                  </tbody>
                </Table>
              }



            </div>
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


      </div>)
  }
}
