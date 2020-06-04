import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jexcel from 'jexcel';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import "../../../node_modules/jexcel/dist/jexcel.css";
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { SECRET_KEY } from '../../Constants.js';
import i18n from '../../i18n';
import moment from "moment";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

const entityname = i18n.t('static.inventory.inventory')
export default class AddInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            programId: '',
            changedFlag: 0,
            countrySKUList: [],
            message: '',
            lang: localStorage.getItem('lang')

        }
        this.options = props.options;
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getCountrySKUList = this.getCountrySKUList.bind(this);
    }
    componentDidMount() {
        const lan = 'en';
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
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
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programJson = {
                            name: getLabelText(JSON.parse(programNameLabel), this.state.lang) + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList[i] = programJson
                    }
                }
                this.setState({
                    programList: proList
                })

            }.bind(this);
        }.bind(this);

    }
    addRow = function () {
        var json = this.el.getJson();
        var data = [];
        data[0] = "";
        data[1] = "";
        data[2] = "";
        data[3] = `=D${json.length}+E${json.length}`;
        data[4] = "0";
        data[5] = "";
        // data[6] = "";
        // data[7] = "";
        data[6] = true;
        data[7] = -1;
        this.el.insertRow(
            data
        );


    };

    getCountrySKUList() {
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId });
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        var countrySKUList = []
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);

            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var countrySKUTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                var countrySKUOs = countrySKUTransaction.objectStore('realmCountryPlanningUnit');
                var countrySKURequest = countrySKUOs.getAll();
                countrySKURequest.onsuccess = function (event) {
                    var countrySKUResult = [];
                    countrySKUResult = countrySKURequest.result;
                    for (var k = 0; k < countrySKUResult.length; k++) {
                        if (countrySKUResult[k].realmCountry.id == programJson.realmCountry.realmCountryId) {
                            var countrySKUJson = {
                                name: getLabelText(countrySKUResult[k].label, this.state.lang),
                                id: countrySKUResult[k].realmCountryPlanningUnitId
                            }
                            countrySKUList[k] = countrySKUJson
                        }
                    }
                    console.log("countryasdas", countrySKUList);
                    this.setState({ countrySKUList: countrySKUList });
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
    formSubmit() {
        if (this.state.changedFlag == 1) {

        } else {
            var programId = document.getElementById('programId').value;
            this.setState({ programId: programId });
            var db1;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            var dataSourceList = []
            var regionList = []
            var countrySKUList = []
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;

                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programRequest = programTransaction.get(programId);

                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);

                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                    var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                    var dataSourceRequest = dataSourceOs.getAll();
                    dataSourceRequest.onsuccess = function (event) {
                        var dataSourceResult = [];
                        dataSourceResult = dataSourceRequest.result;
                        for (var k = 0; k < dataSourceResult.length; k++) {
                            if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                                if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                    var dataSourceJson = {
                                        name: dataSourceResult[k].label.label_en,
                                        id: dataSourceResult[k].dataSourceId
                                    }
                                    dataSourceList[k] = dataSourceJson
                                }
                            }
                        }


                        var regionTransaction = db1.transaction(['region'], 'readwrite');
                        var regionOs = regionTransaction.objectStore('region');
                        var regionRequest = regionOs.getAll();
                        regionRequest.onsuccess = function (event) {
                            var regionResult = [];
                            regionResult = regionRequest.result;
                            for (var k = 0; k < regionResult.length; k++) {
                                if (regionResult[k].realmCountry.realmCountryId == programJson.realmCountry.realmCountryId) {
                                    var regionJson = {
                                        name: regionResult[k].label.label_en,
                                        id: regionResult[k].regionId
                                    }
                                    regionList[k] = regionJson
                                }
                            }
                            var countrySKUId = document.getElementById('countrySKU').value;
                            console.log("countrySKU---", countrySKUId);
                            // var inventoryList = (programJson.inventoryList).filter(i => i.realmCountryPlanningUnit.id == countrySKUId);
                            var inventoryList = (programJson.inventoryList);
                            this.setState({
                                inventoryList: inventoryList
                            });
                            console.log("inventoryList----------------->>", inventoryList);
                            var data = [];
                            var inventoryDataArr = []
                            // if (inventoryList.length == 0) {
                            //     data = [];
                            //     inventoryDataArr[0] = data;
                            // }
                            var count = 0;
                            if (inventoryList.length != 0) {
                                for (var j = 0; j < inventoryList.length; j++) {
                                    if (inventoryList[j].realmCountryPlanningUnit.id == countrySKUId) {
                                        if (count == 0) {
                                            data = [];
                                            data[0] = inventoryList[j].dataSource.id;
                                            data[1] = inventoryList[j].region.id;
                                            data[2] = inventoryList[j].inventoryDate;
                                            data[3] = 0;
                                            data[4] = inventoryList[j].adjustmentQty;
                                            data[5] = inventoryList[j].actualQty;
                                            // data[6] = inventoryList[j].batchNo;
                                            // data[7] = inventoryList[j].expiryDate;
                                            data[6] = inventoryList[j].active;
                                            data[7] = j;
                                            inventoryDataArr[count] = data;
                                            count++;
                                        } else {
                                            data = [];
                                            data[0] = inventoryList[j].dataSource.id;
                                            data[1] = inventoryList[j].region.id;
                                            data[2] = inventoryList[j].inventoryDate;
                                            data[3] = `=D${count}+E${count}`;
                                            data[4] = inventoryList[j].adjustmentQty;
                                            data[5] = inventoryList[j].actualQty;
                                            // data[6] = inventoryList[j].batchNo;
                                            // data[7] = inventoryList[j].expiryDate;
                                            data[6] = inventoryList[j].active;
                                            data[7] = j;
                                            inventoryDataArr[count] = data;
                                            // inventoryDataArr[j] = data;
                                            count++;
                                        }
                                    }
                                }
                            }

                            console.log("inventory Data Array-->", inventoryDataArr);
                            if (inventoryDataArr.length == 0) {
                                data = [];
                                data[6] = true;
                                inventoryDataArr[0] = data;
                            }
                            this.el = jexcel(document.getElementById("inventorytableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = inventoryDataArr;
                            // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                            // json[0] = data;
                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [100, 100, 100, 130, 130, 130, 130],
                                columns: [

                                    {
                                        title: i18n.t('static.inventory.dataSource'),
                                        type: 'dropdown',
                                        source: dataSourceList
                                    },
                                    {
                                        title: i18n.t('static.inventory.region'),
                                        type: 'dropdown',
                                        source: regionList
                                        // readOnly: true
                                    },
                                    {
                                        title: i18n.t('static.inventory.inventoryDate'),
                                        type: 'calendar',
                                        options: { format: 'MM-YYYY' }

                                    },
                                    {
                                        title: i18n.t('static.inventory.expectedStock'),
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: i18n.t('static.inventory.manualAdjustment'),
                                        type: 'text'
                                    },
                                    {
                                        title: i18n.t('static.inventory.actualStock'),
                                        type: 'text'
                                    },
                                    // {
                                    //     title: i18n.t('static.inventory.batchNumber'),
                                    //     type: 'text'
                                    // },
                                    // {
                                    //     title: i18n.t('static.inventory.expireDate'),
                                    //     type: 'calendar'

                                    // },
                                    {
                                        title: i18n.t('static.inventory.active'),
                                        type: 'checkbox'
                                    },
                                    {
                                        title: 'Index',
                                        type: 'hidden'
                                    }

                                ],
                                pagination: 10,
                                search: true,
                                columnSorting: true,
                                tableOverflow: true,
                                wordWrap: true,
                                paginationOptions: [10, 25, 50, 100],
                                position: 'top',
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                onchange: this.changed,
                                oneditionend: this.onedit,
                                copyCompatibility: true

                            };

                            this.el = jexcel(document.getElementById("inventorytableDiv"), options);
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)

        }
    }

    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {
        //     $("#saveButtonDiv").show();
        this.setState({
            changedFlag: 1
        })
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // this.el.setValueFromCoords(4, y, 0, true)
            } else {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        if (x == 5) {
            var reg = /^[0-9\b]+$/;
            if (this.el.getValueFromCoords(5, y) != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    var col = ("F").concat(parseInt(y) + 1);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    var col = ("F").concat(parseInt(y) + 1);
                    var manualAdj = this.el.getValueFromCoords(5, y) - this.el.getValueFromCoords(3, y);
                    this.el.setValueFromCoords(4, y, parseInt(manualAdj), true);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 3) {
            if (this.el.getValueFromCoords(5, y) != "") {
                var col = ("F").concat(parseInt(y) + 1);
                var manualAdj = this.el.getValueFromCoords(5, y) - this.el.getValueFromCoords(3, y);
                this.el.setValueFromCoords(4, y, parseInt(manualAdj), true);
            }
        }

    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        if (x == 4) {
            this.el.setValueFromCoords(5, y, "", true);
        }
    }.bind(this);


    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("A").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(0, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(1, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }


            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);

            if (value == "Invalid date" || value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                // console.log("my val", Date.parse(value));
                // if (isNaN(Date.parse(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, "In valid Date.");
                //     valid = false;
                // } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // }
            }

            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(4, y);
            var reg = /^[0-9\b]+$/;

            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // this.el.setValueFromCoords(4, y, 0, true)
            } else {

                // console.log("VALUE------>",value,"RESULT----------->",value);
                // if(value % 1 === 0){
                //     console.log("INT____",value);
                // }else{
                //     console.log("DEC____",value);
                // }


                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }

            var col = ("F").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(5, y);

            if (value != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    var manualAdj = this.el.getValueFromCoords(5, y) - this.el.getValueFromCoords(3, y);
                    this.el.setValueFromCoords(4, y, parseInt(manualAdj), true);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }


            if (value != "") {
                var col = ("F").concat(parseInt(y) + 1);
                var manualAdj = this.el.getValueFromCoords(5, y) - this.el.getValueFromCoords(3, y);
                this.el.setValueFromCoords(4, y, parseInt(manualAdj), true);
            }




            // var col = ("D").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(3, y);
            // if (value === "") {
            //     this.el.setStyle(col, "background-color", "transparent");
            //     this.el.setStyle(col, "background-color", "yellow");
            //     this.el.setComments(col, "This field is required.");
            //     valid = false;
            // } else {
            //     this.el.setStyle(col, "background-color", "transparent");
            //     this.el.setComments(col, "");
            // }
        }
        return valid;
    }

    saveData = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState(
                {
                    changedFlag: 0
                }
            );

            var tableJson = this.el.getJson();
            console.log("tableJson------------------->", tableJson);
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programId = (document.getElementById("programId").value);
                var programRequest = programTransaction.get(programId);
                programRequest.onsuccess = function (event) {

                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var countrySKU = document.getElementById("countrySKU").value;
                    var inventoryDataList = (programJson.inventoryList).filter(c => c.realmCountryPlanningUnit.id == countrySKU);
                    var inventoryDataListNotFiltered = programJson.inventoryList;
                    var planningUnitId = inventoryDataList[0].planningUnit.id;
                    // var count = 0;
                    for (var i = 0; i < inventoryDataList.length; i++) {

                        // if (inventoryDataList[count] != undefined) {
                        //     if (inventoryDataList[count].inventoryId == inventoryDataListNotFiltered[i].inventoryId) {
                        var map = new Map(Object.entries(tableJson[i]));
                        var expBalance = 0
                        inventoryDataListNotFiltered[parseInt(map.get("7"))].dataSource.id = map.get("0");
                        inventoryDataListNotFiltered[parseInt(map.get("7"))].region.id = map.get("1");
                        inventoryDataListNotFiltered[parseInt(map.get("7"))].inventoryDate = moment(map.get("2")).format("YYYY-MM-DD");

                        if (i == 0) {
                            expBalance = 0;
                        } else {
                            // var previousMap = new Map(Object.entries(tableJson[i - 1]))
                            expBalance = parseInt(inventoryDataListNotFiltered[parseInt(map.get("7")) - 1].expectedBal) + parseInt(inventoryDataListNotFiltered[parseInt(map.get("7")) - 1].adjustmentQty);
                        }
                        inventoryDataListNotFiltered[parseInt(map.get("7"))].expectedBal = expBalance;
                        // console.log("expBaalalance---------->", expBalance);
                        inventoryDataListNotFiltered[parseInt(map.get("7"))].adjustmentQty = parseInt(map.get("4"));
                        inventoryDataListNotFiltered[parseInt(map.get("7"))].actualQty = map.get("5");
                        // inventoryDataListNotFiltered[parseInt(map.get("9"))].batchNo = map.get("6");
                        // if (inventoryDataListNotFiltered[parseInt(map.get("9"))].expiryDate != null && inventoryDataListNotFiltered[parseInt(map.get("9"))].expiryDate != "") {
                        //     inventoryDataListNotFiltered[parseInt(map.get("9"))].expiryDate = moment(map.get("7")).format("YYYY-MM-DD");
                        // } else {
                        //     inventoryDataListNotFiltered[parseInt(map.get("9"))].expiryDate = "";
                        // }
                        inventoryDataListNotFiltered[parseInt(map.get("7"))].active = map.get("6");
                        // if (inventoryDataList.length >= count) {
                        //     count++;
                        // }
                        //     }
                        // }
                    }


                    for (var i = inventoryDataList.length; i < tableJson.length; i++) {
                        var map = new Map(Object.entries(tableJson[i]));
                        var expBalance = 0
                        if (i == 0) {
                            expBalance = 0;
                        } else {
                            // var previousMap = new Map(Object.entries(tableJson[i - 1]))
                            // console.log("previous--->", previousMap);
                            // console.log("val1--->", parseInt(inventoryDataListNotFiltered[parseInt(previousMap.get("9"))].expectedBal));
                            // console.log("val2--->", parseInt(inventoryDataListNotFiltered[parseInt(previousMap.get("9"))].adjustmentQty));
                            // console.log("inventoryDataList----->", inventoryDataList[i - 1]);
                            expBalance = parseInt(inventoryDataList[i - 1].expectedBal) + parseInt(inventoryDataList[i - 1].adjustmentQty);
                            // console.log("expected bal--->", expBalance);
                        }
                        // var expiryDate = "";
                        // if (map.get("7") != null && map.get("7") != "") {
                        //     expiryDate = moment(map.get("7")).format("YYYY-MM-DD")
                        // } else {
                        //     expiryDate = ""
                        // }
                        var json = {
                            inventoryId: 0,
                            dataSource: {
                                id: map.get("0")
                            },
                            region: {
                                id: map.get("1")
                            },
                            inventoryDate: moment(map.get("2")).format("YYYY-MM-DD"),
                            expectedBal: expBalance,
                            adjustmentQty: map.get("4"),
                            actualQty: map.get("5"),
                            // batchNo: map.get("6"),
                            // expiryDate: expiryDate,
                            active: map.get("6"),

                            realmCountryPlanningUnit: {
                                id: countrySKU,
                            },
                            multiplier: inventoryDataList[0].multiplier,
                            planningUnit: {
                                id: planningUnitId
                            },
                            notes: ""
                        }
                        inventoryDataList.push(json);
                        inventoryDataListNotFiltered.push(json);
                    }

                    console.log("inventoryDataListNotFiltered------->", inventoryDataListNotFiltered);



                    let count = 0;
                    for (var i = 0; i < tableJson.length; i++) {

                        count = 0;
                        var map = new Map(Object.entries(tableJson[i]));

                        for (var j = 0; j < tableJson.length; j++) {

                            var map1 = new Map(Object.entries(tableJson[j]));

                            if (moment(map.get("2")).format("YYYY-MM") === moment(map1.get("2")).format("YYYY-MM") && parseInt(map.get("1")) === parseInt(map1.get("1"))) {
                                count++;
                            }
                            if (count > 1) {
                                i = tableJson.length;
                                break;
                            }
                        }
                    }








                    if (count <= 1) {
                        programJson.inventoryList = inventoryDataListNotFiltered;
                        programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                        var putRequest = programTransaction.put(programRequest.result);

                        putRequest.onerror = function (event) {
                            // Handle errors!
                        };
                        putRequest.onsuccess = function (event) {
                            // $("#saveButtonDiv").hide();
                            this.setState({
                                message: 'static.message.inventorysuccess',
                                changedFlag: 0
                            })
                            this.props.history.push(`/inventory/addInventory/` + i18n.t('static.message.addSuccess', { entityname }))
                        }.bind(this)
                    } else {
                        this.setState({
                            message: 'Duplicate Inventory Details Found',
                            changedFlag: 0
                        })
                    }

                }.bind(this)
            }.bind(this)



        } else {
            console.log("some thing get wrong...");
        }

    }.bind(this);


    render() {
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { countrySKUList } = this.state;
        let countrySKUs = countrySKUList.length > 0
            && countrySKUList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        return (

            <div className="animated fadeIn">
                {/* <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} /> */}
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>

                <Card>

                    <CardHeader>
                        <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                    </CardHeader>
                    <CardBody>
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>

                                            <Col md="12 pl-0">
                                                <div className="d-md-flex">
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                                        <div className="controls ">
                                                            <InputGroup>
                                                                <Input type="select"
                                                                    bsSize="sm"
                                                                    // value={this.state.programId}
                                                                    name="programId" id="programId"
                                                                    onChange={this.getCountrySKUList}
                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {programs}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.countrySKU')}</Label>
                                                        <div className="controls ">
                                                            <InputGroup>
                                                                <Input
                                                                    type="select"
                                                                    name="countrySKU"
                                                                    id="countrySKU"
                                                                    bsSize="sm"
                                                                    onChange={this.formSubmit}
                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {countrySKUs}
                                                                </Input>
                                                                {/* <InputGroupAddon addonType="append">
                                                                        <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
                                                                    </InputGroupAddon> */}
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                </div>
                                            </Col>
                                        </Form>
                                    )} />

                        <Col xs="12" sm="12">
                            <div className="table-responsive">
                                <div id="inventorytableDiv" >
                                </div>
                            </div>
                        </Col>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveData()} ><i className="fa fa-check"></i>{i18n.t('static.common.saveData')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.addRow()} ><i className="fa fa-check"></i>{i18n.t('static.common.addData')}</Button>
                            &nbsp;
</FormGroup>
                    </CardFooter>
                </Card>


            </div >
        );
    }

    cancelClicked() {
        this.props.history.push(`/dashboard/` + i18n.t('static.message.cancelled', { entityname }))
    }

}




