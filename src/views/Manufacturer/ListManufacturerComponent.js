
import React, { Component } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import i18n from '../../i18n'

import ManufacturerService from "../../api/ManufacturerService";
import AuthenticationService from '../Common/AuthenticationService.js';
const entityname=i18n.t('static.manufacturer.manufacturer');
class ManufacturerListComponent extends Component {
    constructor(props) {
        super(props);
       
        this.state = {
            manufacturerList: [],
            message: '',
            selSource: []
        }
        this.editManufacturer = this.editManufacturer.bind(this);
        this.addManufacturer = this.addManufacturer.bind(this);
    }
    editManufacturer(manufacturer) {
        this.props.history.push({
            pathname: "/manufacturer/editManufacturer",
            state: { manufacturer }
        });
    }
    addManufacturer(manufacturer) {
        this.props.history.push({
            pathname: "/manufacturer/addManufacturer"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ManufacturerService.getManufacturerListAll()
            .then(response => {
                console.log(response.data)
                this.setState({
                    manufacturerList: response.data,
                    selSource: response.data
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
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

   
    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
               {i18n.t('static.common.result',{from,to,size}) }
            </span>
        );

        const columns = [{
            dataField: 'realm.label.label_en',
            text: i18n.t('static.realm.realm'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        },{
            dataField: 'label.label_en',
            text: i18n.t('static.manufacturer.manufacturer'),
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
                    (row.active ? i18n.t('static.common.active') :i18n.t('static.common.disabled'))
                );
            }
        }];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage') ,
            prePageTitle: i18n.t('static.common.prevPage') ,
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage') ,
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
                <h5>{i18n.t(this.props.match.params.message,{entityname})}</h5>
                <h5>{i18n.t(this.state.message,{entityname})}</h5>
        <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.manufacturer.manufacturerlist')}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity',{entityname})} onClick={this.addManufacturer}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                    <ToolkitProvider
                            keyField="manufacturerId"
                            data={this.state.selSource}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div>
                                        <hr />
                                        <SearchBar {...props.searchProps} />
                                        <ClearSearchButton {...props.searchProps} />
                                        <BootstrapTable noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editManufacturer(row);
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
export default ManufacturerListComponent;
