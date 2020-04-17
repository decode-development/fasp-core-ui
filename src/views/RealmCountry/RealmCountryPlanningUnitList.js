import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmCountryService from '../../api/RealmCountryService';


const entityname = i18n.t('static.dashboad.planningunitcountry');
export default class RealmCountryPlanningUnitList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realmCountrys: [],
            realmCountryPlanningUnitList: [],
            message: '',
            selSource: []

        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
    }

    filterData() {
        let realmCountryId = document.getElementById("realmCountryId").value;
        AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.getRealmCountryPlanningUnitAllByrealmCountryId(realmCountryId).then(response => {
            console.log(response.data)
            this.setState({
                realmCountryPlanningUnitList: response.data,
                selSource: response.data
            })
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
   
  
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.getRealmCountryListAll().then(response => {
            console.log(response.data)
            this.setState({
                realmCountrys: response.data,

            })
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

         }

    

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    render() {
        const { realmCountrys } = this.state;
        let realmCountryList = realmCountrys.length > 0
            && realmCountrys.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.realm.label, this.state.lang)+" - "+ getLabelText(item.country.label, this.state.lang)}
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
            dataField: 'label',
            text: i18n.t('static.dashboad.planningunitcountry'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        },{
            dataField: 'realmCountry.label',
            text: i18n.t('static.dashboard.realmcountry'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        },{
            dataField: 'planningUnit.label',
            text: i18n.t('static.dashboard.planningunit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'unit.label',
            text: i18n.t('static.unit.unit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        }, {
            dataField: 'skuCode',
            text: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'multiplier',
            text: i18n.t('static.unit.multiplier'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            //formatter: this.formatLabel
        }, {
            dataField: 'gtin',
            text: i18n.t('static.procurementAgentProcurementUnit.gtin'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
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
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>{i18n.t('static.common.listEntity', { entityname })}
                        <div className="card-header-actions">
                           
                        </div>

                    </CardHeader>
                    <CardBody>
                        <Col md="3 pl-0">
                            <FormGroup>
                                <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.realmcountry')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="realmCountryId"
                                            id="realmCountryId"
                                            bsSize="sm"
                                        >
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {realmCountryList}
                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <ToolkitProvider
                            keyField="realmCountryPlanningUnitId"
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
                                           /* rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editRealmCountryPlanningUnit(row);
                                                }
                                            }}*/
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
