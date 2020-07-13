
import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText'
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
const entityname = i18n.t('static.role.role');
class ListRoleComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roleList: [],
            message: '',
            selSource: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.editRole = this.editRole.bind(this);
        this.addNewRole = this.addNewRole.bind(this);
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

    addNewRole() {
        this.props.history.push("/role/addRole");
    }
    editRole(role) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_ROLE')) {
            this.props.history.push({
                pathname: `/role/editRole/${role.roleId}`,
                // state: { role }
            });
        }
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        UserService.getRoleList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({ roleList: response.data, selSource: response.data, loading: false })
                }
                else {
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
        //         switch (error.response ? error.response.status : "") {

        //             case 500:
        //             case 401:
        //             case 404:
        //             case 406:
        //             case 412:
        //                 this.setState({ message: error.response.data.messageCode });
        //                 break;
        //             default:
        //                 this.setState({ message: 'static.unkownError' });
        //                 break;
        //         }
        //     }
        // );
    }

    showRoleLabel(cell, row) {
        return cell.label_en;
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
        const columns = [{
            dataField: 'roleId',
            text: i18n.t('static.role.roleid'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'label',
            text: i18n.t('static.role.role'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
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

                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_ROLE') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRole}><i className="fa fa-plus-square"></i></a>}
                                {/* <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRole}><i className="fa fa-plus-square"></i></a> */}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0  ">
                        <ToolkitProvider
                            keyField="roleId"
                            data={this.state.selSource}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (<div className="TableCust">
                                    <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                        <SearchBar {...props.searchProps} />
                                        <ClearSearchButton {...props.searchProps} />
                                    </div>
                                    <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                        pagination={paginationFactory(options)}
                                        rowEvents={{
                                            onClick: (e, row, rowIndex) => {
                                                this.editRole(row);
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
export default ListRoleComponent;
