import React, { Component } from 'react';
import jexcel from 'jexcel';
import i18n from '../../i18n';
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import DataSourceService from '../../api/DataSourceService.js';
import PlanningUnitService from '../../api/PlanningUnitService'

export default class PipelineProgramInventory extends Component {

    constructor(props) {
        super(props);
        this.saveInventory = this.saveInventory.bind(this);
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
    }


    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(1, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid=false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

        }
        return valid;
    }

    changed = function (instance, cell, x, y, value) {
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

    }

    loaded() {
        var list = this.state.inventoryList;
        var json = this.el.getJson();

        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var col = ("B").concat(parseInt(y) + 1);
            var value = map.get("1");
            if (value != "" && !isNaN(parseInt(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].dataSourceId).concat(" Does not exist."));
            }
        }

    }


    saveInventory() {
        var json = this.el.getJson();
        var list = this.state.inventoryList;
        var inventoryArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var dataSourceId = map.get("1");
            // console.log("dataSourceId   iiiiiiiiiiiiiii->", dataSourceId)
            if (dataSourceId != "" && !isNaN(parseInt(dataSourceId))) {
                // console.log("in iffffffffffffffffffff");
                dataSourceId = map.get("1");
            } else {
                dataSourceId = list[i].dataSourceId;
            }
            var inventoryJson = {
                planningUnitId: map.get("0"),
                dataSourceId: dataSourceId,
                regionId: map.get("2"),
                inventoryDate: map.get("3"),
                manualAdjustment: map.get("4"),
                notes: map.get("5"),
                active: map.get("6")
            }
            inventoryArray.push(inventoryJson);
        }
        return inventoryArray;

    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.getQatTempProgramregion(this.props.pipelineId).then(response => {
            // console.log("inventory region List +++++++++++++++ ----->", response.data);
            var regionList = [];
            for (var i = 0; i < response.data.length; i++) {
                var regionJson = {
                    id: ((response.data)[i]).regionId,
                    name: ((response.data)[i]).label.label_en
                }
                regionList.push(regionJson);
            }

            AuthenticationService.setupAxiosInterceptors();
            DataSourceService.getActiveDataSourceList().then(response => {
                var dataSourceList = [];
                // console.log("inventory data source List ++++++++++++++++++----->", response.data);
                for (var j = 0; j < response.data.length; j++) {
                    var dataSourceJson = {
                        id: ((response.data)[j]).dataSourceId,
                        name: ((response.data)[j]).label.label_en
                    }
                    dataSourceList.push(dataSourceJson);
                }
                AuthenticationService.setupAxiosInterceptors();
                PlanningUnitService.getActivePlanningUnitList()
                    .then(response => {
                        var planningUnitListQat = []
                        for (var k = 0; k < (response.data).length; k++) {
                            var planningUnitJson = {
                                name: response.data[k].label.label_en,
                                id: response.data[k].planningUnitId
                            }
                            planningUnitListQat.push(planningUnitJson);
                        }

                        AuthenticationService.setupAxiosInterceptors();
                        PipelineService.getPipelineProgramInventory(this.props.pipelineId).then(response => {
                            // console.log("inventory List iiiiiiiiiiii----->", response.data);

                            var data = [];
                            var inventoryDataArr = [];
                            var inventoryList = response.data;
                            this.setState({ inventoryList: response.data });
                            for (var j = 0; j < inventoryList.length; j++) {
                                data = [];
                                data[0] = inventoryList[j].planningUnitId;
                                data[1] = inventoryList[j].dataSourceId;
                                data[2] = inventoryList[j].regionId;
                                data[3] = inventoryList[j].inventoryDate;
                                data[4] = inventoryList[j].manualAdjustment;
                                if (inventoryList[j].notes === null || inventoryList[j].notes === ' NULL') {
                                    data[5] = '';
                                } else {
                                    data[5] = inventoryList[j].notes;
                                }
                                data[6] = true;
                                inventoryDataArr.push(data);
                            }

                            this.el = jexcel(document.getElementById("inventorytableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = inventoryDataArr;
                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [190, 130, 100, 120, 100, 90, 100, 130],
                                columns: [

                                    {
                                        title: 'Planning Unit',
                                        type: 'dropdown',
                                        source: planningUnitListQat,
                                        readOnly: true
                                    },
                                    {
                                        title: i18n.t('static.inventory.dataSource'),
                                        type: 'dropdown',
                                        source: dataSourceList
                                    },
                                    {
                                        title: i18n.t('static.inventory.region'),
                                        type: 'dropdown',
                                        source: regionList

                                    },
                                    {
                                        title: i18n.t('static.inventory.inventoryDate'),
                                        type: 'calendar',
                                        options: { format: 'MM-YYYY' }

                                    },

                                    {
                                        title: i18n.t('static.inventory.manualAdjustment'),
                                        type: 'text'
                                    },
                                    {
                                        title: 'Note',
                                        type: 'text'
                                    },
                                    {
                                        title: i18n.t('static.inventory.active'),
                                        type: 'checkbox'
                                    }

                                ],
                                pagination: 10,
                                search: true,
                                columnSorting: true,
                                tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                onchange: this.changed,
                                oneditionend: this.onedit,
                                copyCompatibility: true,
                                // paginationOptions: [10, 25, 50, 100],
                                position: 'top'
                            };

                            this.el = jexcel(document.getElementById("inventorytableDiv"), options);
                            this.loaded();
                        });


                    });
            });
        });
    }

    render() {
        return (
            <>
                <div className="table-responsive" >

                    <div id="inventorytableDiv">
                    </div>
                </div>
            </>
        );
    }
}