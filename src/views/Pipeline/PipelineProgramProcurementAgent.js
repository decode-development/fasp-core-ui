import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProcurementAgentService from '../../api/ProcurementAgentService'
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import { textFilter } from 'react-bootstrap-table2-filter';
import { jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'

export default class PipelineProgramProcurementAgent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            procurementAgentList: [],
            mapProcurementAgentEl: '',
        }
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.saveProcurementAgent = this.saveProcurementAgent.bind(this);
        //this.dropdownFilter = this.dropdownFilter.bind(this);
    }
    
  
  
    loaded() {
        var list = this.state.procurementAgentList;
        var json = this.el.getJson();

        for (var y = 0; y < json.length; y++) {
            var col = ("B").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[1]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].pipelineProcurementAgent).concat(" Does not exist."));
            }
        }

    }

    changed = function (instance, cell, x, y, value) {
      

        //Planning Unit
        if (x == 1) {
            var json = this.el.getJson();
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
               
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                   
            }
            // var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            // instance.jexcel.setValue(columnName, '');
        }
        
       
    }

    checkValidation() {

        var reg = /^[0-9\b]+$/;
        var regDec = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(1, y);

            var currentProcurementAgent = this.el.getRowData(y)[1];

            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                
            }
       }
        return valid;   
    }

    saveProcurementAgent() {
        var list = this.state.ProcurementAgentList;
        var json = this.el.getJson();
        var procurementAgentArray = []
        console.log(json.length)
        console.log(json)
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var procurementAgentId = map.get("1");
            if (procurementAgentId != "" && !isNaN(parseInt(procurementAgentId))) {
                procurementAgentId = map.get("1");
            } else {
                procurementAgentId = list[i].id;
            }

            var procurementAgentJson = {
                // pipelineId: {
                //     id: this.props.pipelineId
                // },
                // active: true,
                
                procurementAgentId: procurementAgentId,
               pipelineProcurementAgentId:map.get("2")
               

            }
            procurementAgentArray.push(procurementAgentJson);
        }
        return procurementAgentArray;

    }


    componentDidMount() {
        var ProcurementAgentListQat = [];
        // var activeDataSourceList=[];
        AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                if (response.status == 200) {
                    // dataSourceListQat = response.data
                    this.setState({ activeDataSourceList: response.data });
                    for (var k = 0; k < (response.data).length; k++) {
                        var dataSourceJson = {
                            name: response.data[k].label.label_en,
                            id: response.data[k].procurementAgentId
                        }
                        ProcurementAgentListQat.push(dataSourceJson);
                    }
                    this.setState({ ProcurementAgentListQat: ProcurementAgentListQat });

   
                        AuthenticationService.setupAxiosInterceptors();
                            PipelineService.getQatTempProcurementAgentList(this.props.pipelineId)
                                .then(response => {
                                    if (response.status == 200) {
                                        if (response.data.length > 0) {

                                            var procurementAgentList = response.data;
                                            var data = [];
                                            var productDataArr = []
                                            //seting this for loaded function
                                            this.setState({ procurementAgentList: procurementAgentList });
                                            //seting this for loaded function
                                            if (procurementAgentList.length != 0) {
                                                for (var j = 0; j < procurementAgentList.length; j++) {
                                                    data = [];

                                                    data[0] = procurementAgentList[j].pipelineProcurementAgent;
                                                    data[1] = procurementAgentList[j].procurementAgentId;
                                                    data[2] = procurementAgentList[j].pipelineProcurementAgentId;
                                                    productDataArr.push(data);

                                                }
                                            } else {
                                                console.log("procurementagent list length is 0.");
                                            }

                                            this.el = jexcel(document.getElementById("mapProcurementAgent"), '');
                                            this.el.destroy();
                                            var json = [];
                                            var data = productDataArr;
                                            // var data = []
                                            var options = {
                                                data: data,
                                                columnDrag: true,
                                                colWidths: [250,250],
                                                columns: [

                                                  {
                                                        title:  i18n.t('static.pipeline.pplnprocurementagent'),
                                                        type: 'text',
                                                        readonly: true
                                                    },
                                                   
                                                    {
                                                        title:  i18n.t('static.procurementagent.procurementagent'),
                                                        type: 'autocomplete',
                                                        source: ProcurementAgentListQat,
                                                        //filter: this.dropdownFilter
                                                    }, {
                                                        title:  i18n.t('static.inventory.procurementAgent'),
                                                        type: 'hidden',
                                                        readonly: true
                                                    }
                                                ],
                                                pagination: 10,
                                                search: true,
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                paginationOptions: [10, 25, 50, 100],
                                                // position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onchange: this.changed,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    text: {
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loadedJexcelCommonFunction,
                                                // onload: this.loaded

                                            };
                                            var elVar = jexcel(document.getElementById("mapProcurementAgent"), options);
                                            this.el = elVar;
                                            this.loaded();

                                        }
                                    } else {
                                        this.setState({ message: response.data.messageCode })
                                    }
                                });

                      
             } })

           


    }

    loadedJexcelCommonFunction = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    render() {
        return (
            <>
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" >

                    <div id="mapProcurementAgent">
                    </div>
                </div>
            </>
        );
    }

}
