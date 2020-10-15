
// import React, { Component } from 'react';
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import i18n from '../../i18n'

// import RealmService from "../../api/RealmService";
// import RealmCountryService from "../../api/RealmCountryService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText';
// const entityname = i18n.t('static.dashboard.realmcountry');
// class ListRealmCountryComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.options = {
//             sortIndicator: true,
//             hideSizePerPage: false,
//             paginationSize: 3,
//             hidePageListOnlyOnePage: true,
//             clearSearch: true,
//             alwaysShowAllBtns: false,
//             withFirstAndLast: false,
//             onRowClick: function (row) {
//                 this.editProcurementAgent(row);
//             }.bind(this)

//         }
//         this.state = {
//             realms: [],
//             realmCountryList: [],
//             message: '',
//             selRealmCountry: [],
//             loading: true
//         }
//         this.editProcurementAgent = this.editProcurementAgent.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.addNewRealmCountry = this.addNewRealmCountry.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.hideFirstComponent = this.hideFirstComponent.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);

//     }
//     hideFirstComponent() {
//         this.timeout = setTimeout(function () {
//         document.getElementById('div1').style.display = 'none';
//         }, 8000);
//         }
//         componentWillUnmount() {
//         clearTimeout(this.timeout);
//         }

//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }
//     addNewRealmCountry() {
//         this.props.history.push("/realmCountry/addRealmCountry");
//     }
//     filterData() {
//         let realmId = document.getElementById("realmId").value;
//         if (realmId != 0) {
//             const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId)
//             this.setState({
//                 selRealmCountry
//             });
//         } else {
//             this.setState({
//                 selRealmCountry: this.state.realmCountryList
//             });
//         }
//     }
//     editProcurementAgent(procurementAgent) {
//         this.props.history.push({
//             pathname: "/procurementAgent/editProcurementAgent",
//             state: { procurementAgent }
//         });
//     }
//     PlanningUnitCountry(event, row) {
//         event.stopPropagation();
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT')) {
//             console.log(JSON.stringify(row))
//             this.props.history.push({
//                 pathname: `/realmCountry/realmCountryPlanningUnit/${row.realmCountryId}`,
//                 state: { realmCountry: row }


//             })
//         }
//     }
//     RealmCountryRegion(event, row) {
//         event.stopPropagation();
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REGION')) {
//             console.log(JSON.stringify(row))
//             this.props.history.push({
//                 pathname: `/realmCountry/realmCountryRegion/${row.realmCountryId}`,
//                 state: { realmCountry: row }


//             })
//         }
//     }
//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.hideFirstComponent();
//         RealmService.getRealmListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realms: response.data, loading: false
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             }).catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );


//         RealmCountryService.getRealmCountryListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realmCountryList: response.data,
//                         selRealmCountry: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             }).catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );

//     }

//     showCountryLabel(cell, row) {
//         return cell.label.label_en;
//     }
//     showCurrencyLabel(cell, row) {
//         return cell.label.label_en;
//     }

//     showPalletUnitLabel(cell, row) {
//         return cell.label.label_en;
//     }

//     showRealmLabel(cell, row) {
//         return cell.label.label_en;
//     }

//     showStatus(cell, row) {
//         if (cell) {
//             return "Active";
//         } else {
//             return "Disabled";
//         }
//     }
//     render() {
//         const { realms } = this.state;
//         let realmList = realms.length > 0
//             && realms.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const columns = [{
//             dataField: 'realm.label',
//             text: i18n.t('static.realm.realm'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'country.label',
//             text: i18n.t('static.dashboard.country'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'defaultCurrency.label',
//             text: i18n.t('static.dashboard.currency'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         },
//         // {
//         //     dataField: 'palletUnit.label',
//         //     text: i18n.t('static.dashboard.unit'),
//         //     sort: true,
//         //     align: 'center',
//         //     headerAlign: 'center',
//         //     formatter: this.formatLabel
//         // },
//         // {
//         //     dataField: 'airFreightPercentage',
//         //     text: i18n.t('static.realmcountry.airFreightPercentage'),
//         //     sort: true,
//         //     align: 'center',
//         //     headerAlign: 'center'
//         // }, {
//         //     dataField: 'seaFreightPercentage',
//         //     text: i18n.t('static.realmcountry.seaFreightPercentage'),
//         //     sort: true,
//         //     align: 'center',
//         //     headerAlign: 'center'
//         // }, {
//         //     dataField: 'shippedToArrivedByAirLeadTime',
//         //     text: i18n.t('static.realmcountry.shippedToArrivedAirLeadTime'),
//         //     sort: true,
//         //     align: 'center',
//         //     headerAlign: 'center'
//         // }, {
//         //     dataField: 'shippedToArrivedBySeaLeadTime',
//         //     text: i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime'),
//         //     sort: true,
//         //     align: 'center',
//         //     headerAlign: 'center'
//         // }, {
//         //     dataField: 'arrivedToDeliveredLeadTime',
//         //     text: i18n.t('static.realmcountry.arrivedToDeliveredLeadTime'),
//         //     sort: true,
//         //     align: 'center',
//         //     headerAlign: 'center'
//         // },
//          {
//             dataField: 'active',
//             text: i18n.t('static.common.status'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (
//                     (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
//                 );
//             }
//         },
//         {
//             dataField: 'realmCountryId',
//             text: i18n.t('static.common.action'),
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (<div className="" align="center">
//                     <Button className="mapUnitbtn" type="button" size="sm" color="success" onClick={(event) => this.PlanningUnitCountry(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.planningunit.planningunitupdate')}</Button>
//                     <Button className="ml-1 mapRegionbtn" type="button" size="sm" color="success" onClick={(event) => this.RealmCountryRegion(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.realmcountry.regionupdate')}</Button>
//                 </div>)
//             }
//         }];
//         const options = {
//             hidePageListOnlyOnePage: true,
//             firstPageText: i18n.t('static.common.first'),
//             prePageText: i18n.t('static.common.back'),
//             nextPageText: i18n.t('static.common.next'),
//             lastPageText: i18n.t('static.common.last'),
//             nextPageTitle: i18n.t('static.common.firstPage'),
//             prePageTitle: i18n.t('static.common.prevPage'),
//             firstPageTitle: i18n.t('static.common.nextPage'),
//             lastPageTitle: i18n.t('static.common.lastPage'),
//             showTotal: true,
//             paginationTotalRenderer: customTotal,
//             disablePageTitle: true,
//             sizePerPageList: [{
//                 text: '10', value: 10
//             }, {
//                 text: '30', value: 30
//             }
//                 ,
//             {
//                 text: '50', value: 50
//             },
//             {
//                 text: 'All', value: this.state.selRealmCountry.length
//             }]
//         }
//         return (
//             <div className="animated">
//                   <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     {/* <CardHeader className="mb-md-3 pb-lg-1">

//                          <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.realmcountrylist')}</strong>{' '} 
//                         <div className="card-header-actions">

//                         </div>
//                     </CardHeader> */}
//                     <CardBody className="pb-lg-0 mt-3">
//                         <Col md="3 pl-0">
//                             <FormGroup className="Selectdiv">
//                                 <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
//                                 <div className="controls SelectGo">
//                                     <InputGroup>
//                                         <Input
//                                             type="select"
//                                             name="realmId"
//                                             id="realmId"
//                                             bsSize="sm"
//                                             onChange={this.filterData}
//                                         >
//                                             <option value="0">{i18n.t('static.common.all')}</option>
//                                             {realmList}
//                                         </Input>
//                                         {/* <InputGroupAddon addonType="append">
//                                             <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                         </InputGroupAddon> */}
//                                     </InputGroup>
//                                 </div>
//                             </FormGroup>
//                         </Col>
//                         <ToolkitProvider
//                             keyField="realmCountryId"
//                             data={this.state.selRealmCountry}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (
//                                     <div className="TableCust listRealmAlignThtd">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             /*  rowEvents={{
//                                                   onClick: (e, row, rowIndex) => {
//                                                       this.editSupplier(row);
//                                                   }
//                                               }}*/
//                                             {...props.baseProps}
//                                         />
//                                     </div>
//                                 )
//                             }
//                         </ToolkitProvider>

//                     </CardBody>
//                 </Card>
//                 <div style={{ display: this.state.loading ? "block" : "none" }}>
//                     <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//                         <div class="align-items-center">
//                             <div ><h4> <strong>Loading...</strong></h4></div>

//                             <div class="spinner-border blue ml-4" role="status">

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }
// export default ListRealmCountryComponent;


import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import i18n from '../../i18n'

import RealmService from "../../api/RealmService";
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import getLabelText from '../../CommonComponent/getLabelText';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import moment from 'moment';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION } from '../../Constants';

const entityname = i18n.t('static.dashboard.realmcountry');
class ListRealmCountryComponent extends Component {
    constructor(props) {
        super(props);
        this.options = {
            sortIndicator: true,
            hideSizePerPage: false,
            paginationSize: 3,
            hidePageListOnlyOnePage: true,
            clearSearch: true,
            alwaysShowAllBtns: false,
            withFirstAndLast: false,
            onRowClick: function (row) {
                this.editProcurementAgent(row);
            }.bind(this)

        }
        this.state = {
            realms: [],
            realmCountryList: [],
            message: '',
            selRealmCountry: [],
            loading: true
        }
        this.editProcurementAgent = this.editProcurementAgent.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewRealmCountry = this.addNewRealmCountry.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);

    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    addNewRealmCountry() {
        this.props.history.push("/realmCountry/addRealmCountry");
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId)
            this.setState({
                selRealmCountry
            }, () => {
                this.buildJExcel();
            });
        } else {
            this.setState({
                selRealmCountry: this.state.realmCountryList
            }, () => {
                this.buildJExcel();
            });
        }
    }

    buildJExcel() {
        let realmCountryList = this.state.selRealmCountry;
        // console.log("realmCountryList---->", realmCountryList);
        let realmCountryArray = [];
        let count = 0;

        for (var j = 0; j < realmCountryList.length; j++) {
            data = [];
            data[0] = realmCountryList[j].realmCountryId
            data[1] = getLabelText(realmCountryList[j].realm.label, this.state.lang)
            data[2] = getLabelText(realmCountryList[j].country.label, this.state.lang)
            data[3] = getLabelText(realmCountryList[j].defaultCurrency.label, this.state.lang)
            data[4] = realmCountryList[j].lastModifiedBy.username;
            data[5] = (realmCountryList[j].lastModifiedDate ? moment(realmCountryList[j].lastModifiedDate).format(`${DATE_FORMAT_CAP}`) : null)
            data[6] = realmCountryList[j].active;


            realmCountryArray[count] = data;
            count++;
        }
        // if (realmCountryList.length == 0) {
        //     data = [];
        //     realmCountryArray[0] = data;
        // }
        // console.log("realmCountryArray---->", realmCountryArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = realmCountryArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'realmCountryId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.country'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.currency'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'text',
                    readOnly: true
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },

            ],
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // onselection: this.selected,


            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        // items.push({
                        //     title: i18n.t('static.planningunit.planningunitupdate'),
                        //     onclick: function () {
                        //         // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                        //         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT')) {
                        //             this.props.history.push({
                        //                 pathname: `/realmCountry/realmCountryPlanningUnit/${this.el.getValueFromCoords(0, y)}`,
                        //             })
                        //         }

                        //     }.bind(this)
                        // });

                        items.push({
                            title: i18n.t('static.realmcountry.regionupdate'),
                            onclick: function () {
                                // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REGION')) {
                                    this.props.history.push({
                                        pathname: `/realmCountry/realmCountryRegion/${this.el.getValueFromCoords(0, y)}`,
                                    })
                                }

                            }.bind(this)
                        });
                    }
                }


                return items;
            }.bind(this)
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    editProcurementAgent(procurementAgent) {
        this.props.history.push({
            pathname: "/procurementAgent/editProcurementAgent",
            state: { procurementAgent }
        });
    }
    PlanningUnitCountry(event, row) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT')) {
            console.log(JSON.stringify(row))
            this.props.history.push({
                pathname: `/realmCountry/realmCountryPlanningUnit/${row.realmCountryId}`,
                state: { realmCountry: row }


            })
        }
    }
    RealmCountryRegion(event, row) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REGION')) {
            console.log(JSON.stringify(row))
            this.props.history.push({
                pathname: `/realmCountry/realmCountryRegion/${row.realmCountryId}`,
                state: { realmCountry: row }


            })
        }
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realms: response.data, loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })
            .catch(
                error => {
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
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
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

        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmCountryList: response.data,
                        selRealmCountry: response.data,
                        loading: false
                    }, () => {
                        this.buildJExcel();
                    });
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })
            .catch(
                error => {
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
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
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

    }

    showCountryLabel(cell, row) {
        return cell.label.label_en;
    }
    showCurrencyLabel(cell, row) {
        return cell.label.label_en;
    }

    showPalletUnitLabel(cell, row) {
        return cell.label.label_en;
    }

    showRealmLabel(cell, row) {
        return cell.label.label_en;
    }

    showStatus(cell, row) {
        if (cell) {
            return "Active";
        } else {
            return "Disabled";
        }
    }
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    {/* <CardHeader className="mb-md-3 pb-lg-1">

                         <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.realmcountrylist')}</strong>{' '} 
                        <div className="card-header-actions">

                        </div>
                    </CardHeader> */}
                    <CardBody className="pb-lg-0 mt-1">
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                            <Col md="3 pl-0">
                                <FormGroup className="Selectdiv mt-md-1 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmId"
                                                id="realmId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmList}
                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </Col>
                        }

                        {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className="jexcelremoveReadonlybackground ">
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
            </div>
        );
    }
}
export default ListRealmCountryComponent;

