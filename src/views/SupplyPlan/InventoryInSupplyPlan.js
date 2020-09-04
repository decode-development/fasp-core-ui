import React from "react";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, INTEGER_NO_REGEX, INVENTORY_DATA_SOURCE_TYPE, NEGATIVE_INTEGER_NO_REGEX, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP } from "../../Constants";
import moment from "moment";
import CryptoJS from 'crypto-js'
import { calculateSupplyPlan } from "./SupplyPlanCalculations";


export default class InventoryInSupplyPlanComponent extends React.Component {

    constructor(props) {
        super(props);
        this.showInventoryData = this.showInventoryData.bind(this);
        this.loadedInventory = this.loadedInventory.bind(this);
        this.inventoryChanged = this.inventoryChanged.bind(this);
        this.filterBatchInfoForExistingDataForInventory = this.filterBatchInfoForExistingDataForInventory.bind(this);
        this.loadedBatchInfoInventory = this.loadedBatchInfoInventory.bind(this);
        this.batchInfoChangedInventory = this.batchInfoChangedInventory.bind(this);
        this.checkValidationInventoryBatchInfo = this.checkValidationInventoryBatchInfo.bind(this);
        this.saveInventoryBatchInfo = this.saveInventoryBatchInfo.bind(this);
        this.checkValidationInventory = this.checkValidationInventory.bind(this);
        this.saveInventory = this.saveInventory.bind(this);
        this.state = {
            inventoryEl: "",
            inventoryBatchInfoTableEl: ""
        }
    }

    componentDidMount() {
    }

    showInventoryData() {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var inventoryListUnFiltered = this.props.items.inventoryListUnFiltered;
        var inventoryList = this.props.items.inventoryList;
        var programJson = this.props.items.programJson;
        var db1;
        var dataSourceList = [];
        var realmCountryPlanningUnitList = [];
        var myVar = "";
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
            var rcpuOs = rcpuTransaction.objectStore('realmCountryPlanningUnit');
            var rcpuRequest = rcpuOs.getAll();
            rcpuRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            }.bind(this);
            rcpuRequest.onsuccess = function (event) {
                var rcpuResult = [];
                rcpuResult = rcpuRequest.result.filter(c => (c.active).toString() == "true");
                for (var k = 0; k < rcpuResult.length; k++) {
                    if (rcpuResult[k].realmCountry.id == programJson.realmCountry.realmCountryId && rcpuResult[k].planningUnit.id == document.getElementById("planningUnitId").value) {
                        var rcpuJson = {
                            name: getLabelText(rcpuResult[k].label, this.props.items.lang),
                            id: rcpuResult[k].realmCountryPlanningUnitId,
                            multiplier: rcpuResult[k].multiplier
                        }
                        realmCountryPlanningUnitList.push(rcpuJson);
                    }
                }
                this.setState({
                    realmCountryPlanningUnitList: realmCountryPlanningUnitList
                })

                var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                var dataSourceRequest = dataSourceOs.getAll();
                dataSourceRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                }.bind(this);
                dataSourceRequest.onsuccess = function (event) {
                    var dataSourceResult = [];
                    dataSourceResult = dataSourceRequest.result;
                    for (var k = 0; k < dataSourceResult.length; k++) {
                        if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0 && (dataSourceResult[k].active).toString() == "true") {
                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId && dataSourceResult[k].dataSourceType.id == INVENTORY_DATA_SOURCE_TYPE) {
                                var dataSourceJson = {
                                    name: getLabelText(dataSourceResult[k].label, this.props.items.lang),
                                    id: dataSourceResult[k].dataSourceId
                                }
                                dataSourceList.push(dataSourceJson);
                            }
                        }
                    }
                    if (this.state.inventoryEl != "" && this.state.inventoryEl != undefined) {
                        this.state.inventoryEl.destroy();
                    }
                    if (this.state.inventoryBatchInfoTableEl != "" && this.state.inventoryBatchInfoTableEl != undefined) {
                        this.state.inventoryBatchInfoTableEl.destroy();
                    }
                    var data = [];
                    var inventoryDataArr = [];
                    var adjustmentType = this.props.items.inventoryType;
                    var adjustmentColumnType = "hidden";
                    if (adjustmentType == 2) {
                        adjustmentColumnType = "numeric"
                    }
                    var actualColumnType = "hidden";
                    if (adjustmentType == 1) {
                        actualColumnType = "numeric";
                    }
                    var inventoryEditable = true;
                    if (this.props.inventoryPage == "supplyPlanCompare") {
                        inventoryEditable = false;
                    }
                    var paginationOption = false;
                    var searchOption = false;
                    var paginationArray = []
                    if (this.props.inventoryPage == "inventoryDataEntry") {
                        paginationOption = 10;
                        searchOption = true;
                        paginationArray = [10, 25, 50];
                    }

                    var readonlyRegionAndMonth = true;
                    if (this.props.inventoryPage == "inventoryDataEntry") {
                        readonlyRegionAndMonth = false;
                    }


                    for (var j = 0; j < inventoryList.length; j++) {
                        data = [];
                        data[0] = inventoryList[j].inventoryDate; //A
                        data[1] = inventoryList[j].region.id; //B                        
                        data[2] = inventoryList[j].dataSource.id; //C
                        data[3] = inventoryList[j].realmCountryPlanningUnit.id; //D
                        data[4] = adjustmentType; //E
                        data[5] = parseInt(inventoryList[j].adjustmentQty); //F
                        data[6] = parseInt(inventoryList[j].actualQty); //G
                        data[7] = inventoryList[j].multiplier; //H
                        data[8] = `=F${parseInt(j) + 1}*H${parseInt(j) + 1}`; //I
                        data[9] = `=G${parseInt(j) + 1}*H${parseInt(j) + 1}`; //J
                        if (inventoryList[j].notes === null || ((inventoryList[j].notes).trim() == "NULL")) {
                            data[10] = "";
                        } else {
                            data[10] = inventoryList[j].notes;
                        }
                        data[11] = inventoryList[j].active;
                        data[12] = inventoryList[j].inventoryDate;
                        data[13] = inventoryList[j].batchInfoList;
                        var index;
                        if (inventoryList[j].inventoryId != 0) {
                            index = inventoryListUnFiltered.findIndex(c => c.inventoryId == inventoryList[j].inventoryId);
                        } else {
                            console.log("inventoryListUnFiltered", inventoryListUnFiltered);
                            console.log("Adjustment Type", adjustmentType);
                            index = inventoryListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region != null && c.region.id != 0 && c.region.id == inventoryList[j].region.id && moment(c.inventoryDate).format("MMM YY") == moment(inventoryList[j].inventoryDate).format("MMM YY") && c.realmCountryPlanningUnit.id == inventoryList[j].realmCountryPlanningUnit.id && (adjustmentType == 1 ? c.actualQty > 0 : c.adjustmentQty > 0));
                        }
                        data[14] = index;
                        inventoryDataArr[j] = data;
                    }
                    if (inventoryList.length == 0) {
                        data = [];
                        if (this.props.inventoryPage != "inventoryDataEntry") {
                            data[0] = moment(this.props.items.inventoryEndDate).endOf('month').format("YYYY-MM-DD"); //A
                            data[1] = this.props.items.inventoryRegion; //B                        
                        } else {
                            data[0] = "";
                            data[1] = "";
                        }
                        data[2] = ""; //C
                        data[3] = ""; //D
                        data[4] = adjustmentType; //E
                        data[5] = ""; //F
                        data[6] = ""; //G
                        data[7] = ""; //H
                        data[8] = `=F${parseInt(0) + 1}*H${parseInt(0) + 1}`; //I
                        data[9] = `=G${parseInt(0) + 1}*H${parseInt(0) + 1}`; //J
                        data[10] = "";
                        data[11] = true;
                        if (this.props.inventoryPage != "inventoryDataEntry") {
                            data[12] = this.props.items.inventoryEndDate;
                        } else {
                            data[12] = "";
                        }
                        data[13] = "";
                        data[14] = -1;
                        inventoryDataArr[0] = data;
                    }
                    var options = {
                        data: inventoryDataArr,
                        columnDrag: true,
                        columns: [
                            { title: i18n.t('static.inventory.inventoryDate'), type: 'calendar', options: { format: 'MM-YYYY' }, width: 80, readOnly: readonlyRegionAndMonth },
                            { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: readonlyRegionAndMonth, source: this.props.items.regionList, width: 100 },
                            { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList, width: 180 },
                            { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: realmCountryPlanningUnitList, width: 180 },
                            { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.inventory.inventory') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: true, width: 100 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: adjustmentColumnType, mask: '[-]#,##', width: 80 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: actualColumnType, mask: '#,##.00', decimal: '.', width: 80 },
                            { title: i18n.t('static.unit.multiplier'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 80, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: adjustmentColumnType, mask: '#,##.00', decimal: '.', width: 80, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: actualColumnType, mask: '#,##.00', decimal: '.', width: 80, readOnly: true },
                            { title: i18n.t('static.program.notes'), type: 'text', width: 200 },
                            { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 100 },
                            { title: i18n.t('static.inventory.inventoryDate'), type: 'hidden', width: 0 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 0 }
                        ],
                        pagination: paginationOption,
                        paginationOptions: paginationArray,
                        search: searchOption,
                        columnSorting: true,
                        tableOverflow: true,
                        wordWrap: true,
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: true,
                        allowManualInsertRow: false,
                        allowExport: false,
                        copyCompatibility: true,
                        text: {
                            // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                            show: '',
                            entries: '',
                        },
                        onload: this.loadedInventory,
                        editable: inventoryEditable,
                        onchange: this.inventoryChanged,
                        updateTable: function (el, cell, x, y, source, value, id) {
                            var elInstance = el.jexcel;
                            var rowData = elInstance.getRowData(y);
                            var batchDetails = rowData[13];
                            var adjustmentType = rowData[4];
                            if (batchDetails.length == 0) {
                                if (adjustmentType == 2) {
                                    var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                } else {
                                    var cell = elInstance.getCell(`G${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                }
                            } else {
                                if (adjustmentType == 2) {
                                    var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                } else {
                                    var cell = elInstance.getCell(`G${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                }
                            }
                        }.bind(this),
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            //Add inventory batch info
                            var rowData = obj.getRowData(y)
                            if (rowData[4] != "" && rowData[0] != "" && rowData[1] != "" && rowData[3] != "") {
                                items.push({
                                    title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                    onclick: function () {
                                        this.props.updateState("loading", true);
                                        if (this.props.inventoryPage == "inventoryDataEntry") {
                                            this.props.toggleLarge();
                                        }
                                        var batchList = [];
                                        var date = moment(rowData[0]).startOf('month').format("YYYY-MM-DD");
                                        console.log("this.props.items.batchInfoList", this.props.items.batchInfoList);
                                        var batchInfoList = this.props.items.batchInfoList.filter(c => (moment(c.expiryDate).format("YYYY-MM-DD") > date && moment(c.createdDate).format("YYYY-MM-DD") <= date));
                                        console.log("Batch info list", batchInfoList);
                                        batchList.push({
                                            name: i18n.t('static.supplyPlan.fefo'),
                                            id: -1
                                        })
                                        var planningUnitId = document.getElementById("planningUnitId").value;
                                        for (var k = 0; k < batchInfoList.length; k++) {
                                            if (batchInfoList[k].planningUnitId == planningUnitId) {
                                                var batchJson = {
                                                    name: batchInfoList[k].batchNo,
                                                    id: batchInfoList[k].batchId.toString()
                                                }
                                                batchList.push(batchJson);
                                            }
                                        }
                                        this.setState({
                                            batchInfoList: batchList
                                        })
                                        document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'block';
                                        if (this.state.inventoryBatchInfoTableEl != "" && this.state.inventoryBatchInfoTableEl != undefined) {
                                            this.state.inventoryBatchInfoTableEl.destroy();
                                        }
                                        var json = [];
                                        var inventoryQty = 0;
                                        var adjustmentType = this.props.items.inventoryType;
                                        var adjustmentColumnType = "hidden";
                                        if (adjustmentType == 2) {
                                            adjustmentColumnType = "numeric"
                                        }
                                        var actualColumnType = "hidden";
                                        if (adjustmentType == 1) {
                                            actualColumnType = "numeric";
                                        }
                                        var batchInfo = rowData[13];
                                        var inventoryQty = 0;
                                        if (adjustmentType == 1) {
                                            inventoryQty = (rowData[6]).toString().replaceAll("\,", "");
                                        } else {
                                            inventoryQty = (rowData[5]).toString().replaceAll("\,", "");
                                        }
                                        var inventoryBatchInfoQty = 0;
                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                            var data = [];
                                            data[0] = batchInfo[sb].batch.batchId; //A
                                            data[1] = moment(batchInfo[sb].batch.expiryDate).format(DATE_FORMAT_CAP);
                                            data[2] = adjustmentType; //B
                                            data[3] = parseInt(batchInfo[sb].adjustmentQty); //C
                                            data[4] = parseInt(batchInfo[sb].actualQty); //D
                                            data[5] = batchInfo[sb].inventoryTransBatchInfoId; //E
                                            data[6] = y; //F
                                            if (adjustmentType == 1) {
                                                inventoryBatchInfoQty += parseInt(batchInfo[sb].actualQty);
                                            } else {
                                                inventoryBatchInfoQty += parseInt(batchInfo[sb].adjustmentQty);
                                            }
                                            json.push(data);
                                        }
                                        if (parseInt(inventoryQty) != inventoryBatchInfoQty && batchInfo.length > 0) {
                                            var qty = parseInt(inventoryQty) - parseInt(inventoryBatchInfoQty);
                                            var data = [];
                                            data[0] = -1; //A
                                            data[1] = "";
                                            data[2] = adjustmentType; //B
                                            if (adjustmentType == 1) {
                                                data[3] = ""; //C
                                                data[4] = qty; //D
                                            } else {
                                                data[3] = qty; //C
                                                data[4] = ""; //D
                                            }
                                            data[5] = 0; //E
                                            data[6] = y; //F
                                            json.push(data);
                                        }
                                        if (batchInfo.length == 0) {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = ""
                                            data[2] = adjustmentType;
                                            data[3] = "";
                                            data[4] = "";
                                            data[5] = 0;
                                            data[6] = y;
                                            json.push(data)
                                        }
                                        var options = {
                                            data: json,
                                            columnDrag: true,
                                            columns: [
                                                { title: i18n.t('static.supplyPlan.batchId'), type: 'dropdown', source: batchList, filter: this.filterBatchInfoForExistingDataForInventory, width: 100 },
                                                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'text', readOnly: true, width: 150 },
                                                { title: i18n.t('static.supplyPlan.adjustmentType'), type: 'hidden', source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: true },
                                                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: adjustmentColumnType, mask: '[-]#,##', width: 80 },
                                                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: actualColumnType, mask: '#,##.00', decimal: '.', width: 80 },
                                                { title: i18n.t('static.supplyPlan.inventoryTransBatchInfoId'), type: 'hidden', width: 0 },
                                                { title: i18n.t('static.supplyPlan.rowNumber'), type: 'hidden', width: 0 }
                                            ],
                                            pagination: false,
                                            search: false,
                                            columnSorting: true,
                                            tableOverflow: true,
                                            wordWrap: true,
                                            allowInsertColumn: false,
                                            allowManualInsertColumn: false,
                                            allowDeleteRow: true,
                                            oneditionend: this.onedit,
                                            copyCompatibility: true,
                                            allowInsertRow: true,
                                            allowManualInsertRow: false,
                                            allowExport: false,
                                            onchange: this.batchInfoChangedInventory,
                                            copyCompatibility: true,
                                            editable: inventoryEditable,
                                            text: {
                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                                show: '',
                                                entries: '',
                                            },
                                            onload: this.loadedBatchInfoInventory,
                                            updateTable: function (el, cell, x, y, source, value, id) {
                                            }.bind(this),
                                            contextMenu: function (obj, x, y, e) {
                                                var items = [];
                                                var items = [];
                                                if (y == null) {
                                                } else {
                                                    var adjustmentType = this.props.items.inventoryType;
                                                    console.log("Adjustment type", adjustmentType)
                                                    if (inventoryEditable) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                            onclick: function () {
                                                                var data = [];
                                                                data[0] = "";
                                                                data[1] = "";
                                                                data[2] = adjustmentType;
                                                                data[3] = "";
                                                                data[4] = "";
                                                                data[5] = 0;
                                                                data[6] = y;
                                                                obj.insertRow(data);
                                                            }
                                                        });
                                                    }

                                                    if (obj.options.allowDeleteRow == true && obj.getJson().length > 1) {
                                                        // region id
                                                        if (obj.getRowData(y)[5] == 0) {
                                                            items.push({
                                                                title: obj.options.text.deleteSelectedRows,
                                                                onclick: function () {
                                                                    obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                                return items;
                                            }.bind(this)

                                        };
                                        var elVar = jexcel(document.getElementById("inventoryBatchInfoTable"), options);
                                        this.el = elVar;
                                        this.setState({ inventoryBatchInfoTableEl: elVar });
                                        this.props.updateState("loading", false);
                                    }.bind(this)
                                });
                            }
                            // -------------------------------------

                            if (y == null) {
                            } else {
                                // Insert new row
                                if (obj.options.allowInsertRow == true) {
                                    var json = obj.getJson();
                                    if (inventoryEditable) {
                                        items.push({
                                            title: i18n.t('static.supplyPlan.addNewAdjustments'),
                                            onclick: function () {
                                                var json = obj.getJson();
                                                var map = new Map(Object.entries(json[0]));
                                                var data = [];
                                                if (this.props.inventoryPage != "inventoryDataEntry") {
                                                    data[0] = moment(this.props.items.inventoryEndDate).format("YYYY-MM-DD"); //A
                                                    data[1] = this.props.items.inventoryRegion; //B        
                                                } else {
                                                    data[0] = "";
                                                    data[1] = "";
                                                }
                                                data[2] = ""; //C
                                                data[3] = ""; //D
                                                data[4] = map.get("4"); //E
                                                data[5] = ""; //F
                                                data[6] = ""; //G
                                                data[7] = ""; //H
                                                data[8] = `=F${parseInt(json.length) + 1}*H${parseInt(json.length) + 1}`; //I
                                                data[9] = `=G${parseInt(0) + 1}*H${parseInt(0) + 1}`; //J
                                                data[10] = "";
                                                data[11] = true;
                                                if (this.props.inventoryPage != "inventoryDataEntry") {
                                                    data[12] = this.props.items.inventoryEndDate;
                                                } else {
                                                    data[12] = "";
                                                }
                                                data[13] = "";
                                                data[14] = -1;
                                                obj.insertRow(data);
                                            }.bind(this)
                                        });
                                    }

                                    if (obj.options.allowDeleteRow == true && obj.getJson().length > 1) {
                                        // region id
                                        if (obj.getRowData(y)[14] == -1) {
                                            items.push({
                                                title: obj.options.text.deleteSelectedRows,
                                                onclick: function () {
                                                    obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                            return items;
                        }.bind(this)
                    }
                    myVar = jexcel(document.getElementById("adjustmentsTable"), options);
                    this.el = myVar;
                    this.setState({
                        inventoryEl: myVar
                    })
                    this.props.updateState("loading", false);
                }.bind(this)
            }.bind(this)
        }.bind(this);
    }

    loadedInventory = function (instance, cell, x, y, value) {
        if (this.props.inventoryPage != "inventoryDataEntry") {
            jExcelLoadedFunctionOnlyHideRow(instance);
        } else {
            jExcelLoadedFunction(instance);
        }
        var asterisk = document.getElementsByClassName("resizable")[0];
        console.log("astrrisk", asterisk);
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        tr.children[8].classList.add('AsteriskTheadtrTd');
        tr.children[9].classList.add('AsteriskTheadtrTd');
        tr.children[10].classList.add('AsteriskTheadtrTd');
    }

    inventoryChanged = function (instance, cell, x, y, value) {
        var elInstance = this.state.inventoryEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("inventoryError", "");
        this.props.updateState("inventoryDuplicateError", "");
        this.props.updateState("inventoryChangedFlag", 1);
        if (x == 0) {
            checkValidtion("date", "A", y, rowData[0], elInstance);
        }
        if (x == 1) {
            checkValidtion("text", "B", y, rowData[1], elInstance);
        }
        if (x == 2) {
            checkValidtion("text", "C", y, rowData[2], elInstance);
        }
        if (x == 3) {
            elInstance.setValueFromCoords(7, y, "", true);
            var valid = checkValidtion("text", "D", y, rowData[3], elInstance);
            if (valid == true) {
                var multiplier = (this.state.realmCountryPlanningUnitList.filter(c => c.id == rowData[3])[0]).multiplier;
                elInstance.setValueFromCoords(7, y, multiplier, true);
            }
        }
        if (x == 5) {
            if (rowData[4] == 2) {
                checkValidtion("number", "F", y, rowData[5], elInstance, NEGATIVE_INTEGER_NO_REGEX, 0, 0);
            }
        }

        if (x == 6) {
            if (rowData[4] == 1) {
                checkValidtion("number", "G", y, rowData[6], elInstance, INTEGER_NO_REGEX, 1, 1);
            }
        }

    }

    filterBatchInfoForExistingDataForInventory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[5];
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }
        return mylist;
    }.bind(this)

    loadedBatchInfoInventory = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[1];
        console.log("astrrisk", asterisk);
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
    }

    batchInfoChangedInventory = function (instance, cell, x, y, value) {
        var elInstance = this.state.inventoryBatchInfoTableEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("inventoryBatchError", "");
        this.props.updateState("inventoryBatchInfoDuplicateError", "");
        this.props.updateState("inventoryBatchInfoNoStockError", "");
        this.props.updateState("inventoryBatchInfoChangedFlag", 1);
        if (x == 0) {
            var valid = checkValidtion("text", "A", y, rowData[0], elInstance);
            if (valid == true) {
                console.log("elInstance.getCell(`A${parseInt(y) + 1}`).innerText", elInstance.getCell(`A${parseInt(y) + 1}`).innerText)
                if (value != -1) {
                    var expiryDate = this.props.items.batchInfoList.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0].expiryDate;
                    elInstance.setValueFromCoords(1, y, moment(expiryDate).format(DATE_FORMAT_CAP), true);
                } else {
                    elInstance.setValueFromCoords(1, y, "", true);
                }
            }
        }
        if (x == 3) {
            if (rowData[2] == 2) {
                checkValidtion("number", "D", y, rowData[3], elInstance, NEGATIVE_INTEGER_NO_REGEX, 0, 0);
            }
        }

        if (x == 4) {
            if (rowData[2] == 1) {
                checkValidtion("number", "E", y, rowData[4], elInstance, INTEGER_NO_REGEX, 1, 0);
            }
        }

    }

    checkValidationInventoryBatchInfo() {
        var valid = true;
        var elInstance = this.state.inventoryBatchInfoTableEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("0") == map.get("0")
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    inValid((colArr[c]), y, i18n.t('static.supplyPlan.duplicateBatchNumber'), elInstance);
                }
                valid = false;
                this.props.updateState("inventoryBatchInfoDuplicateError", i18n.t('static.supplyPlan.duplicateBatchNumber'));
            } else {
                // var programJson = this.props.items.programJsonAfterAdjustmentClicked;
                // var shipmentList = programJson.shipmentList;
                // var shipmentBatchArray = [];
                // for (var ship = 0; ship < shipmentList.length; ship++) {
                //     var batchInfoList = shipmentList[ship].batchInfoList;
                //     for (var bi = 0; bi < batchInfoList.length; bi++) {
                //         shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                //     }
                // }
                // if (map.get("0") != -1) {
                //     var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0];
                //     var totalStockForBatchNumber = 0;
                //     if (stockForBatchNumber.length > 0) {
                //         totalStockForBatchNumber = stockForBatchNumber.qty;
                //     }
                //     var batchDetails = this.props.items.batchInfoList(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0]
                //     var createdDate = moment(batchDetails.createdDate).startOf('month').format("YYYY-MM-DD");
                //     var expiryDate = moment(batchDetails.expiryDate).startOf('month').format("YYYY-MM-DD");
                //     var remainingBatchQty = parseInt(totalStockForBatchNumber);
                //     var calculationStartDate = moment(batchDetails.createdDate).startOf('month').format("YYYY-MM-DD");
                //     // console.log("Batch Number", myArray[ma].batchNo);
                //     console.log("Received Qty", remainingBatchQty);
                //     for (var i = 0; createdDate < expiryDate; i++) {
                //         createdDate = moment(calculationStartDate).add(i, 'month').format("YYYY-MM-DD");
                //         var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                //         var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                //         console.log("STart date", startDate);
                //         var inventoryList = (programJson.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate));
                //         var inventoryBatchArray = [];
                //         for (var inv = 0; inv < inventoryList.length; inv++) {
                //             var rowData = (this.state.inventoryEl).getRowData(parseInt(map.get("6")));
                //             var invIndex = rowData[14];
                //             var index = inventoryList.findIndex(c => c => c.planningUnit.id == document.getElementById("planningUnitId").value && c.region.id == rowData[1] && moment(c.inventoryDate).format("MMM YY") == moment(rowData[0]).format("MMM YY") && c.realmCountryPlanningUnit.id == rowData[3])
                //             if (index != invIndex) {
                //                 var batchInfoList = inventoryList[inv].batchInfoList;
                //                 for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                     inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier, actualQty: batchInfoList[bi].actualQty * inventoryList[inv].multiplier })
                //                 }
                //             }
                //         }
                //         var inventoryForBatchNumber = [];
                //         if (inventoryBatchArray.length > 0) {
                //             inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                //         }
                //         if (inventoryForBatchNumber == undefined) {
                //             inventoryForBatchNumber = [];
                //         }
                //         console.log("InventoryBatchArray", inventoryForBatchNumber);
                //         var adjustmentQty = 0;
                //         for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                //             if (inventoryForBatchNumber[b].actualQty == "" || inventoryForBatchNumber[b].actualQty == 0 || inventoryForBatchNumber[b].actualQty == null) {
                //                 remainingBatchQty += parseInt(inventoryForBatchNumber[b].qty);
                //             } else {
                //                 remainingBatchQty = parseInt(inventoryForBatchNumber[b].actualQty);
                //             }
                //         }
                //         if (this.props.items.inventoryType == 1) {
                //             remainingBatchQty = parseInt(map.get("6").toString().replaceAll("\,", ""));
                //         } else {
                //             remainingBatchQty += parseInt(map.get("5").toString().replaceAll("\,", ""));
                //         }
                //         adjustmentQty += parseInt(map.get("3").toString().replaceAll("\,", ""));
                //         console.log("Remaining batch Qty after adjustment", remainingBatchQty);
                //         var consumptionList = (programJson.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate));
                //         var consumptionBatchArray = [];

                //         for (var con = 0; con < consumptionList.length; con++) {
                //             var batchInfoList = consumptionList[con].batchInfoList;
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                //             }
                //         }
                //         var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                //         if (consumptionForBatchNumber == undefined) {
                //             consumptionForBatchNumber = [];
                //         }
                //         var consumptionQty = 0;
                //         for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                //             consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                //         }
                //         remainingBatchQty -= parseInt(consumptionQty);
                //         console.log("Remaining batch qty after consumption", remainingBatchQty)
                //     }
                //     if (remainingBatchQty < 0) {
                //         inValid("D", y, i18n.t('static.supplyPlan.noStockAvailable'), elInstance);
                //         valid = false;
                //         this.props.updateState("inventoryBatchInfoNoStockError", i18n.t('static.supplyPlan.noStockAvailable'))
                //     }
                // } else {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }
                var rowData = elInstance.getRowData(y);

                var validation = checkValidtion("text", "A", y, rowData[0], elInstance);
                if (validation == false) {
                    valid = false;
                }

                if (rowData[2] == 2) {
                    validation = checkValidtion("number", "D", y, rowData[3], elInstance, NEGATIVE_INTEGER_NO_REGEX, 0, 0);
                    if (validation == false) {
                        valid = false;
                    }
                }

                if (rowData[2] == 1) {
                    validation = checkValidtion("number", "E", y, rowData[4], elInstance, INTEGER_NO_REGEX, 1, 1);
                    if (validation == false) {
                        valid = false;
                    }
                }

            }
        }
        // }
        return valid;
    }

    saveInventoryBatchInfo() {
        this.props.updateState("loading", true);
        var validation = this.checkValidationInventoryBatchInfo();
        if (validation == true) {
            var elInstance = this.state.inventoryBatchInfoTableEl;
            var json = elInstance.getJson();
            var batchInfoArray = [];
            var rowNumber = 0;
            var totalAdjustments = 0;
            var totalActualStock = 0;

            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (i == 0) {
                    rowNumber = map.get("6");
                }
                if (map.get("0") != -1) {
                    var batchInfoJson = {
                        inventoryTransBatchInfoId: map.get("5"),
                        batch: {
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${parseInt(i) + 1}`).innerText,
                            expiryDate: moment(map.get("1")).format("YYYY-MM-DD")
                        },
                        adjustmentQty: map.get("3").toString().replaceAll("\,", ""),
                        actualQty: map.get("4").toString().replaceAll("\,", "")
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalAdjustments += parseInt(map.get("3").toString().replaceAll("\,", ""));
                totalActualStock += parseInt(map.get("4").toString().replaceAll("\,", ""));
            }
            var inventoryInstance = this.state.inventoryEl;
            var rowData = inventoryInstance.getRowData(parseInt(rowNumber));

            if (map.get("2") == 1) {
                inventoryInstance.setValueFromCoords(5, rowNumber, "", true);
                inventoryInstance.setValueFromCoords(6, rowNumber, totalActualStock, true);
            } else {
                inventoryInstance.setValueFromCoords(5, rowNumber, totalAdjustments, true);
                inventoryInstance.setValueFromCoords(6, rowNumber, "", true);
            }
            // rowData[15] = batchInfoArray;
            inventoryInstance.setValueFromCoords(13, rowNumber, batchInfoArray, "");
            this.setState({
                inventoryChangedFlag: 1,
                inventoryBatchInfoChangedFlag: 0,
                inventoryBatchInfoTableEl: ''
            })
            this.props.updateState("inventoryChangedFlag", 1);
            this.props.updateState("inventoryBatchInfoChangedFlag", 0);
            this.props.updateState("inventoryBatchInfoTableEl", "");
            this.setState({
                inventoryBatchInfoTableEl: ""
            })
            document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
            if (this.props.inventoryPage == "inventoryDataEntry") {
                this.props.toggleLarge();
            }
            this.props.updateState("loading", false);
            elInstance.destroy();
        } else {
            this.setState({
                inventoryBatchError: i18n.t('static.supplyPlan.validationFailed')
            })
            this.props.updateState("inventoryBatchError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
        }
    }

    checkValidationInventory() {
        var valid = true;
        var elInstance = this.state.inventoryEl;
        var json = elInstance.getJson();
        var mapArray = [];
        // var adjustmentsQty = 0;
        // var openingBalance = 0;
        // var consumptionQty = 0;
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("3") == map.get("3") &&
                moment(c.get("0")).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.get("1") == map.get("1")
            )
            console.log("Check duplicate in map", checkDuplicateInMap);
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    inValid(colArr[c], y, i18n.t('static.supplyPlan.duplicateAdjustments'), elInstance);
                }
                valid = false;
                this.props.updateState("inventoryDuplicateError", i18n.t('static.supplyPlan.duplicateAdjustments'));
            } else {
                // openingBalance = (this.state.openingBalanceRegionWise.filter(c => c.month.month == map.get("0") && c.region.id == map.get("1"))[0]).balance;
                // consumptionQty = (this.state.consumptionFilteredArray.filter(c => c.month.month == map.get("0") && c.region.id == map.get("1"))[0]).consumptionQty;
                // adjustmentsQty += (map.get("7") * map.get("4"))
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }
                var col = ("C").concat(parseInt(y) + 1);
                var rowData = elInstance.getRowData(y);
                var validation = checkValidtion("date", "A", y, rowData[0], elInstance);
                if (validation == false) {
                    valid = false;
                }

                var validation = checkValidtion("text", "B", y, rowData[1], elInstance);
                if (validation == false) {
                    valid = false;
                }

                var validation = checkValidtion("text", "C", y, rowData[2], elInstance);
                if (validation == false) {
                    valid = false;
                }


                var validation = checkValidtion("text", "D", y, rowData[3], elInstance);
                if (validation == false) {
                    valid = false;
                }

                if (rowData[4] == 2) {
                    var validation = checkValidtion("number", "F", y, rowData[5], elInstance, NEGATIVE_INTEGER_NO_REGEX, 0, 0);
                    if (validation == false) {
                        valid = false;
                    }
                }

                if (rowData[4] == 1) {
                    var validation = checkValidtion("number", "G", y, rowData[6], elInstance, INTEGER_NO_REGEX, 1, 1);
                    if (validation == false) {
                        valid = false;
                    }
                }
            }
        }
        return valid;
    }

    // Save adjustments
    saveInventory() {
        this.props.updateState("inventoryError", "");
        this.props.updateState("loading", true);
        var validation = this.checkValidationInventory();
        console.log("Validation", validation);
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.inventoryEl;
            var planningUnitId = document.getElementById("planningUnitId").value;
            var json = elInstance.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                console.log("in success")
                db1 = e.target.result;
                var transaction;
                var programTransaction;
                if (this.props.inventoryPage == "whatIf") {
                    transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
                    programTransaction = transaction.objectStore('whatIfProgramData');
                } else {
                    transaction = db1.transaction(['programData'], 'readwrite');
                    programTransaction = transaction.objectStore('programData');
                }

                var programId = (document.getElementById("programId").value);

                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var inventoryDataList = (programJson.inventoryList);
                    console.log("Json.length", json.length);
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        console.log("parseInt(map.get(14))", parseInt(map.get("14")));
                        if (parseInt(map.get("14")) != -1) {
                            inventoryDataList[parseInt(map.get("14"))].inventoryDate = moment(map.get("0")).endOf('month').format("YYYY-MM-DD");
                            inventoryDataList[parseInt(map.get("14"))].region.id = map.get("1");
                            inventoryDataList[parseInt(map.get("14"))].dataSource.id = map.get("2");
                            inventoryDataList[parseInt(map.get("14"))].realmCountryPlanningUnit.id = map.get("3");
                            inventoryDataList[parseInt(map.get("14"))].multiplier = map.get("7");
                            inventoryDataList[parseInt(map.get("14"))].adjustmentQty = (map.get("5")).toString().replaceAll("\,", "");
                            inventoryDataList[parseInt(map.get("14"))].actualQty = (map.get("6")).toString().replaceAll("\,", "");
                            inventoryDataList[parseInt(map.get("14"))].notes = map.get("10");
                            inventoryDataList[parseInt(map.get("14"))].active = map.get("11");
                            if (map.get("13") != "") {
                                inventoryDataList[parseInt(map.get("14"))].batchInfoList = map.get("13");
                            } else {
                                inventoryDataList[parseInt(map.get("14"))].batchInfoList = [];
                            }
                        } else {
                            var batchInfoList = [];
                            if (map.get("13") != "") {
                                batchInfoList = map.get("13");
                            }
                            var inventoryJson = {
                                inventoryId: 0,
                                dataSource: {
                                    id: map.get("2")
                                },
                                region: {
                                    id: map.get("1")
                                },
                                inventoryDate: moment(map.get("0")).endOf('month').format("YYYY-MM-DD"),
                                adjustmentQty: map.get("5").toString().replaceAll("\,", ""),
                                actualQty: map.get("6").toString().replaceAll("\,", ""),
                                active: map.get("11"),
                                realmCountryPlanningUnit: {
                                    id: map.get("3"),
                                },
                                multiplier: map.get("7"),
                                planningUnit: {
                                    id: planningUnitId
                                },
                                notes: map.get("10"),
                                batchInfoList: batchInfoList
                            }
                            console.log("inventioryJson", inventoryJson);
                            inventoryDataList.push(inventoryJson);
                        }
                    }
                    programJson.inventoryList = inventoryDataList;
                    this.setState({
                        programJson: programJson
                    })
                    console.log("InventoryData List", inventoryDataList);
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        var programId = (document.getElementById("programId").value)
                        var planningUnitId = (document.getElementById("planningUnitId").value)
                        var objectStore = "";
                        if (this.props.consumptionPage == "whatIf") {
                            objectStore = 'whatIfProgramData';
                        } else {
                            objectStore = 'programData';
                        }
                        calculateSupplyPlan(programId, planningUnitId, objectStore, "inventory", this.props);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.props.updateState("inventoryError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
        }
    }

    render() { return (<div></div>) }
}