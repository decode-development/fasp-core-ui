import React, { Component } from 'react';
import RealmService from '../../api/RealmService'
import AuthenticationService from '../Common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


const entityname = i18n.t('static.realm.realm');
export default class ReactListComponent extends Component {


    constructor(props) {
        super(props);
        this.state = {
            realmList: [],
            message: '',
            selRealm: [],
            loading: true
        }
        this.addNewRealm = this.addNewRealm.bind(this);
        this.editRealm = this.editRealm.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
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
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        RealmService.getRealmListAll().then(response => {
            if (response.status == 200) {
                this.setState({
                    realmList: response.data,
                    selRealm: response.data,
                    loading: false
                })
            } else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
        })
        // .catch(
        //     error => {
        //         if (error.message === "Network Error") {
        //             this.setState({ message: error.message });
        //         } else {
        //             switch (error.response ? error.response.status : "") {
        //                 case 500:
        //                 case 401:
        //                 case 404:
        //                 case 406:
        //                 case 412:
        //                     this.setState({ message: error.response.data.messageCode });
        //                     break;
        //                 default:
        //                     this.setState({ message: 'static.unkownError' });
        //                     break;
        //             }
        //         }

        //     }
        // );
    }
    editRealm(realm) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_REALM')) {
            this.props.history.push({
                pathname: `/realm/updateRealm/${realm.realmId}`,
                // state: { realm: realm }
            });
        }
    }

    addNewRealm() {
        if (navigator.onLine) {
            this.props.history.push(`/realm/addRealm`)
        } else {
            alert("You must be Online.")
        }

    }
    RealmCountry(event, row) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY')) {
            console.log(JSON.stringify(row))
            this.props.history.push({
                pathname: `/realmCountry/RealmCountry/${row.realmId}`,
                state: { realm: row }


            })
        }
    }
    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [
            {
                dataField: 'label',
                text: i18n.t('static.realm.realmName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'realmCode',
                text: i18n.t('static.realm.realmCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'minMosMinGaurdrail',
                text: i18n.t('static.realm.minMosMinGaurdraillabel'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'minMosMaxGaurdrail',
                text: i18n.t('static.realm.minMosMaxGaurdraillabel'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'maxMosMaxGaurdrail',
                text: i18n.t('static.realm.maxMosMaxGaurdraillabel'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'realmId',
                text: 'Action',
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    return (<div><Button type="button" size="sm" color="success" onClick={(event) => this.RealmCountry(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.realm.mapcountry')}</Button>
                    </div>)
                }
            }
            // {
            //     dataField: 'defaultRealm',
            //     text: i18n.t('static.realm.default'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: (cellContent, row) => {
            //         return (
            //             (row.defaultRealm ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
            //         );
            //     }
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
                text: 'All', value: this.state.selRealm.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_CREATE_REALM') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRealm}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 ">
                        <ToolkitProvider
                            keyField="realmId"
                            data={this.state.selRealm}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editRealm(row);
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                        {/* <BootstrapTable data={this.state.realmList} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="realmCode" dataSort dataAlign="center">Realm Code</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showRealmLabel} dataAlign="center">Realm Name (English)</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="monthInPastForAmc" dataSort dataAlign="center">Month In Past For AMC</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="monthInFutureForAmc" dataSort dataAlign="center">Month In Future For AMC</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="orderFrequency" dataSort dataAlign="center">Order Frequency</TableHeaderColumn>
                            <TableHeaderColumn dataField="defaultRealm" dataSort dataFormat={this.showStatus} dataAlign="center">Default</TableHeaderColumn>
                        </BootstrapTable> */}
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
            </div>
        );
    }
}

