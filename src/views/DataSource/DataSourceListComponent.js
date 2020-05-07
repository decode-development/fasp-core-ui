import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import DataSourceService from '../../api/DataSourceService';
import DataSourceTypeService from '../../api/DataSourceTypeService';
import RealmService from '../../api/RealmService';
import ProgramService from "../../api/ProgramService";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


const entityname = i18n.t('static.datasource.datasource');
export default class DataSourceListComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            programs: [],
            dataSourceTypes: [],
            dataSourceList: [],
            message: '',
            selSource: []

        }
        this.editDataSource = this.editDataSource.bind(this);
        this.addNewDataSource = this.addNewDataSource.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
    }

    filterData() {
        let dataSourceTypeId = document.getElementById("dataSourceTypeId").value;
        let realmId = document.getElementById("realmId").value;
        let programId = document.getElementById("programId").value;

        // if (dataSourceTypeId != 0) {
        //     const selSource = this.state.dataSourceList.filter(c => c.dataSourceType.id == dataSourceTypeId)
        //     this.setState({
        //         selSource
        //     });
        // } else {
        //     this.setState({
        //         selSource: this.state.dataSourceList
        //     });
        // }

        if (realmId != 0 && dataSourceTypeId != 0 && programId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.dataSourceType.id == dataSourceTypeId && c.program.id == programId)
            this.setState({
                selSource
            });
        } else if (realmId != 0 && dataSourceTypeId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.dataSourceType.id == dataSourceTypeId)
            this.setState({
                selSource
            });
        } else if (realmId != 0 && programId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.program.id == programId)

            this.setState({
                selSource
            });
        } else if (dataSourceTypeId != 0 && programId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.program.id == programId && c.dataSourceType.id == dataSourceTypeId)
            this.setState({
                selSource
            });
        } else if (realmId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId)
            this.setState({
                selSource
            });
        } else if (dataSourceTypeId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.dataSourceType.id == dataSourceTypeId)
            this.setState({
                selSource
            });
        } else if (programId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.program.id == programId)
            this.setState({
                selSource
            });
        } else {
            this.setState({
                selSource: this.state.dataSourceList
            });
        }

    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();

        ProgramService.getProgramList()
            .then(response => {
                this.setState({
                    programs: response.data
                })
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

        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realms: response.data
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
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

        DataSourceTypeService.getDataSourceTypeList().then(response => {
            console.log(response.data)
            this.setState({
                dataSourceTypes: response.data,

            })
        })
        // .catch(
        //     error => {
        //         if (error.message === "Network Error") {
        //             this.setState({ message: error.message });
        //         } else {
        //             switch (error.response.status) {
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

        DataSourceService.getAllDataSourceList().then(response => {
            this.setState({
                dataSourceList: response.data,
                selSource: response.data
            })
        })
        // .catch(
        //     error => {
        //         if (error.message === "Network Error") {
        //             this.setState({ message: error.message });
        //         } else {
        //             switch (error.response.status) {
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

    editDataSource(dataSource) {
        this.props.history.push({
            pathname: `/dataSource/editDataSource/${dataSource.dataSourceId}`,
            // state: { dataSource: dataSource }
        });

    }

    addNewDataSource() {

        if (navigator.onLine) {
            this.props.history.push(`/dataSource/addDataSource`)
        } else {
            alert(i18n.t('static.common.online'))
        }

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
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

        const { dataSourceTypes } = this.state;
        let dataSourceTypeList = dataSourceTypes.length > 0
            && dataSourceTypes.map((item, i) => {
                return (
                    <option key={i} value={item.dataSourceTypeId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
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

        const columns = [{
            dataField: 'realm.label',
            text: i18n.t('static.realm.realm'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'dataSourceType.label',
            text: i18n.t('static.datasourcetype.datasourcetype'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'label',
            text: i18n.t('static.datasource.datasource'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'program.label',
            text: i18n.t('static.dataSource.program'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'active',
            text: i18n.t('static.common.status'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: (cellContent, row) => {
                return (
                    (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
                );
            }
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
                text: 'All', value: this.state.selSource.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i>{i18n.t('static.common.listEntity', { entityname })}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewDataSource}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody className="pb-lg-0">
                        <Col md="9 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmId"
                                                id="realmId"
                                                bsSize="sm"
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.dataSource.program')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {programList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.datasourcetype.datasourcetype')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="dataSourceTypeId"
                                                id="dataSourceTypeId"
                                                bsSize="sm"
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {dataSourceTypeList}
                                            </Input>
                                            <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <ToolkitProvider
                            keyField="dataSourceId"
                            data={this.state.selSource}
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
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editDataSource(row);
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>

                    </CardBody>
                </Card>
            </div>
        );
    }

}