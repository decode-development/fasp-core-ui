import React from "react";
import { Formik } from 'formik';
import { Bar } from 'react-chartjs-2';
import {
  Card, CardBody,
  Label, Input, FormGroup, Table,
  CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalBody, ModalFooter, FormFeedback
} from 'reactstrap';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP_WITHOUT_DATE, DATE_FORMAT_CAP, TITLE_FONT, JEXCEL_DECIMAL_CATELOG_PRICE, SPECIAL_CHARECTER_WITH_NUM, TBD_PROCUREMENT_AGENT_ID } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";
import '../Forms/ValidationForms/ValidationForms.css';
import moment from "moment"
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import csvicon from '../../assets/img/csv.png';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion } from '../../CommonComponent/JExcelCommonFunctions.js'
import NumberFormat from 'react-number-format';
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import { Prompt } from "react-router-dom";
import pdfIcon from '../../assets/img/pdf.png';
import jsPDF from 'jspdf';
import { LOGO } from "../../CommonComponent/Logo";
import { green } from "@material-ui/core/colors";
import { red } from "@material-ui/core/colors";
import * as Yup from 'yup';

const entityname = i18n.t('static.dashboard.dataEntryAndAdjustment');
const initialValues = {
  otherUnitMultiplier: '',
  otherUnitName: ''
}

const validationSchema = function (values, t) {
  return Yup.object().shape({
    needOtherUnitValidation: Yup.boolean(),
    otherUnitName: Yup.string()
      .when("needOtherUnitValidation", {
        is: val => {
          return (document.getElementById("needOtherUnitValidation").value === "true");
        },
        then: Yup.string()
          .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
          .required(i18n.t('static.dataentry.otherUnitName'))
        ,
        otherwise: Yup.string().notRequired()
      }),
    otherUnitMultiplier: Yup.string()
      .max(30, i18n.t('static.common.max30digittext'))
      .required(i18n.t('static.dataentry.otherUnitMultiplier'))
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

export default class ConsumptionDataEntryandAdjustment extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      datasetList: [],
      datasetId: "",
      showInPlanningUnit: false,
      lang: localStorage.getItem("lang"),
      consumptionUnitShowArr: [],
      dataEl: "",
      unitQtyArr: [],
      unitQtyArrForRegion: [],
      planningUnitList: [],
      forecastingUnitList: [],
      aruList: [],
      loading: true,
      selectedPlanningUnitId: "",
      selectedPlanningUnitDesc: "",
      selectedPlanningUnitMultiplier: "",
      changedPlanningUnitMultiplier: "",
      changedConsumptionTypeId: "",
      toggleDataCheck: false,
      toggleDataChangeForSmallTable: false,
      missingMonthList: [],
      consumptionListlessTwelve: [],
      showSmallTable: false,
      showDetailTable: false,
      showOtherUnitNameField: false,
      allPlanningUnitList: [],
      message: "",
      messageColor: "green",
      consumptionChanged: false,
      selectedConsumptionUnitObject: { "consumptionDataType": "" },
      tempConsumptionUnitObject: { "consumptionDataType": "" },
      dataEnteredInUnitList: [],
    }
    this.loaded = this.loaded.bind(this);
    this.buildDataJexcel = this.buildDataJexcel.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.consumptionDataChanged = this.consumptionDataChanged.bind(this);
    this.checkValidationConsumption = this.checkValidationConsumption.bind(this);
    this.filterList = this.filterList.bind(this)
    this.resetClicked = this.resetClicked.bind(this)
  }

  filterList = function (instance, cell, c, r, source) {
    var value = (instance.jexcel.getJson(null, false)[r])[1];
    return this.state.mixedList.filter(c => c.type == value);
  }

  touchAll(setTouched, errors) {
    setTouched({
      otherUnitName: true,
      otherUnitMultiplier: true
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('dataEnteredInForm', (fieldName) => {
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

  cancelClicked() {
    var cont = false;
    if (this.state.consumptionChanged) {
      var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
      if (cf == true) {
        cont = true;
      } else {

      }
    } else {
      cont = true;
    }
    if (cont == true) {
      this.setState({
        consumptionChanged: false
      }, () => {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
      })
    }
  }

  buildDataJexcel(consumptionUnitId, isInterpolate) {
    localStorage.setItem("sesDatasetPlanningUnitId", consumptionUnitId);
    var cont = false;
    if (this.state.consumptionChanged && !isInterpolate) {
      var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
      if (cf == true) {
        cont = true;
      } else {

      }
    } else {
      cont = true;
    }
    if (cont == true) {
      this.setState({
        loading: true
      }, () => {
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
        var consumptionList = isInterpolate == 1 ? this.state.tempConsumptionList : this.state.consumptionList;
        console.log("consumptionList All--->", consumptionList)
        var consumptionUnit = {};
        var consumptionNotes = "";
        if (consumptionUnitId > 0) {
          consumptionUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == consumptionUnitId)[0];
          consumptionNotes = consumptionUnit.consumptionNotes;
        } else {
          consumptionUnit = {
            programPlanningUnitId: 0,
            planningUnit: {
              id: 0,
              label: {
              },
              multiplier: 1,
              forecastingUnit: {
                id: 0,
                label: {
                }
              }
            },
            consuptionForecast: true,
            treeForecast: false,
            consumptionNotes: "",
            consumptionDataType: 1,
            otherUnit: {
              id: 0,
              label: {
              },
              multiplier: 1,
            },
            selectedForecastMap: {},
          }
        }
        document.getElementById("consumptionNotes").value = consumptionNotes;
        var multiplier = 1;
        var changedConsumptionDataDesc = "";
        if (consumptionUnitId != 0) {
          if (consumptionUnit.consumptionDataType == 1) {
            multiplier = consumptionUnit.planningUnit.multiplier;
            changedConsumptionDataDesc = getLabelText(consumptionUnit.planningUnit.forecastingUnit.label, this.state.lang) + ' | ' + consumptionUnit.planningUnit.forecastingUnit.id;
          } else if (consumptionUnit.consumptionDataType == 2) {
            multiplier = 1;
            changedConsumptionDataDesc = getLabelText(consumptionUnit.planningUnit.label, this.state.lang) + ' | ' + consumptionUnit.planningUnit.id;;

          } else {
            multiplier = 1 / (consumptionUnit.otherUnit.multiplier / consumptionUnit.planningUnit.multiplier);
            changedConsumptionDataDesc = getLabelText(consumptionUnit.otherUnit.label, this.state.lang);

          }
        }
        consumptionList = consumptionList.filter(c => c.planningUnit.id == consumptionUnitId);
        console.log("consumptionList---->", consumptionList);
        var monthArray = this.state.monthArray;
        var regionList = this.state.regionList;
        let dataArray = [];
        let data = [];
        let columns = [];
        columns.push({ title: i18n.t('static.inventoryDate.inventoryReport'), type: 'text', width: 200 })
        data[0] = i18n.t('static.program.noOfDaysInMonth');
        for (var j = 0; j < monthArray.length; j++) {
          data[j + 1] = monthArray[j].noOfDays;
          columns.push({ title: moment(monthArray[j].date).format(DATE_FORMAT_CAP_WITHOUT_DATE), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', disabledMaskOnEdition: true, width: 100 })
        }
        data[monthArray.length + 1] = multiplier;
        columns.push({ type: 'hidden', title: 'Multiplier' })
        dataArray.push(data)
        data = [];
        for (var r = 0; r < regionList.length; r++) {
          data = [];
          data[0] = getLabelText(regionList[r].label);
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = "";
          }
          data[monthArray.length + 1] = multiplier;

          dataArray.push(data);
          data = [];
          data[0] = i18n.t('static.supplyPlan.actualConsumption')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 ? consumptionData[0].amount : "";
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.reportingRate')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 && consumptionData[0].reportingRate > 0 ? consumptionData[0].reportingRate : 100;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.stockedOut')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 && consumptionData[0].daysOfStockOut > 0 ? consumptionData[0].daysOfStockOut : 0;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.stockedOutPer')
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[j + 1] + "1"}*100,0)`;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.adjustedConsumption')
          for (var j = 0; j < monthArray.length; j++) {
            // data[j + 1] = `=ROUND((${colArr[j + 1]}${parseInt(dataArray.length - 3)}/${colArr[j + 1]}${parseInt(dataArray.length - 2)}/(1-(${colArr[j + 1]}${parseInt(dataArray.length - 1)}/${colArr[j + 1] + "1"})))*100,0)`;
            data[j + 1] = `=IF(${colArr[j + 1]}${parseInt(dataArray.length - 3)}=='','',ROUND((${colArr[j + 1]}${parseInt(dataArray.length - 3)}/${colArr[j + 1]}${parseInt(dataArray.length - 2)}/(1-(${colArr[j + 1]}${parseInt(dataArray.length - 1)}/${colArr[j + 1] + "1"})))*100,0))`;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.convertedToPlanningUnit')
          for (var j = 0; j < monthArray.length; j++) {
            // data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[monthArray.length + 1] + "0"},0)`;
            console.log("Multiplier 1@@@@@@@@@@@@@@@", multiplier1);
            data[j + 1] = `=IF(${colArr[j + 1]}${parseInt(dataArray.length - 4)}=='','',ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[monthArray.length + 1] + "1"},0))`;
          }
          data[monthArray.length + 1] = multiplier;

          dataArray.push(data);
          if (r != regionList.length - 1) {
            data = [];
            dataArray.push([]);
          }
        }
        var multiplier1 = 1;
        if (consumptionUnitId != 0) {
          if (consumptionUnit.consumptionDataType == 1) {
            multiplier1 = 1;
          } else if (consumptionUnit.consumptionDataType == 2) {
            multiplier1 = consumptionUnit.planningUnit.multiplier;
          } else {
            multiplier1 = consumptionUnit.otherUnit.multiplier;
          }
        }
        // for (var j = 0; j < monthArray.length; j++) {
        //   data = [];
        //   data[0] = langaugeList[j].languageId
        //   data[1] = langaugeList[j].label.label_en;
        //   data[2] = langaugeList[j].languageCode;
        //   data[3] = langaugeList[j].countryCode;
        //   data[4] = langaugeList[j].lastModifiedBy.username;
        //   data[5] = (langaugeList[j].lastModifiedDate ? moment(langaugeList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
        //   data[6] = langaugeList[j].active;

        //   languageArray[count] = data;
        //   count++;
        // }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var options = {
          data: dataArray,
          columnDrag: true,
          columns: columns,
          text: {
            // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            show: '',
            entries: '',
          },
          updateTable: function (el, cell, x, y, source, value, id) {
          },
          onload: this.loaded,
          onchange: function (instance, cell, x, y, value) {
            this.consumptionDataChanged(instance, cell, x, y, value)
            // this.setState({
            //   consumptionChanged: true
            // })
            if (this.state.consumptionChanged != true) { this.setState({ consumptionChanged: true }) }
          }.bind(this),

          pagination: false,
          search: false,
          columnSorting: false,
          tableOverflow: true,
          wordWrap: true,
          allowInsertColumn: false,
          allowManualInsertColumn: false,
          allowDeleteRow: false,
          copyCompatibility: true,
          allowExport: false,
          paginationOptions: JEXCEL_PAGINATION_OPTION,
          position: 'top',
          filters: false,
          freezeColumns: 1,
          license: JEXCEL_PRO_KEY,
          parseFormulas: true,
          contextMenu: function (obj, x, y, e) {
            return [];
          }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;

        // <td>{this.state.selectedConsumptionUnitId != 0 ? <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false} readOnly ></input> : <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false}></input>}</td>
        // <td>{c.dataType == 1 ? "Forecasting Unit" : c.dataType == 2 ? "Planning Unit" : "Other"}</td>
        // <td>{c.dataType == 1 ? getLabelText(c.forecastingUnit.label, this.state.lang) : c.dataType == 2 ? getLabelText(c.planningUnit.label, this.state.lang) : getLabelText(c.otherUnit.label, this.state.label)}</td>
        // <td>{c.dataType == 1 ? c.forecastingUnit.multiplier : c.dataType == 2 ? c.planningUnit.multiplier : c.otherUnit.multiplier}</td>

        // let dataList = this.state.consumptionUnitList;
        // let dataArray1 = [];
        // var mixedList = [];
        // var fuList = this.state.forecastingUnitList;
        // for (var fu = 0; fu < fuList.length; fu++) {
        //   var json = {
        //     id: fuList[fu].forecastingUnitId,
        //     name: getLabelText(fuList[fu].label),
        //     type: 1
        //   }
        //   mixedList.push(json)
        // }
        // var puList = this.state.planningUnitList;
        // for (var pu = 0; pu < fuList.length; pu++) {
        //   var json = {
        //     id: puList[pu].planningUnitId,
        //     name: getLabelText(puList[pu].label),
        //     type: 2
        //   }
        //   mixedList.push(json)
        // }
        // var aruList = this.state.aruList;
        // for (var aru = 0; aru < aruList.length; aru++) {
        //   var json = {
        //     id: aruList[aru].realmCountryPlanningUnitId,
        //     name: getLabelText(aruList[pu].label),
        //     type: 3
        //   }
        //   mixedList.push(json)
        // }
        // if (consumptionUnitId != 0) {
        // if(consumptionUnit.dataType==3){
        //   mixedList.push({ id: getLabelText(dataList[j].otherUnit.label, this.state.lang), name: getLabelText(dataList[j].otherUnit.label, this.state.lang) })
        // }
        //   data = [];
        //   data[0] = consumptionUnit.consumptionDataType == 1 ? true : false;
        //   data[1] = 1;
        //   data[2] = getLabelText(consumptionUnit.planningUnit.forecastingUnit.label, this.state.lang);
        //   data[3] = 1;
        //   data[4] = consumptionUnit.planningUnit.forecastingUnit.id;
        //   dataArray1.push(data);
        //   data = [];
        //   data[0] = consumptionUnit.consumptionDataType == 2 ? true : false;
        //   data[1] = 2;
        //   data[2] = getLabelText(consumptionUnit.planningUnit.label, this.state.lang);
        //   data[3] = parseInt(consumptionUnit.planningUnit.multiplier);
        //   data[4] = consumptionUnit.planningUnit.id;
        //   dataArray1.push(data);
        //   data = [];
        //   data[0] = consumptionUnit.consumptionDataType == 3 ? true : false;
        //   data[1] = 3;
        //   data[2] = consumptionUnit.consumptionDataType == 3 ? getLabelText(consumptionUnit.otherUnit.label, this.state.lang) : "";
        //   data[3] = consumptionUnit.consumptionDataType == 3 ? parseInt(consumptionUnit.otherUnit.multiplier) : "";
        //   data[4] = consumptionUnit.consumptionDataType == 3 ? consumptionUnit.otherUnit.id : "";
        //   dataArray1.push(data);
        // } else {
        //   data = [];
        //   data[0] = false;
        //   data[1] = 1;
        //   data[2] = "";
        //   data[3] = "";
        //   data[4] = "";
        //   dataArray1.push(data);
        //   data = [];
        //   data[0] = true;
        //   data[1] = 2;
        //   data[2] = "";
        //   data[3] = "";
        //   data[4] = "";
        //   dataArray1.push(data);
        //   data = [];
        //   data[0] = false;
        //   data[1] = 3;
        //   data[2] = "";
        //   data[3] = "";
        //   data[4] = "";
        //   dataArray1.push(data);
        // }

        // for (var j = 0; j < dataList.length; j++) {
        //   if (dataList[j].dataType == 3) {
        //     mixedList.push({ id: getLabelText(dataList[j].otherUnit.label, this.state.lang), name: getLabelText(dataList[j].otherUnit.label, this.state.lang) })
        //   }
        //   data = [];
        //   var c = dataList[j]
        //   data[0] = c.forecastConsumptionUnitId == consumptionUnitId ? true : false
        //   data[1] = c.dataType;
        //   data[2] = c.dataType == 1 ? c.forecastingUnit.id : c.dataType == 2 ? c.planningUnit.id : getLabelText(c.otherUnit.label, this.state.lang);
        //   data[3] = c.dataType == 1 ? c.forecastingUnit.multiplier : c.dataType == 2 ? c.planningUnit.multiplier : c.otherUnit.multiplier;
        //   dataArray1.push(data);
        // }

        // if (consumptionUnitId == 0) {
        //   data = [];
        //   data[0] = true
        //   data[1] = "";
        //   data[2] = "";
        //   data[3] = "";
        //   dataArray1.push(data);
        // }

        // var editable = consumptionUnitId > 0 ? false : true;
        // this.el = jexcel(document.getElementById("smallTableDiv"), '');
        // this.el.destroy();
        // var options1 = {
        //   data: dataArray1,
        //   columnDrag: true,
        //   colWidths: [0, 150, 150, 150, 100, 100, 100],
        //   colHeaderClasses: ["Reqasterisk"],
        //   columns: [
        //     {
        //       title: i18n.t('static.realm.default'),
        //       type: 'radio'
        //     },
        //     {
        //       title: i18n.t('static.dataentry.dataType'),
        //       type: 'dropdown',
        //       source: [{ id: 1, name: i18n.t('static.product.unit1') }, { id: 2, name: i18n.t('static.product.product') }, { id: 3, name: i18n.t('static.dataentry.other') }],
        //     },
        //     {
        //       title: i18n.t('static.dashboard.Productmenu'),
        //       type: 'text',
        //       // source: mixedList,
        //       // filter: this.filterList
        //     },
        //     {
        //       title: i18n.t('static.importFromQATSupplyPlan.multiplier'),
        //       type: 'numeric'
        //     },
        //     {
        //       title: i18n.t('static.importFromQATSupplyPlan.multiplier'),
        //       type: 'hidden'
        //     }
        //   ],
        //   text: {
        //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        //     show: '',
        //     entries: '',
        //   },
        //   editable: editable,
        //   onchange: function (instance, cell, x, y, value) {
        //     this.setState({
        //       consumptionChanged: true
        //     })
        //   }.bind(this),
        //   onload: function (obj, x, y, e) {
        //     obj.jexcel.hideIndex(0);
        //     var elInstance = obj.jexcel;
        //     var json = obj.jexcel.getJson(null, true);
        //     var l = consumptionUnitId == 0 ? 2 : 3;
        //     for (var j = 0; j < l; j++) {
        //       if (consumptionUnitId != 0) {
        //         var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
        //         cell.classList.add('readonly');
        //       }
        //       var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
        //       cell.classList.add('readonly');
        //       var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
        //       cell.classList.add('readonly');
        //       var cell = elInstance.getCell(("D").concat(parseInt(j) + 1))
        //       cell.classList.add('readonly');
        //     }
        //     if (consumptionUnitId == 0) {
        //       var cell = elInstance.getCell(("B").concat(parseInt(2) + 1))
        //       cell.classList.add('readonly');
        //     }
        //   },
        //   pagination: false,
        //   search: false,
        //   columnSorting: false,
        //   tableOverflow: true,
        //   wordWrap: true,
        //   allowInsertColumn: false,
        //   allowManualInsertColumn: false,
        //   allowDeleteRow: false,
        //   copyCompatibility: true,
        //   allowExport: false,
        //   paginationOptions: JEXCEL_PAGINATION_OPTION,
        //   position: 'top',
        //   filters: true,
        //   license: JEXCEL_PRO_KEY,
        //   contextMenu: function (obj, x, y, e) {
        //     return [];
        //   }.bind(this),
        // };
        // var smallTableEl = jexcel(document.getElementById("smallTableDiv"), options1);
        // this.el = smallTableEl;
        this.setState({
          dataEl: dataEl, loading: false,
          // smallTableEl: smallTableEl,
          selectedConsumptionUnitId: consumptionUnitId,
          selectedConsumptionUnitObject: consumptionUnit,
          tempConsumptionUnitObject: consumptionUnit,
          selectedPlanningUnitId: consumptionUnit.planningUnit.id,
          selectedPlanningUnitMultiplier: multiplier1,
          showDetailTable: true,
          selectedPlanningUnitDesc: changedConsumptionDataDesc,
          changedPlanningUnitMultiplier: multiplier1,
          changedConsumptionTypeId: consumptionUnit.consumptionDataType,
          dataEnteredIn: consumptionUnit.consumptionDataType,
          showOtherUnitNameField: consumptionUnit.consumptionDataType == 3 ? true : false,
          otherUnitName: consumptionUnit.consumptionDataType == 3 ? consumptionUnit.otherUnit.label.label_en : "",
          selectedPlanningUnitMultiplier: consumptionUnit.consumptionDataType == 1 ? 1 : consumptionUnit.consumptionDataType == 2 ? consumptionUnit.planningUnit.multiplier : consumptionUnit.otherUnit.multiplier,
          consumptionChanged: isInterpolate ? true : false
        })
      })
    }
  }

  consumptionDataChanged = function (instance, cell, x, y, value) {
    var possibleActualConsumptionY = [];
    var possibleReportRateY = [];
    var possibleStockDayY = [];
    var adjustedConsumptionY = [];
    var actualConsumptionStart = 2;
    var reportRateStart = 3;
    var stockDayStart = 4;
    var adjustedConsumption = 6;

    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
    var regionList = this.state.regionList;
    for (var i = 0; i < regionList.length; i++) {
      possibleActualConsumptionY.push(actualConsumptionStart.toString());
      possibleReportRateY.push(reportRateStart.toString());
      possibleStockDayY.push(stockDayStart.toString());
      adjustedConsumptionY.push(adjustedConsumption.toString());
      actualConsumptionStart += 8;
      reportRateStart += 8;
      stockDayStart += 8;
      adjustedConsumption += 8;
    }
    var elInstance = this.state.dataEl;
    if (possibleActualConsumptionY.includes(y.toString())) {
      value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
      value = value.replaceAll(',', '');
      if (value == "") {
      } else if (value < 0) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
        elInstance.setComments(col, "Please enter a positive number");

      } else {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setComments(col, "");
      }
    }
    if (possibleReportRateY.includes(y.toString())) {
      value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
      value = value.replaceAll(',', '');
      if (value == "") {
      }
      else if (value < 0 || value > 100) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
        elInstance.setComments(col, "Please enter any positive number upto 100");
      }
      else {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setComments(col, "");
      }
    }
    if (possibleStockDayY.includes(y.toString())) {
      value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
      value = value.replaceAll(',', '');
      var stockOutdays = elInstance.getColumnData(x)[0];
      if (value == "") {
      } else if (value < 0 || value > stockOutdays) {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col, "background-color", "yellow");
        // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
        elInstance.setComments(col, "Please enter positive value lesser than number of days.");
      } else {
        var col = (colArr[x]).concat(parseInt(y) + 1);
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setComments(col, "");
      }
    }
  }

  checkValidationConsumption() {
    var valid = true;
    var elInstance = this.state.dataEl;
    var json = elInstance.getJson(null, false);
    var possibleActualConsumptionY = [];
    var possibleReportRateY = [];
    var possibleStockDayY = [];
    var actualConsumptionStart = 2;
    var reportRateStart = 3;
    var stockDayStart = 4;
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
    var regionList = this.state.regionList;

    for (var i = 0; i < regionList.length; i++) {
      possibleActualConsumptionY.push(actualConsumptionStart.toString());
      possibleReportRateY.push(reportRateStart.toString());
      possibleStockDayY.push(stockDayStart.toString());
      actualConsumptionStart += 8;
      reportRateStart += 8;
      stockDayStart += 8;
    }
    for (var y = 0; y < json.length; y++) {
      for (var x = 1; x < 37; x++) {
        // var rowData = elInstance.getRowData(y);
        var value = elInstance.getValue(`${colArr[x]}${parseInt(y) + 1}`, true);
        value = value.replaceAll(',', '');
        if (possibleActualConsumptionY.includes(y.toString())) {
          if (value == "") {
          } else if (value < 0) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
            elInstance.setComments(col, "Please enter a positive number')");
            valid = false;
          } else {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
          }
        }

        if (possibleReportRateY.includes(y.toString())) {
          console.log("possibleReportRateY--", y.toString());
          if (value == "") {

          }
          else if (value < 0 || value > 100) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            //elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
            elInstance.setComments(col, "Please enter any positive number upto 100");
            valid = false;
          }
          else {
            var col = (colArr[x]).concat(parseInt(y) + 1);

            console.log("possibleReportRateY--Col esle  ", col);

            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
          }
        }

        if (possibleStockDayY.includes(y.toString())) {
          var stockOutdays = elInstance.getColumnData(x)[0];
          if (value == "") {
          } else if (value < 0 || value > stockOutdays) {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            // elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
            elInstance.setComments(col, "Please enter positive value lesser than number of days.");
            valid = false;
          } else {
            var col = (colArr[x]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
          }
        }
      }
    }
    console.log("valid--", valid)
    return valid;
  }

  interpolationMissingActualConsumption() {
    var notes = "";
    var monthArray = this.state.monthArray;
    var regionList = this.state.regionList;
    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
    var curUser = AuthenticationService.getLoggedInUserId();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
    var consumptionUnit = this.state.selectedConsumptionUnitObject;
    // if (this.state.selectedConsumptionUnitId == 0) {
    //   var json = this.state.smallTableEl.getJson(null, false);
    //   var dataType = 0;
    //   if (json[0][0] == true) {
    //     dataType = 1;
    //   } else if (json[2][0] == true) {
    //     dataType = 3;
    //   } else {
    //     dataType = 2
    //   }

    //   var fu = this.state.forecastingUnitList.filter(c => c.forecastingUnitId == (json[0])[4])[0];
    //   var pu = this.state.allPlanningUnitList.filter(c => c.planningUnitId == this.state.selectedPlanningUnitId)[0];
    //   var consumptionUnit = {
    //     programPlanningUnitId: 0,
    //     planningUnit: {
    //       forecastingUnit: {
    //         id: (json[0])[4],
    //         label: fu.label
    //       },
    //       id: pu.planningUnitId,
    //       label: pu.label,
    //       multiplier: json[0][3]
    //     },
    //     consuptionForecast: true,
    //     treeForecast: false,
    //     stock: "",
    //     existingShipments: "",
    //     monthsOfStock: "",
    //     procurementAgent: {
    //       id: "",
    //       label: {}
    //     },
    //     price: "",
    //     higherThenConsumptionThreshold: "",
    //     lowerThenConsumptionThreshold: "",
    //     consumptionNotes: "",
    //     consumptionDataType: dataType,
    //     otherUnit: {
    //       id: 0,
    //       label: {
    //         label_en: json[2][2]
    //       },
    //       multiplier: json[2][3]
    //     },
    //     selectedForecastMap: {},
    //     createdBy: {
    //       userId: curUser
    //     },
    //     createdDate: curDate
    //   }
    // }
    var fullConsumptionList = this.state.tempConsumptionList.filter(c => c.planningUnit.id != consumptionUnit.planningUnit.id);
    var elInstance = this.state.dataEl;
    for (var i = 0; i < monthArray.length; i++) {
      var columnData = elInstance.getColumnData([i + 1]);
      var actualConsumptionCount = 6;
      var reportingRateCount = 3;
      var daysOfStockOutCount = 4;
      var actualConsumptionCount1 = 2;
      for (var r = 0; r < regionList.length; r++) {
        var index = -1;
        //   index = fullConsumptionList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
        // index = fullConsumptionList.findIndex(con =>  con.region.id == regionList[r].regionId && moment(con.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
        var value = elInstance.getValue(`${colArr[i + 1]}${parseInt(actualConsumptionCount) + 1}`, true);
        var actualValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(actualConsumptionCount1) + 1}`, true);
        // console.log("value----->", value);
        // console.log("Actual value----->", actualValue);
        // console.log("Actual value----->", value === '');
        if (actualValue !== "") {
          // console.log("columnData[actualConsumptionCount]", columnData[actualConsumptionCount])
          if (index != -1) {
            fullConsumptionList[index].amount = (value === "" ? actualValue : value.replaceAll(',', ''));
            fullConsumptionList[index].daysOfStockOut = columnData[daysOfStockOutCount];
            fullConsumptionList[index].reportingRate = columnData[reportingRateCount];
          } else {
            var json = {
              amount: value === "" ? actualValue : value.replaceAll(',', ''),
              planningUnit: {
                id: consumptionUnit.planningUnit.id,
                label: consumptionUnit.planningUnit.label
              },
              createdBy: {
                userId: curUser
              },
              createdDate: curDate,
              daysOfStockOut: columnData[daysOfStockOutCount],
              exculde: false,
              forecastConsumptionId: 0,
              month: moment(monthArray[i].date).format("YYYY-MM-DD"),
              region: {
                id: regionList[r].regionId,
                label: regionList[r].label
              },
              reportingRate: columnData[reportingRateCount]
            }
            fullConsumptionList.push(json);
          }
        }
        actualConsumptionCount += 8;
        actualConsumptionCount1 += 8;
        reportingRateCount += 8;
        daysOfStockOutCount += 8
      }
    }

    for (var r = 0; r < regionList.length; r++) {
      for (var j = 0; j < monthArray.length; j++) {
        var consumptionData = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && Number(c.amount) >= 0);
        if (consumptionData.length == 0) {
          var startValList = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") < moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && Number(c.amount) >= 0)
            .sort(function (a, b) {
              return new Date(a.month) - new Date(b.month);
            });
          var endValList = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") > moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && Number(c.amount) >= 0)
            .sort(function (a, b) {
              return new Date(a.month) - new Date(b.month);
            });

          if (startValList.length > 0 && endValList.length > 0) {
            var startVal = startValList[startValList.length - 1].amount;
            var startMonthVal = startValList[startValList.length - 1].month;
            var endVal = endValList[0].amount;
            var endMonthVal = endValList[0].month;
            notes += regionList[r].label + " " + moment(monthArray[j].date).format("YYYY-MM");
            //y=y1+(x-x1)*(y2-y1)/(x2-x1);
            const monthDifference = moment(new Date(monthArray[j].date)).diff(new Date(startMonthVal), 'months', true);
            const monthDiff = moment(new Date(endMonthVal)).diff(new Date(startMonthVal), 'months', true);
            var missingActualConsumption = Number(startVal) + (monthDifference * ((Number(endVal) - Number(startVal)) / monthDiff));
            var json = {
              amount: missingActualConsumption.toFixed(0),
              planningUnit: {
                id: consumptionUnit.planningUnit.id,
                label: consumptionUnit.planningUnit.label
              },
              createdBy: {
                userId: curUser
              },
              createdDate: curDate,
              daysOfStockOut: columnData[daysOfStockOutCount],
              exculde: false,
              forecastConsumptionId: 0,
              month: moment(monthArray[j].date).format("YYYY-MM-DD"),
              region: {
                id: regionList[r].regionId,
                label: regionList[r].label
              },
              reportingRate: columnData[reportingRateCount]
            }
            fullConsumptionList.push(json);
          }
        }
      }
    }
    // document.getElementById("consumptionNotes").value = document.getElementById("consumptionNotes").value.concat(notes).concat("filled in with interpolated");
    document.getElementById("consumptionNotes").value = notes;

    this.setState({
      tempConsumptionList: fullConsumptionList,
      consumptionChanged: true
    })
    this.buildDataJexcel(this.state.selectedConsumptionUnitId, 1);
  }

  saveConsumptionList() {
    this.setState({
      loading: true
    })
    var validation = this.checkValidationConsumption();
    if (validation) {
      var db1;
      var storeOS;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onerror = function (event) {
        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
        this.props.updateState("color", "red");
        this.props.hideFirstComponent();
      }.bind(this);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['datasetData'], 'readwrite');
        var datasetTransaction = transaction.objectStore('datasetData');
        var datasetRequest = datasetTransaction.get(this.state.datasetId);
        datasetRequest.onerror = function (event) {
        }.bind(this);
        datasetRequest.onsuccess = function (event) {
          var myResult = datasetRequest.result;
          var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
          var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
          var datasetJson = JSON.parse(datasetData);
          var elInstance = this.state.dataEl;
          var consumptionList = [];
          var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
          var curUser = AuthenticationService.getLoggedInUserId();
          var consumptionUnit = this.state.selectedConsumptionUnitObject;
          var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
          console.log("this.state.consumptionList", this.state.consumptionList);
          var fullConsumptionList = this.state.consumptionList.filter(c => c.planningUnit.id != consumptionUnit.planningUnit.id);
          // if (this.state.selectedConsumptionUnitId == 0) {
          //   var json = this.state.smallTableEl.getJson(null, false);
          //   var dataType = 0;
          //   if (json[0][0] == true) {
          //     dataType = 1;
          //   } else if (json[2][0] == true) {
          //     dataType = 3;
          //   } else {
          //     dataType = 2
          //   }
          //   console.log("json----", json)
          //   console.log("dataType----", dataType)
          //   console.log("this.state.selectedPlanningUnitId----", this.state.selectedPlanningUnitId)
          //   console.log("changedPlanningUnitMultiplier----", this.state.changedPlanningUnitMultiplier)

          //   var fu = this.state.forecastingUnitList.filter(c => c.forecastingUnitId == (json[0])[4])[0];
          //   var pu = this.state.allPlanningUnitList.filter(c => c.planningUnitId == this.state.selectedPlanningUnitId)[0];
          //   var consumptionUnit = {
          //     programPlanningUnitId: 0,
          //     planningUnit: {
          //       forecastingUnit: {
          //         id: (json[0])[4],
          //         label: fu.label
          //       },
          //       id: pu.planningUnitId,
          //       label: pu.label,
          //       multiplier: json[0][3]
          //     },
          //     consuptionForecast: true,
          //     treeForecast: false,
          //     stock: "",
          //     existingShipments: "",
          //     monthsOfStock: "",
          //     procurementAgent: {
          //       id: "",
          //       label: {}
          //     },
          //     price: "",
          //     higherThenConsumptionThreshold: "",
          //     lowerThenConsumptionThreshold: "",
          //     consumptionNotes: "",
          //     consumptionDataType: dataType,
          //     otherUnit: {
          //       id: 0,
          //       label: {
          //         label_en: json[2][2]
          //       },
          //       multiplier: json[2][3]
          //     },
          //     selectedForecastMap: {},
          //     createdBy: {
          //       userId: curUser
          //     },
          //     createdDate: curDate
          //   }
          // }
          var monthArray = this.state.monthArray;
          var regionList = this.state.regionList;
          for (var i = 0; i < monthArray.length; i++) {

            var columnData = elInstance.getColumnData([i + 1]);
            var actualConsumptionCount = 2;
            var reportingRateCount = 3;
            var daysOfStockOutCount = 4;
            for (var r = 0; r < regionList.length; r++) {
              console.log("&&&&&&&&&&MonthList", monthArray[i]);
              var index = 0;
              index = fullConsumptionList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
              var actualConsumptionValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(actualConsumptionCount) + 1}`, true).replaceAll(",", "");
              var reportingRateValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(reportingRateCount) + 1}`, true);
              var daysOfStockOutValue = elInstance.getValue(`${colArr[i + 1]}${parseInt(daysOfStockOutCount) + 1}`, true);
              console.log("&&&&&&&&&&ActualConsumptionValue", actualConsumptionValue);
              if (actualConsumptionValue !== "") {
                if (index != -1) {
                  fullConsumptionList[index].amount = actualConsumptionValue;
                  fullConsumptionList[index].reportingRate = reportingRateValue;
                  fullConsumptionList[index].daysOfStockOut = daysOfStockOutValue;
                } else {
                  var json = {
                    amount: actualConsumptionValue,
                    planningUnit: {
                      id: consumptionUnit.planningUnit.id,
                      label: consumptionUnit.planningUnit.label
                    },
                    createdBy: {
                      userId: curUser
                    },
                    createdDate: curDate,
                    daysOfStockOut: daysOfStockOutValue,
                    exculde: false,
                    forecastConsumptionId: 0,
                    month: moment(monthArray[i].date).startOf('month').format("YYYY-MM-DD"),
                    region: {
                      id: regionList[r].regionId,
                      label: regionList[r].label
                    },
                    reportingRate: reportingRateValue
                  }
                  fullConsumptionList.push(json);
                }
              }
              actualConsumptionCount += 8;
              reportingRateCount += 8;
              daysOfStockOutCount += 8
            }
          }
          var planningUnitList = datasetJson.planningUnitList;
          // if (this.state.selectedConsumptionUnitId == 0) {
          //   planningUnitList.push(consumptionUnit);
          // }

          var planningUnitIndex = planningUnitList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id);
          planningUnitList[planningUnitIndex].consumptionNotes = document.getElementById("consumptionNotes").value;
          planningUnitList[planningUnitIndex].consumptionDataType = this.state.dataEnteredIn;
          if (this.state.dataEnteredIn == 3) {
            var otherUnitJson = {
              id: null,
              label: {
                label_en: this.state.otherUnitName
              },
              multiplier: this.state.selectedPlanningUnitMultiplier
            }
            planningUnitList[planningUnitIndex].otherUnit = otherUnitJson;
          }

          datasetJson.actualConsumptionList = fullConsumptionList;
          datasetJson.planningUnitList = planningUnitList;
          datasetData = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString()
          myResult.programData = datasetData;
          var putRequest = datasetTransaction.put(myResult);

          putRequest.onerror = function (event) {
          }.bind(this);
          putRequest.onsuccess = function (event) {

            //this.el = jexcel(document.getElementById("tableDiv"), '');
            //this.el.destroy();
            //this.el = jexcel(document.getElementById("smallTableDiv"), '');
            //this.el.destroy();


            this.setState({
              // dataEl: "",
              showDetailTable: true,
              loading: false,
              message: i18n.t('static.compareAndSelect.dataSaved'),
              messageColor: "green",
              consumptionChanged: false
            }, () => {
              this.getDatasetData();
              this.hideFirstComponent();
            })
          }.bind(this)
        }.bind(this)
      }.bind(this)
    } else {
      this.setState({
        loading: false,
        message: i18n.t('static.supplyPlan.validationFailed'),
        messageColor: "red"
      })
    }
  }

  hideFirstComponent() {
    document.getElementById('div1').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 30000);
  }

  hideSecondComponent() {
    document.getElementById('div2').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 30000);
  }

  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'];
    var elInstance = instance.jexcel;
    var json = elInstance.getJson(null, false);
    var arr = [];
    var count = 1;
    for (var r = 0; r < this.state.regionList.length; r++) {
      arr.push(count);
      count += 8;
    }
    for (var j = 0; j < json.length; j++) {
      var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
      if (arr.includes(j)) {
        cell.classList.add('regionBold');
      }
      cell.classList.add('readonly');
    }

    for (var j = 0; j < this.state.monthArray.length; j++) {
      var count = 2;
      var count1 = 1;
      var count2 = 6;
      var count3 = 7;
      var count4 = 8;
      for (var r = 0; r < this.state.regionList.length; r++) {
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count)))
        cell.classList.add('readonly');
        cell.classList.add('regionBold');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count1)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count2)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count3)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count4)))
        cell.classList.add('readonly');
        count = count + 8;
        count1 = count1 + 8;
        count2 = count2 + 8;
        count3 = count3 + 8;
        count4 = count4 + 8;
      }
    }
  }

  toggleAccordion(consumptionUnitId) {
    var consumptionUnitShowArr = this.state.consumptionUnitShowArr;
    if (consumptionUnitShowArr.includes(consumptionUnitId)) {
      consumptionUnitShowArr = consumptionUnitShowArr.filter(c => c != consumptionUnitId);
    } else {
      consumptionUnitShowArr.push(consumptionUnitId)
    }
    this.setState({
      consumptionUnitShowArr: consumptionUnitShowArr
    })
  }

  componentDidMount() {
    this.hideSecondComponent();
    this.getDatasetList();
  }

  addDoubleQuoteToRowContent = (arr) => {
    return arr.map(ele => '"' + ele + '"')
  }

  exportCSV() {
    var csvRow = [];

    csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1])).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (getLabelText(this.state.datasetJson.label, this.state.lang)).replaceAll(' ', '%20') + '"')
    csvRow.push('')

    var elInstance = this.state.dataEl;
    var actualConsumption = 3;
    var reportingRateCount = 4;
    var stockOutCount = 5;
    var stockOutPercentCount = 6;
    var adjustedConsumptionCount = 7;
    var convertedToPlanningUnitCount = 8;

    csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    if (this.state.selectedConsumptionUnitId > 0) {
      csvRow.push('"' + (i18n.t('static.dashboard.planningunitheader') + ' : ' + document.getElementById("planningUnitId").value).replaceAll(' ', '%20') + '"')
    }
    csvRow.push('')
    csvRow.push('')
    var columns = [];
    columns.push(i18n.t('static.dashboard.Productmenu').replaceAll(' ', '%20'));
    this.state.monthArray.map(item => (
      columns.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
    ))
    columns.push(i18n.t('static.supplyPlan.total').replaceAll(' ', '%20'));
    columns.push(i18n.t('static.dataentry.regionalPer').replaceAll(' ', '%20'));

    let headers = [];
    columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
    var A = [this.addDoubleQuoteToRowContent(headers)];

    this.state.planningUnitList.map(item => {
      var total = 0;
      var totalPU = 0;
      var datacsv = [];
      datacsv.push((item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang)).replaceAll(' ', '%20'));
      this.state.monthArray.map((item1, count) => {
        var data = this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"));
        total += Number(data[0].qty);
        totalPU += Number(data[0].qtyInPU);
        datacsv.push(this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty)
      })
      datacsv.push(this.state.showInPlanningUnit ? Math.round(totalPU) : Math.round(total));
      datacsv.push("100 %");
      A.push(this.addDoubleQuoteToRowContent(datacsv))

      this.state.regionList.map(r => {
        var datacsv = [];
        var totalRegion = 0;
        var totalRegionPU = 0;
        datacsv.push((getLabelText(r.label, this.state.lang)).replaceAll(' ', '%20'))
        {
          this.state.monthArray.map((item1, count) => {
            var data = this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.region.regionId == r.regionId)
            totalRegion += Number(data[0].qty);
            totalRegionPU += Number(data[0].qtyInPU);
            datacsv.push(this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty)
          })
        }
        A.push(this.addDoubleQuoteToRowContent(datacsv))
      });
    });

    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    if (this.state.selectedConsumptionUnitId > 0) {

      csvRow.push('')
      csvRow.push('')
      headers = [];
      var columns = [];
      columns.push(i18n.t('static.inventoryDate.inventoryReport').replaceAll(' ', '%20'))
      this.state.monthArray.map(item => (
        columns.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
      ))
      columns.push('')
      columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
      var C = []
      C.push([this.addDoubleQuoteToRowContent(headers)]);
      var B = [];
      var monthArray = this.state.monthArray;
      var regionList = this.state.regionList;
      var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
      B.push(i18n.t('static.program.noOfDaysInMonth').replaceAll('#', '%23').replaceAll(' ', '%20'))
      for (var j = 0; j < monthArray.length; j++) {
        B.push(monthArray[j].noOfDays)
      }
      C.push(this.addDoubleQuoteToRowContent(B));

      for (var r = 0; r < regionList.length; r++) {
        B = [];
        B.push((getLabelText(regionList[r].label)).replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push("")
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.supplyPlan.actualConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(actualConsumption)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.reportingRate').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(reportingRateCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOut').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(stockOutCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOutPer').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(stockOutPercentCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];

        B.push(i18n.t('static.dataentry.adjustedConsumption').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push((elInstance.getValue(`${colArr[j + 1]}${parseInt(adjustedConsumptionCount)}`, true).toString().replaceAll("\,", "")))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];

        B.push(i18n.t('static.dataentry.convertedToPlanningUnit').replaceAll(' ', '%20'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(convertedToPlanningUnitCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        actualConsumption += 8;
        reportingRateCount += 8;
        stockOutCount += 8;
        stockOutPercentCount += 8;
        adjustedConsumptionCount += 8;
        convertedToPlanningUnitCount += 8;
      }

      for (var i = 0; i < C.length; i++) {
        csvRow.push(C[i].join(","))
      }
    }


    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.dataEntryAndAdjustment') + ".csv"
    a.download = document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.dataEntryAndAdjustment') + "-" + (this.state.selectedConsumptionUnitId > 0 ? document.getElementById("planningUnitId").value : "") + ".csv"
    document.body.appendChild(a)
    a.click()
  }


  getDatasetList() {
    this.setState({
      loading: true
    })
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
      var datasetOs = datasetTransaction.objectStore('datasetData');
      var getRequest = datasetOs.getAll();
      getRequest.onerror = function (event) {
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var datasetList = this.state.datasetList;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var mr = 0; mr < myResult.length; mr++) {
          if (myResult[mr].userId == userId) {
            var json = {
              id: myResult[mr].id,
              name: myResult[mr].programCode + "~v" + myResult[mr].version,
              dataset: myResult[mr]
            }
            datasetList.push(json)
          }
        }
        var datasetId = "";
        var event = {
          target: {
            value: ""
          }
        };
        if (datasetList.length == 1) {
          datasetId = datasetList[0].id;
          event.target.value = datasetList[0].id;
        } else if (localStorage.getItem("sesDatasetId") != "" && datasetList.filter(c => c.id == localStorage.getItem("sesDatasetId")).length > 0) {
          datasetId = localStorage.getItem("sesDatasetId");
          event.target.value = localStorage.getItem("sesDatasetId");
        }
        datasetList = datasetList.sort(function (a, b) {
          a = a.name.toLowerCase();
          b = b.name.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({
          datasetList: datasetList,
          loading: false
        }, () => {
          if (datasetId != "") {
            this.setDatasetId(event);
          }
        })
      }.bind(this)
    }.bind(this)
  }

  setDatasetId(e) {
    var cont = false;
    if (this.state.consumptionChanged) {
      var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
      if (cf == true) {
        cont = true;
      } else {

      }
    } else {
      cont = true;
    }
    if (cont == true) {
      this.setState({
        loading: true
      })
      var datasetId = e.target.value;
      localStorage.setItem("sesDatasetId", datasetId);
      this.setState({
        datasetId: datasetId,
      }, () => {
        if (datasetId != "") {
          this.getDatasetData();
        } else {
          this.setState({
            showSmallTable: false,
            showDetailTable: false
          })
        }
      })
    }
  }

  getDatasetData() {
    this.setState({
      loading: true
    })
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;

      var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
      var datasetOs = datasetTransaction.objectStore('datasetData');
      var dsRequest = datasetOs.get(this.state.datasetId);
      dsRequest.onerror = function (event) {
      }.bind(this);
      dsRequest.onsuccess = function (event) {

        var tcTransaction = db1.transaction(['tracerCategory'], 'readwrite');
        var tcOs = tcTransaction.objectStore('tracerCategory');
        var tcRequest = tcOs.getAll();
        tcRequest.onerror = function (event) {
        }.bind(this);
        tcRequest.onsuccess = function (event) {
          var myResult = [];
          myResult = tcRequest.result;

          var fuTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
          var fuOs = fuTransaction.objectStore('forecastingUnit');
          var fuRequest = fuOs.getAll();
          fuRequest.onerror = function (event) {
          }.bind(this);
          fuRequest.onsuccess = function (event) {
            var fuResult = [];
            fuResult = fuRequest.result;

            var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
            var puOs = puTransaction.objectStore('planningUnit');
            var puRequest = puOs.getAll();
            puRequest.onerror = function (event) {
            }.bind(this);
            puRequest.onsuccess = function (event) {
              var puResult = [];
              puResult = puRequest.result;
              // var datasetData = this.state.datasetList.filter(c => c.id == )[0].dataset;
              var datasetData = dsRequest.result;
              var datasetDataBytes = CryptoJS.AES.decrypt(datasetData.programData, SECRET_KEY);
              var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
              var datasetJson = JSON.parse(datasetData);
              console.log("datasetJson@@@@@@@@@@@@@@", datasetJson);
              var consumptionList = datasetJson.actualConsumptionList;
              var planningUnitList = datasetJson.planningUnitList.filter(c => c.consuptionForecast);
              var regionList = datasetJson.regionList;
              regionList.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
              });

              var startDate = moment(Date.now()).add(-36, 'months').format("YYYY-MM-DD");
              var stopDate = moment(Date.now()).format("YYYY-MM-DD");
              var daysInMonth = datasetJson.currentVersion.daysInMonth;
              var monthArray = [];
              var curDate = startDate;
              var planningUnitTotalList = [];
              var planningUnitTotalListRegion = [];
              var totalPlanningUnitData = [];
              for (var m = 0; curDate < stopDate; m++) {
                curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                var daysInCurrentDate = moment(curDate, "YYYY-MM").daysInMonth();
                var noOfDays = daysInMonth > 0 ? daysInMonth > daysInCurrentDate ? daysInCurrentDate : daysInMonth : daysInCurrentDate;
                monthArray.push({ date: curDate, noOfDays: noOfDays })
                var totalPlanningUnit = 0;
                var totalPlanningUnitPU = 0;
                for (var cul = 0; cul < planningUnitList.length; cul++) {
                  var totalQty = "";
                  var totalQtyPU = "";
                  for (var r = 0; r < regionList.length; r++) {
                    var consumptionDataForMonth = consumptionList.filter(c => c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.planningUnit.id == planningUnitList[cul].planningUnit.id)
                    var qty = 0;
                    var qtyInPU = 0;
                    var reportingRate = "";
                    var actualConsumption = "";
                    var daysOfStockOut = ""
                    console.log("consumptionDataForMonth--------->", consumptionDataForMonth)
                    if (consumptionDataForMonth.length > 0) {
                      console.log("consumptionDataForMonth--------->", consumptionDataForMonth)

                      var c = consumptionDataForMonth[0];
                      reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                      actualConsumption = c.amount;
                      daysOfStockOut = c.daysOfStockOut;
                      qty = (Number(actualConsumption) / Number(reportingRate) / Number(1 - (Number(daysOfStockOut) / Number(noOfDays)))) * 100;
                      qty = qty.toFixed(2)
                      var multiplier = 0;
                      if (planningUnitList[cul].consumptionDataType == 1) {
                        multiplier = 1
                      } else if (planningUnitList[cul].consumptionDataType == 2) {
                        multiplier = planningUnitList[cul].planningUnit.multiplier
                      } else {
                        multiplier = planningUnitList[cul].otherUnit.multiplier
                      }
                      if (planningUnitList[cul].consumptionDataType == 1) {
                        qtyInPU = (Number(qty) / Number(planningUnitList[cul].planningUnit.multiplier)).toFixed(2)
                      } else if (planningUnitList[cul].consumptionDataType == 2) {
                        qtyInPU = (Number(qty));
                      } else if (planningUnitList[cul].consumptionDataType == 3) {
                        qtyInPU = Number((Number(qty) * Number(planningUnitList[cul].otherUnit.multiplier)) / Number(planningUnitList[cul].planningUnit.multiplier)).toFixed(2)
                      }
                    } else {
                      qty = "";
                      reportingRate = 100;
                      daysOfStockOut = 0;
                      qtyInPU = ""
                    }
                    planningUnitTotalListRegion.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: qty != "" ? Math.round(qty) : "", qtyInPU: qtyInPU != "" ? Math.round(qtyInPU) : "", reportingRate: reportingRate, region: regionList[r], multiplier: multiplier, actualConsumption: actualConsumption, daysOfStockOut: daysOfStockOut, noOfDays: noOfDays })
                    console.log("planningUnitTotalListRegion-->", planningUnitTotalListRegion);
                    if (qty !== "") {
                      totalQty = Number(totalQty) + Number(qty);
                      totalQtyPU = Number(totalQtyPU) + Number(qtyInPU);
                    }
                  }
                  console.log("&&totalQty--->", totalQty)
                  planningUnitTotalList.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: totalQty !== "" ? Math.round(totalQty) : "", qtyInPU: totalQtyPU != "" ? Math.round(totalQtyPU) : "" })
                  console.log("&&planningUnitTotalList------>", planningUnitTotalList)
                  totalPlanningUnit += totalQty;
                  totalPlanningUnitPU += totalQtyPU;
                }
              }
              var healthAreaList = [...new Set(datasetJson.healthAreaList.map(ele => (ele.id)))];
              var tracerCategoryListFilter = myResult.filter(c => healthAreaList.includes(c.healthArea.id));
              var tracerCategoryIds = [...new Set(tracerCategoryListFilter.map(ele => (ele.tracerCategoryId)))];
              var forecastingUnitList = fuResult.filter(c => tracerCategoryIds.includes(c.tracerCategory.id));
              var forecastingUnitIds = [...new Set(forecastingUnitList.map(ele => (ele.forecastingUnitId)))];
              var allPlanningUnitList = puResult.filter(c => forecastingUnitIds.includes(c.forecastingUnit.forecastingUnitId));

              this.setState({
                consumptionList: consumptionList,
                tempConsumptionList: consumptionList,
                regionList: regionList,
                startDate: startDate,
                stopDate: stopDate,
                // consumptionUnitList: consumptionUnitList,
                monthArray: monthArray,
                datasetJson: datasetJson,
                planningUnitList: planningUnitList,
                forecastingUnitList: forecastingUnitList,
                showSmallTable: true,
                loading: false,
                planningUnitTotalList: planningUnitTotalList,
                planningUnitTotalListRegion: planningUnitTotalListRegion,
                allPlanningUnitList: allPlanningUnitList
              }, () => {
                console.log("this.props.match.params.planningUnitId+++", this.props.match.params.planningUnitId)
                if (this.props.match.params.planningUnitId > 0) {
                  this.buildDataJexcel(this.props.match.params.planningUnitId, 0)
                }
                if (localStorage.getItem("sesDatasetPlanningUnitId") != "" && planningUnitList.filter(c => c.planningUnit.id == localStorage.getItem("sesDatasetPlanningUnitId")).length > 0) {
                  this.buildDataJexcel(localStorage.getItem("sesDatasetPlanningUnitId"), 0)
                }
              })
            }.bind(this)
          }.bind(this)
        }.bind(this)
      }.bind(this)
    }.bind(this)
  }

  // getARUList(e) {
  //   var planningUnitId = e.target.value;
  //   if (planningUnitId > 0) {
  //     var planningUnitListFiltered = this.state.allPlanningUnitList.filter(c => c.planningUnitId == planningUnitId)[0];
  //     var elInstance = this.state.smallTableEl;
  //     elInstance.setValueFromCoords(2, 1, getLabelText(planningUnitListFiltered.label, this.state.lang), true);
  //     elInstance.setValueFromCoords(3, 1, 1, true);
  //     elInstance.setValueFromCoords(4, 1, planningUnitListFiltered.planningUnitId, true);
  //     elInstance.setValueFromCoords(2, 0, getLabelText(planningUnitListFiltered.forecastingUnit.label, this.state.lang), true);
  //     elInstance.setValueFromCoords(3, 0, planningUnitListFiltered.multiplier, true);
  //     elInstance.setValueFromCoords(4, 0, planningUnitListFiltered.forecastingUnit.forecastingUnitId, true);

  //   }
  //   this.setState({
  //     selectedPlanningUnitId: planningUnitId,
  //     consumptionChanged: true
  //   })
  // }

  toggleShowGuidance() {
    this.setState({
      showGuidance: !this.state.showGuidance
    })
  }

  setShowInPlanningUnits(e) {
    this.setState({
      showInPlanningUnit: e.target.checked
    })
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.onbeforeunload = null;
  }

  componentDidUpdate = () => {
    if (this.state.consumptionChanged) {
      window.onbeforeunload = () => true
    } else {
      window.onbeforeunload = undefined
    }
  }


  exportPDFDataCheck() {
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

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), doc.internal.pageSize.width - 40, 20, {
          align: 'right'
        })
        doc.text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width - 40, 30, {
          align: 'right'
        })
        doc.text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width - 40, 40, {
          align: 'right'
        })
        doc.text(document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1]), doc.internal.pageSize.width - 40, 50, {
          align: 'right'
        })
        doc.text(getLabelText(this.state.datasetJson.label, this.state.lang), doc.internal.pageSize.width - 40, 60, {
          align: 'right'
        })
        doc.setFontSize(TITLE_FONT)

        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.common.dataCheck'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(i18n.t('static.dashboard.programheader') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text, doc.internal.pageSize.width / 20, 90, {
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
    doc.setFont('helvetica', 'normal')


    var y = 110;

    doc.setFont('helvetica', 'bold')
    var planningText = doc.splitTextToSize(i18n.t('static.commitTree.consumptionForecast'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("a. " + i18n.t('static.commitTree.monthsMissingActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    this.state.missingMonthList.map((item, i) => {
      doc.setFont('helvetica', 'bold')
      planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
      doc.setFont('helvetica', 'normal')
      planningText = doc.splitTextToSize("" + item.monthsArray, doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 3;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
    })

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("b. " + i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    this.state.consumptionListlessTwelve.map((item, i) => {
      doc.setFont('helvetica', 'bold')
      planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
      doc.setFont('helvetica', 'normal')
      planningText = doc.splitTextToSize("" + item.noOfMonths + " month(s)", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 3;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
    })
    addHeaders(doc)
    addFooters(doc)
    doc.save(document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.dataEntryAndAdjustment') + "-" + i18n.t('static.common.dataCheck') + '.pdf');
  }

  render() {
    const { datasetList } = this.state;
    let datasets = datasetList.length > 0
      && datasetList.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.name}
          </option>
        )
      }, this);

    const { allPlanningUnitList } = this.state;
    let planningUnits = allPlanningUnitList.length > 0
      && allPlanningUnitList.map((item, i) => {
        return (
          <option key={i} value={item.planningUnitId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);

    var chartOptions = {
      title: {
        display: false
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: getLabelText(this.state.tempConsumptionUnitObject.consumptionDataType == "" ? "" : this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? this.state.tempConsumptionUnitObject.planningUnit.forecastingUnit.label : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.label : this.state.tempConsumptionUnitObject.otherUnit.label, this.state.lang),
            fontColor: 'black'
          },
          stacked: true,
          ticks: {
            beginAtZero: true,
            fontColor: 'black',
            callback: function (value) {
              return value.toLocaleString();
            }
          },
          gridLines: {
            drawBorder: true, lineWidth: 0
          },
          position: 'left',
        }],
        xAxes: [{
          ticks: {
            fontColor: 'black'
          },
          gridLines: {
            drawBorder: true, lineWidth: 0
          },
          // stacked: true
        }]
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

    let bar = {}
    var datasetListForGraph = [];
    var colourArray = ["#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521"]
    if (this.state.showDetailTable) {
      var elInstance = this.state.dataEl;
      if (elInstance != undefined) {
        var colourCount = 0;
        datasetListForGraph.push({
          label: getLabelText(this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? this.state.tempConsumptionUnitObject.planningUnit.forecastingUnit.label : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.label : this.state.tempConsumptionUnitObject.otherUnit.label, this.state.lang),
          data: this.state.planningUnitTotalList.filter(c => c.planningUnitId == this.state.selectedConsumptionUnitObject.planningUnit.id).map(item => (item.qty > 0 ? item.qty : null)),
          type: 'line',
          // stack: 1,
          backgroundColor: 'transparent',
          // backgroundColor: "#002F6C",
          borderStyle: 'dotted',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          // lineTension: 0,
          pointStyle: 'line',
          pointBorderWidth: 5,
          borderColor: '#000',
          // pointRadius: 0,
          showInLegend: true,
        })

        var actualConsumptionCount = 6;
        this.state.regionList.map((item, count) => {
          if (colourCount > 7) {
            colourCount = 0;
          }

          // var columnData = elInstance.getRowData(actualConsumptionCount, true);
          // columnData.shift()
          datasetListForGraph.push({
            label: getLabelText(item.label, this.state.lang),
            data: this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == this.state.selectedConsumptionUnitObject.planningUnit.id && c.region.regionId == item.regionId).map(item => (item.qty > 0 ? item.qty : null)),
            // type: 'line'
            stack: 1,
            // backgroundColor: 'transparent',
            backgroundColor: colourArray[colourCount],
            borderStyle: 'dotted',
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            },
            // lineTension: 0,
            // pointStyle: 'line',
            // pointRadius: 0,
            showInLegend: true,
          })
          colourCount++;
        })
      }
    }
    if (this.state.showDetailTable) {
      bar = {

        labels: this.state.monthArray.map((item, index) => (moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))),
        datasets: datasetListForGraph

      };

    }

    const { missingMonthList } = this.state;
    let missingMonths = missingMonthList.length > 0 && missingMonthList.map((item, i) => {
      return (
        <li key={i}>
          <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " :"}</b>{"" + item.monthsArray}</span></div>
        </li>
      )
    }, this);

    //Consumption : planning unit less 12 month
    const { consumptionListlessTwelve } = this.state;
    let consumption = consumptionListlessTwelve.length > 0 && consumptionListlessTwelve.map((item, i) => {
      return (
        <li key={i}>
          <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b></span><span>{item.noOfMonths + " month(s)"}</span></div>
        </li>
      )
    }, this);
    console.log("PlanningUnitList@@@@@@@@@@@@@@", this.state.planningUnitList);
    return (
      <div className="animated fadeIn">
        <Prompt
          // when={this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1}
          when={this.state.consumptionChanged == 1}
          message={i18n.t("static.dataentry.confirmmsg")}
        />
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={this.state.messageColor} id="div1">{this.state.message}</h5>
        <h5 className={this.props.match.params.color} id="div2">{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <Card>
          <div className="card-header-actions">
            <div className="Card-header-reporticon">
              <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
              <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
              <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/importFromQATSupplyPlan/listImportFromQATSupplyPlan" className="supplyplanformulas">{i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan')}</a></span>
              <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/extrapolation/extrapolateData" className="supplyplanformulas">{i18n.t('static.dashboard.extrapolation')}</a></span><br />
              {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}

              {/* <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
              {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
            </div>
          </div>
          <div className="Card-header-addicon pb-0">
            <div className="card-header-actions">
              {/* <img style={{ height: '23px', width: '23px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
              </a>
              <img style={{ height: '23px', width: '23px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
              {/* <span className="card-header-action">
                {this.state.datasetId != "" && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} ><i className="fa fa-plus-square" style={{ fontSize: '20px' }} onClick={() => this.buildDataJexcel(0)}></i></a>}</span> */}

              {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
            </div>
          </div>

          <CardBody className="pb-lg-0 pt-lg-0">
            <div>
              <Form >
                <div className="pl-0">
                  <div className="row">
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.programheader')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="datasetId"
                            id="datasetId"
                            bsSize="sm"
                            // onChange={this.filterVersion}
                            onChange={(e) => { this.setDatasetId(e); }}
                            value={this.state.datasetId}

                          >
                            <option value="">{i18n.t('static.common.select')}</option>
                            {datasets}
                          </Input>

                        </InputGroup>
                      </div>
                    </FormGroup>

                  </div>
                  <div className="row">
                    <FormGroup className="tab-ml-0 mb-md-3 ml-3">
                      <Col md="12" >
                        <Input className="form-check-input" type="checkbox" id="checkbox1" name="checkbox1" value={this.state.showInPlanningUnit} onChange={(e) => this.setShowInPlanningUnits(e)} />
                        <Label check className="form-check-label" htmlFor="checkbox1">{i18n.t('static.dataentry.showInPlanningUnits')}</Label>
                      </Col>
                    </FormGroup>
                  </div>
                </div>
              </Form>
              <div style={{ display: this.state.loading ? "none" : "block" }}>
                {this.state.showSmallTable &&
                  <div className="row">
                    <div className="col-md-12">
                      <div className="table-scroll">
                        <div className="table-wrap DataEntryTable table-responsive">
                          <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                            <thead>
                              <tr>
                                <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                <th className="dataentryTdWidth sticky-col first-col clone">{i18n.t('static.dashboard.Productmenu')}</th>
                                {this.state.monthArray.map((item, count) => {
                                  return (<th>{moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>)
                                })}
                                <th>{i18n.t('static.supplyPlan.total')}</th>
                                <th>{i18n.t('static.dataentry.regionalPer')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.planningUnitList.map(item => {
                                var total = 0;
                                var totalPU = 0;
                                return (<>
                                  <tr className="hoverTd">
                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(item.planningUnit.id)}>
                                      {this.state.consumptionUnitShowArr.includes(item.planningUnit.id) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                    </td>
                                    <td className="sticky-col first-col clone hoverTd" align="left" onClick={() => { this.buildDataJexcel(item.planningUnit.id, 0) }}>
                                      {
                                        this.state.showInPlanningUnit ? getLabelText(item.planningUnit.label, this.state.lang) : item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang)
                                        // item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang)
                                      }</td>
                                    {this.state.monthArray.map((item1, count) => {
                                      var data = this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                      total += Number(data[0].qty);
                                      totalPU += Number(data[0].qtyInPU);
                                      return (<td onClick={() => { this.buildDataJexcel(item.planningUnit.id, 0) }}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty} /></td>)
                                    })}
                                    <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? Math.round(totalPU) : Math.round(total)} /></td>
                                    <td>100</td>
                                  </tr>
                                  {this.state.regionList.map(r => {
                                    var totalRegion = 0;
                                    var totalRegionPU = 0;
                                    return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(item.planningUnit.id) ? "" : "none" }}>
                                      <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                      <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{"   " + getLabelText(r.label, this.state.lang)}</td>
                                      {this.state.monthArray.map((item1, count) => {
                                        var data = this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.region.regionId == r.regionId)
                                        totalRegion += Number(data[0].qty);
                                        totalRegionPU += Number(data[0].qtyInPU);
                                        return (<td onClick={() => { this.buildDataJexcel(item.planningUnit.id, 0) }}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty} /></td>)
                                      })}
                                      <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? Math.round(totalRegionPU) : Math.round(totalRegion)} /></td>
                                      <td>{this.state.showInPlanningUnit ? Math.round((totalRegionPU / totalPU) * 100) : Math.round((totalRegion / total) * 100)}</td>
                                    </tr>)
                                  })}
                                </>)
                              }
                              )}

                            </tbody>
                          </Table>
                        </div>
                      </div>
                      <br></br>
                      <br></br>
                      <div className="row">
                        {this.state.showDetailTable &&
                          <>
                            <FormGroup className="col-md-4">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.planningunitheader')}</Label>
                              <div className="controls ">
                                <InputGroup>
                                  <Input
                                    type="textarea"
                                    name="planningUnitId"
                                    id="planningUnitId"
                                    bsSize="sm"
                                    disabled={this.state.selectedConsumptionUnitId > 0 ? true : false}
                                    // onChange={this.filterVersion}
                                    // onChange={(e) => { this.getARUList(e); }}
                                    value={getLabelText(this.state.selectedConsumptionUnitObject.planningUnit.label, this.state.lang)}
                                  >
                                  </Input>
                                </InputGroup>
                              </div>
                              <Label htmlFor="appendedInputButton">{i18n.t('static.common.dataEnteredIn')} {this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? (this.state.tempConsumptionUnitObject.planningUnit.forecastingUnit.label.label_en) : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.label.label_en : this.state.tempConsumptionUnitObject.otherUnit.label.label_en}, {i18n.t('static.dataentry.multiplierToFU')} = {Number(this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? 1 : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.multiplier : this.state.tempConsumptionUnitObject.otherUnit.multiplier)}
                                <a className="card-header-action">
                                  <span style={{ cursor: 'pointer' }} className="hoverDiv" onClick={() => { this.changeUnit(this.state.selectedConsumptionUnitId) }}>({i18n.t('static.dataentry.change')})</span>
                                </a>
                              </Label>

                            </FormGroup></>}
                        <FormGroup className="col-md-4" style={{ display: this.state.showDetailTable ? 'block' : 'none' }}>
                          <Label htmlFor="appendedInputButton">{i18n.t('static.dataentry.consumptionNotes')}</Label>
                          <div className="controls ">
                            <InputGroup>
                              <Input
                                type="textarea"
                                name="consumptionNotes"
                                id="consumptionNotes"
                                bsSize="sm"
                                onChange={(e) => this.setState({ consumptionChanged: true })}
                              >
                              </Input>
                            </InputGroup>
                          </div>
                        </FormGroup>
                        <FormGroup className="col-md-4" style={{ paddingTop: '30px', display: this.state.showDetailTable ? 'block' : 'none' }}>
                          <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.interpolationMissingActualConsumption()}>
                            <i className="fa fa-check"></i>{i18n.t('static.pipeline.interpolateMissingValues')}</Button>
                        </FormGroup>
                      </div>
                      {/* <div className="table-scroll">
                          <div className="table-wrap table-responsive">
                            <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                              <tbody>
                                {this.state.consumptionUnitList.map(c => {
                                  return (<tr>
                                    <td>{this.state.selectedConsumptionUnitId != 0 ? <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false} readOnly ></input> : <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false}></input>}</td>
                                    <td>{c.dataType == 1 ? "Forecasting Unit" : c.dataType == 2 ? "Planning Unit" : "Other"}</td>
                                    <td>{c.dataType == 1 ? getLabelText(c.forecastingUnit.label, this.state.lang) : c.dataType == 2 ? getLabelText(c.planningUnit.label, this.state.lang) : getLabelText(c.otherUnit.label, this.state.label)}</td>
                                    <td>{c.dataType == 1 ? c.forecastingUnit.multiplier : c.dataType == 2 ? c.planningUnit.multiplier : c.otherUnit.multiplier}</td>
                                  </tr>)
                                })}
                                {this.state.selectedConsumptionUnitId==0 && 
                                <tr></tr>
                              }
                              </tbody>
                              
                            </Table>
                          </div></div> */}
                      {/* </> */}

                      {/* <div className="row">
                        <div className="col-md-12 pl-2 pr-2">
                          <div id="smallTableDiv" className="dataentryTable">
                          </div>
                        </div>
                      </div> */}
                      {/* <br></br> */}
                      {/* <br></br> */}
                      <div className="row">
                        <div className="col-md-12 pl-2 pr-2 datdEntryRow">
                          <div id="tableDiv" className="leftAlignTable">
                          </div>
                        </div>
                      </div>
                      <br></br>
                      <br></br>
                      {this.state.showDetailTable &&
                        <div className="col-md-12">
                          <div className="chart-wrapper">
                            <Bar id="cool-canvas" data={bar} options={chartOptions} />
                            <div>

                            </div>
                          </div>
                          <b>{i18n.t('static.dataentry.graphNotes')}</b>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
              <div style={{ display: this.state.loading ? "block" : "none" }}>
                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                  <div class="align-items-center">
                    <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                    <div class="spinner-border blue ml-4" role="status">

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <FormGroup>
              <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
              <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
              {this.state.consumptionChanged && <><Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.saveConsumptionList()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>&nbsp;</>}
              {this.state.showSmallTable && <> <Button type="button" id="dataCheck" size="md" color="info" className="float-right mr-1" onClick={() => this.openDataCheckModel()}><i className="fa fa-check"></i>{i18n.t('static.common.dataCheck')}</Button></>}
              &nbsp;
            </FormGroup>
          </CardFooter>
        </Card>
        <Modal isOpen={this.state.showGuidance}
          className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
            <strong className="TextWhite">Show Guidance</strong>
          </ModalHeader>
          <div>
            <ModalBody>
              <p>Methods are organized from simple to robust

                More sophisticated models are more sensitive to problems in the data

                If you have poorer data (missing data points, variable reporting rates, less than 12 months of data), use simpler forecast methods
              </p>
            </ModalBody>
          </div>
        </Modal>
        <Modal isOpen={this.state.toggleDataCheck}
          className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={() => this.openDataCheckModel()} className="ModalHead modal-info-Headher">
            <div>
              <img className=" pull-right iconClass cursor ml-lg-2" style={{ height: '22px', width: '22px', cursor: 'pointer', marginTop: '-4px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDFDataCheck()} />
              <strong>{i18n.t('static.common.dataCheck')}</strong>
            </div>
          </ModalHeader>
          <div>
            <ModalBody>
              <span><b>{i18n.t('static.commitTree.consumptionForecast')} : </b>(<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank">{i18n.t('static.commitTree.dataEntry&Adjustment')}</a>, <a href="/#/extrapolation/extrapolateData" target="_blank">{i18n.t('static.commitTree.extrapolation')}</a>)</span><br />
              <span>a. {i18n.t('static.commitTree.monthsMissingActualConsumptionValues')} :</span><br />
              <ul>{missingMonths}</ul>
              <span>b. {i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues')} :</span><br />
              <ul>{consumption}</ul>
            </ModalBody>
          </div>
        </Modal>
        <Modal isOpen={this.state.toggleDataChangeForSmallTable}
          className={'modal-lg ' + this.props.className} >
          <ModalHeader className="modalHeaderDataEnteredIn hideCross">
            <strong>{i18n.t('static.common.dataEnteredIn')}</strong>
          </ModalHeader>
          <Formik
            // initialValues={initialValues}
            enableReinitialize={true}
            initialValues={{
              otherUnitMultiplier: this.state.selectedPlanningUnitMultiplier,
              otherUnitName: this.state.otherUnitName
            }}
            validate={validate(validationSchema)}
            onSubmit={(values, { setSubmitting, setErrors }) => {
              this.submitChangedUnit(this.state.changedConsumptionTypeId);
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
                handleReset,
                setFieldValue,
                setFieldTouched,
                setFieldError
              }) => (
                <Form onSubmit={handleSubmit} noValidate name='dataEnteredInForm'>
                  {/* <CardBody style={{ display: this.state.loading ? "none" : "block" }}> */}
                  <ModalBody>
                    <FormGroup className="col-md-12">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.dataentry.units')}</Label>
                      {/* <div className="controls "> */}
                      {/* <InputGroup> */}
                      <Input
                        type="select"
                        name="dataEnteredInUnitId"
                        id="dataEnteredInUnitId"
                        bsSize="sm"
                        value={this.state.dataEnteredIn}
                        onChange={(e) => { this.setDataEnteredIn(e); }}
                      >
                        <option value={1}>{this.state.selectedConsumptionUnitObject.planningUnit.forecastingUnit.label.label_en}</option>
                        <option value={2}>{this.state.selectedConsumptionUnitObject.planningUnit.label.label_en}</option>
                        <option value={3}>{i18n.t('static.common.otherUnit')}</option>
                      </Input>
                      {/* </InputGroup> */}
                      {/* </div> */}
                    </FormGroup>
                    <FormGroup className="col-md-6" id="otherUnitNameDiv" style={{ display: this.state.showOtherUnitNameField ? 'block' : 'none' }}>
                      <Label htmlFor="appendedInputButton">{i18n.t('static.common.otherUnitName')}</Label>
                      {/* <div className="controls "> */}
                      {/* <InputGroup> */}
                      <Input
                        type="text"
                        name="otherUnitName"
                        id="otherUnitName"
                        bsSize="sm"
                        valid={!errors.otherUnitName}
                        invalid={touched.otherUnitName && !!errors.otherUnitName}
                        onChange={(e) => { handleChange(e); this.setOtherUnitName(e); }}
                        onBlur={handleBlur}
                        value={this.state.otherUnitName}
                      // onChange={(e) => this.setState({ consumptionChanged: true })}
                      >
                      </Input>
                      <Input
                        type="hidden"
                        name="needOtherUnitValidation"
                        id="needOtherUnitValidation"
                        value={(this.state.dataEnteredIn == 3 ? true : false)}
                      />
                      {/* </InputGroup> */}
                      {/* </div> */}
                      <FormFeedback className="red">{errors.otherUnitName}</FormFeedback>
                    </FormGroup>
                    <FormGroup className="col-md-6">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.multiplierTo')}</Label>
                      {/* <InputGroup> */}
                      <Input
                        className="controls"
                        type="number"
                        name="otherUnitMultiplier"
                        id="otherUnitMultiplier"
                        bsSize="sm"
                        readOnly={this.state.dataEnteredIn != 3}
                        valid={!errors.otherUnitMultiplier}
                        invalid={touched.otherUnitMultiplier && !!errors.otherUnitMultiplier}
                        onBlur={handleBlur}
                        value={this.state.selectedPlanningUnitMultiplier}
                        onChange={(e) => { this.setOtherUnitMultiplier(e); handleChange(e); }}
                        required
                      >
                      </Input>
                      {/* </InputGroup> */}
                      <FormFeedback className="red">{errors.otherUnitMultiplier}</FormFeedback>
                    </FormGroup>
                  </ModalBody>
                  <ModalFooter>
                    <Button type="submit" size="md" onClick={(e) => { this.touchAll(setTouched, errors) }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ toggleDataChangeForSmallTable: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                  </ModalFooter>
                  {/* </CardBody> */}
                </Form>
              )
            }
          />
          {/* </div> */}
        </Modal>
      </div >
    );
  }

  openDataCheckModel() {
    this.setState({
      toggleDataCheck: !this.state.toggleDataCheck
    }, () => {
      if (this.state.toggleDataCheck) {
        this.calculateData();
      }
    })
  }

  setOtherUnitMultiplier(e) {
    var otherUnitMultiplier = e.target.value;
    var testNumber = otherUnitMultiplier != "" ? !(JEXCEL_DECIMAL_CATELOG_PRICE).test(otherUnitMultiplier) : false;
    if (testNumber == false) {
      this.setState({
        selectedPlanningUnitMultiplier: otherUnitMultiplier,
      })
    }
  }

  setOtherUnitName(e) {
    this.setState({
      otherUnitName: e.target.value,
    })
  }

  calculateData() {
    this.setState({ loading: true })
    var datasetJson = this.state.datasetJson;
    var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
    var stopDate = moment(Date.now()).format("YYYY-MM-DD");

    var consumptionList = datasetJson.actualConsumptionList;
    var datasetPlanningUnit = datasetJson.planningUnitList.filter(c => c.consuptionForecast);
    var datasetRegionList = datasetJson.regionList;
    var missingMonthList = [];

    //Consumption : planning unit less 24 month
    var consumptionListlessTwelve = [];
    for (var dpu = 0; dpu < datasetPlanningUnit.length; dpu++) {
      for (var drl = 0; drl < datasetRegionList.length; drl++) {
        var curDate = startDate;
        var monthsArray = [];
        var puId = datasetPlanningUnit[dpu].planningUnit.id;
        var regionId = datasetRegionList[drl].regionId;
        var consumptionListFiltered = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
        if (consumptionListFiltered.length < 24) {
          consumptionListlessTwelve.push({
            planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
            planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
            regionId: datasetRegionList[drl].regionId,
            regionLabel: datasetRegionList[drl].label,
            noOfMonths: consumptionListFiltered.length
          })
        }

        //Consumption : missing months
        var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
        let actualMin = moment.min(consumptionListFilteredForMonth.map(d => moment(d.month)));
        curDate = moment(actualMin).format("YYYY-MM");
        for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
          // var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
          // let actualMin = moment.min(consumptionListFilteredForMonth.map(d => moment(d.month)));
          curDate = moment(actualMin).add(i, 'months').format("YYYY-MM-DD");
          var consumptionListForCurrentMonth = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM"));
          var checkIfPrevMonthConsumptionAva = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") < moment(curDate).format("YYYY-MM"));
          var checkIfNextMonthConsumptionAva = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") > moment(curDate).format("YYYY-MM"));
          if (consumptionListForCurrentMonth.length == 0 && checkIfPrevMonthConsumptionAva.length > 0 && checkIfNextMonthConsumptionAva.length > 0) {
            monthsArray.push(" " + moment(curDate).format(DATE_FORMAT_CAP_WITHOUT_DATE));
          }
        }

        if (monthsArray.length > 0) {
          missingMonthList.push({
            planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
            planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
            regionId: datasetRegionList[drl].regionId,
            regionLabel: datasetRegionList[drl].label,
            monthsArray: monthsArray
          })
        }
      }
    }
    this.setState({
      missingMonthList: missingMonthList,
      consumptionListlessTwelve: consumptionListlessTwelve,
      loading: false
    })

  }

  submitChangedUnit(consumptionUnitId) {
    var elInstance = this.state.dataEl;
    // var planningUnitId = "";
    // var consumptionDataDesc = "";
    // var changedPlanningUnitMultiplierValue = "";
    // this.state.dataEnteredInUnitList.map(c => {
    //   if (c[1] == consumptionUnitId) {
    //     planningUnitId = c[5]
    //     consumptionDataDesc = c[2]
    //     changedPlanningUnitMultiplierValue = c[3]
    //   }
    // })


    var consumptionUnitTemp = {};
    consumptionUnitTemp = this.state.selectedConsumptionUnitObject;
    // var otherUnitNameText = document.getElementById("otherUnitName").value;
    // var multiplier1 = 1;
    // if (consumptionUnitId == 3) {
    //   this.setState({
    //     selectedPlanningUnitDesc: otherUnitNameText,
    //     changedPlanningUnitMultiplier: document.getElementById('otherUnitMultiplier').value
    //   })
    //   multiplier1 = document.getElementById('otherUnitMultiplier').value
    //   // elInstance.setValueFromCoords(38, 0, document.getElementById('otherUnitMultiplier').value, true);
    // } else {
    //   this.setState({
    //     selectedPlanningUnitDesc: consumptionDataDesc,
    //     changedPlanningUnitMultiplier: changedPlanningUnitMultiplierValue
    //   })
    //   multiplier1 = changedPlanningUnitMultiplierValue
    //   // elInstance.setValueFromCoords(38, 0, changedPlanningUnitMultiplierValue, true);
    // }
    var multiplier = 1;
    if (this.state.dataEnteredIn == 1) {
      multiplier = consumptionUnitTemp.planningUnit.multiplier;
      // changedConsumptionDataDesc = getLabelText(consumptionUnit.planningUnit.forecastingUnit.label, this.state.lang) + ' | ' + consumptionUnit.planningUnit.forecastingUnit.id;
    } else if (this.state.dataEnteredIn == 2) {
      multiplier = 1;
      // changedConsumptionDataDesc = getLabelText(consumptionUnit.planningUnit.label, this.state.lang) + ' | ' + consumptionUnit.planningUnit.id;;
    } else {
      multiplier = 1 / (document.getElementById('otherUnitMultiplier').value / consumptionUnitTemp.planningUnit.multiplier);
      // changedConsumptionDataDesc = getLabelText(consumptionUnit.otherUnit.label, this.state.lang);
    }
    var consumptionUnitForUpdate = {};
    consumptionUnitForUpdate = {
      consumptionDataType: this.state.dataEnteredIn,
      planningUnit: consumptionUnitTemp.planningUnit,
      otherUnit: this.state.dataEnteredIn == 3 ? {
        label: {
          labelId: null,
          label_en: this.state.otherUnitName,
          label_fr: "",
          label_sp: "",
          label_pr: ""
        },
        multiplier: this.state.selectedPlanningUnitMultiplier
      } : null
    }
    // consumptionUnitForUpdate.consumptionDataType = this.state.dataEnteredIn;
    // if (this.state.dataEnteredIn == 3) {
    //   consumptionUnitForUpdate.otherUnit.label.label_en = this.state.otherUnitName;
    //   consumptionUnitForUpdate.otherUnit.multiplier = this.state.selectedPlanningUnitMultiplier;
    // }
    this.setState({
      // selectedPlanningUnitId: consumptionUnit.planningUnit.id,
      tempConsumptionUnitObject: consumptionUnitForUpdate,
      consumptionChanged: true,
      toggleDataChangeForSmallTable: false,
      // otherUnitName: otherUnitNameText,
      // consumptionUnit:consumptionUnit
      // selectedPlanningUnitId: consumptionUnitId,
      // changedConsumptionTypeId: consumptionUnitId,
    }, () => {
      elInstance.setValueFromCoords(38, 0, multiplier, true);
    })
    // this.setState({
    //   toggleDataChangeForSmallTable: false
    // }, () => {
    //     elInstance.setValueFromCoords(38, 0, 1, true);
    //   })
  }

  changeUnit(consumptionUnitId) {
    this.setState({
      toggleDataChangeForSmallTable: !this.state.toggleDataChangeForSmallTable,
    }, () => {
      if (this.state.toggleDataChangeForSmallTable) {
        this.setState({
          dataEnteredIn: this.state.tempConsumptionUnitObject.consumptionDataType,
          showOtherUnitNameField: this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? true : false,
          otherUnitName: this.state.tempConsumptionUnitObject.consumptionDataType == 3 ? this.state.tempConsumptionUnitObject.otherUnit.label.label_en : "",
          selectedPlanningUnitMultiplier: this.state.tempConsumptionUnitObject.consumptionDataType == 1 ? 1 : this.state.tempConsumptionUnitObject.consumptionDataType == 2 ? this.state.tempConsumptionUnitObject.planningUnit.multiplier : this.state.tempConsumptionUnitObject.otherUnit.multiplier
        }, () => {
          // var showHideOtherUnitNameField = false;
          // var consumptionList = this.state.consumptionList;
          // var consumptionUnit = {};
          // consumptionUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == consumptionUnitId)[0];
          // if (consumptionUnitId != 0) {
          //   if (consumptionUnit.consumptionDataType == 1) {
          //     showHideOtherUnitNameField = false;
          //     document.getElementById("otherUnitMultiplier").readOnly = true;
          //   } else if (consumptionUnit.consumptionDataType == 2) {
          //     showHideOtherUnitNameField = false;
          //     document.getElementById("otherUnitMultiplier").readOnly = true;
          //   } else if (consumptionUnit.consumptionDataType == 3) {
          //     showHideOtherUnitNameField = true;
          //     document.getElementById("otherUnitMultiplier").readOnly = false;
          //   }
          // }
          // consumptionList = consumptionList.filter(c => c.planningUnit.id == consumptionUnitId);
          // let dataArray1 = [];
          // let data = [];
          // if (consumptionUnitId != 0) {
          //   data = [];
          //   data[0] = consumptionUnit.consumptionDataType == 1 && !this.state.consumptionChanged ? true : false;
          //   data[1] = 1;
          //   data[2] = getLabelText(consumptionUnit.planningUnit.forecastingUnit.label, this.state.lang);
          //   data[3] = 1;
          //   data[4] = consumptionUnit.planningUnit.forecastingUnit.id;
          //   data[5] = consumptionUnit.planningUnit.id;
          //   dataArray1.push(data);
          //   data = [];
          //   data[0] = consumptionUnit.consumptionDataType == 2 && !this.state.consumptionChanged ? true : false;
          //   data[1] = 2;
          //   data[2] = getLabelText(consumptionUnit.planningUnit.label, this.state.lang);
          //   data[3] = parseInt(consumptionUnit.planningUnit.multiplier);
          //   data[4] = consumptionUnit.planningUnit.id;
          //   data[5] = consumptionUnit.planningUnit.id;

          //   dataArray1.push(data);
          //   data = [];
          //   data[0] = consumptionUnit.consumptionDataType == 3 && !this.state.consumptionChanged ? true : false;
          //   data[1] = 3;
          //   data[2] = consumptionUnit.consumptionDataType == 3 ? getLabelText(consumptionUnit.otherUnit.label, this.state.lang) : `${i18n.t('static.common.otherUnit')}`;
          //   data[3] = consumptionUnit.consumptionDataType == 3 ? parseInt(consumptionUnit.otherUnit.multiplier) : "";
          //   data[4] = consumptionUnit.consumptionDataType == 3 ? consumptionUnit.otherUnit.id : "";
          //   data[5] = consumptionUnit.planningUnit.id;
          //   dataArray1.push(data);
          // }
          // this.setState({
          //   //   dataEl: dataEl, 
          //   loading: false,
          //   dataEnteredInUnitList: dataArray1,
          //   showOtherUnitNameField: showHideOtherUnitNameField,
          //   showDetailTable: true,
          //   otherUnitName: consumptionUnit.consumptionDataType == 3 ? consumptionUnit.otherUnit.label.label_en : "",
          // })
        })
      }
    })
  }

  setDataEnteredIn(e) {
    this.setState({
      dataEnteredIn: e.target.value,
      showOtherUnitNameField: e.target.value == 3 ? true : false,
      selectedPlanningUnitMultiplier: e.target.value == 1 ? 1 : e.target.value == 2 ? this.state.tempConsumptionUnitObject.planningUnit.multiplier : this.state.tempConsumptionUnitObject.otherUnit != null ? this.state.tempConsumptionUnitObject.otherUnit.multiplier : "",
      otherUnitName: e.target.value == 3 && this.state.tempConsumptionUnitObject.otherUnit != null ? this.state.tempConsumptionUnitObject.otherUnit.label.label_en : ""
    })
    //   var multiplier = "";
    //   // var arrayid = "";
    //   var arrayid1 = "";
    //   // var consumptionDataDesc = "";


    //   this.state.dataEnteredInUnitList.map(c => {
    //     if (c[1] == e.target.value) {
    //       multiplier = c[3]
    //       // arrayid = c[5]
    //       arrayid1 = c[1]
    //       // consumptionDataDesc = c[2]
    //     }
    //   })
    //   if (e.target.value == 3) {
    //     document.getElementById('otherUnitNameDiv').style.display = 'block';
    //     document.getElementById("otherUnitMultiplier").readOnly = false;
    //   } else {
    //     document.getElementById('otherUnitNameDiv').style.display = 'none';
    //     document.getElementById("otherUnitMultiplier").readOnly = true;
    //   }
    //   this.setState({
    //     selectedPlanningUnitMultiplier: multiplier,
    //     changedConsumptionTypeId: arrayid1
    //   })
  }

  resetClicked() {
    this.buildDataJexcel(this.state.selectedConsumptionUnitId, 0)
  }
}