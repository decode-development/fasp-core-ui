import React, { Compoent, Component } from 'react';
import DataSourceService from '../../api/DataSourceService';
import AuthenticationService from '../common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';


export default class DataSourceListComponent extends Component {

    constructor(props) {
        super(props);
        this.table = data.rows;
        this.options = {
            sortIndicator: true,
            hideSizePerPage: true,
            paginationSize: 3,
            hidePageListOnlyOnePage: true,
            clearSearch: true,
            alwaysShowAllBtns: false,
            withFirstAndLast: false,
            onRowClick: function (row) {
                // console.log("row--------------", row);
                this.editDataSource(row);
            }.bind(this)

        }
        this.state = {
            dataSourceList: []

        }
        this.editDataSource = this.editDataSource.bind(this);
        this.addNewDataSource = this.addNewDataSource.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        DataSourceService.getDataSourceList().then(response => {
            this.setState({
                dataSourceList: response.data
            })
        })
            .catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.message
                            })
                            break
                    }
                }
            );
    }

    editDataSource(dataSource) {
        this.props.history.push({
            pathname: "/dataSource/editDataSource",
            state: { dataSource: dataSource }
        });

    }

    addNewDataSource() {

        if (navigator.onLine) {
            this.props.history.push(`/addDataSource`)
        } else {
            alert("You must be Online.")
        }

    }

    showDataSourceLabel(cell, row) {
        return cell.label_en;
    }

    showDataSourceTypeLabel(cell, row) {
        return cell.label.label_en;
    }

    // render() {
    //     return (



    //         <div className="page-content-wrap">


    //         <div className="row">

    //             <ul class="breadcrumb text-left"><li><a href="#">Home</a></li><li><a href="#">Admin</a></li><li><a href="#">Datasource</a></li><li><a href="#">Datasource list</a></li></ul>
    //             <div className="help-block">{this.props.match.params.message}</div>

    //             <div className="col-md-12">

    //                 <div className=" mt-2 ">


    //                     <div className="panel panel-default">


    //                         <div className="panel-heading">
    //                             <h3 className="panel-title">Language list</h3>
    //                             <button className="btn btn-info pull-right" onClick={this.addNewDataSource}><i class="fa fa-plus" ></i></button>
    //                         </div>
    //                         <div className="panel-body text-left">
    //                             <div className="col-md-12">



    //                                 <div className="table-responsive">
    //                                     <table className="table datatable">
    //                                         <thead>
    //                                         <tr>
    //                             <th>Data source name (English)</th>
    //                             <th>Data source name (French)</th>
    //                             <th>Data source name (Spanish)</th>
    //                             <th>Data source name (portuguese)</th>
    //                             <th>Data source type name (English)</th>
    //                             <th>Active</th>


    //                         </tr>
    //                                         </thead>
    //                                         <tbody>
    //                                         {
    //                             this.state.dataSourceList.map(dataSource =>

    //                                 <tr key={dataSource.dataSourceId} onClick={() => this.editDataSource(dataSource)}>
    //                                     <td>{dataSource.label.label_en}</td>
    //                                     <td>{dataSource.label.label_fr}</td>
    //                                     <td>{dataSource.label.label_sp}</td>
    //                                     <td>{dataSource.label.label_pr}</td>
    //                                     <td>{dataSource.dataSourceType.label.engLabel}</td>
    //                                     <td>{dataSource.active.toString() == "true" ? "Active" : "Disabled"}</td>
    //                                 </tr>
    //                             )

    //                         }

    //                                         </tbody>
    //                                     </table>
    //                                 </div>

    //                             </div>

    //                         </div>



    //                     </div>


    //                 </div>


    //             </div>


    //         </div>


    //     </div>



    //     );
    // }

    render() {

        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>DataSource List
                </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.dataSourceList} version="4" striped hover pagination search headerStyle={{ background: '#D1EEEE' }} options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="label" dataSort dataFormat={this.showDataSourceLabel} dataAlign="center">Data source name (English)</TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="dataSourceType" dataSort dataFormat={this.showDataSourceTypeLabel} dataAlign="center">Data source type name (English)</TableHeaderColumn>
                            <TableHeaderColumn dataField="active" dataSort dataAlign="center">Status</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }

}