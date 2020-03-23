import React, { Component } from 'react';
import UnitTypeService from '../../api/UnitTypeService.js';
import AuthenticationService from '../common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';

export default class UnitTypeListComponent extends Component {

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
                this.editUnitType(row);
            }.bind(this)

        }
        this.state = {
            unitTypeList: []
        }
        this.addNewUnitType = this.addNewUnitType.bind(this);
        this.editUnitType = this.editUnitType.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        UnitTypeService.getUnitTypeListAll().then(response => {
            console.log(response.data)
            this.setState({
                unitTypeList: response.data
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

    showUnitTypeLabel(cell,row){
        return cell.label_en;
    }

    editUnitType(unitType) {
        this.props.history.push({
            pathname: "/diamension/editDiamension",
            state: { unitType: unitType }
        });
    }

    addNewUnitType() {
        if (navigator.onLine) {
            this.props.history.push(`/diamension/addDiamension`)
        } else {
            alert("You must be Online.")
        }

    }render() {

        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>Dimension List
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Realm" onClick={this.addNewUnitType}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.unitTypeList} version="4"  hover pagination search options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="label" dataSort dataFormat={this.showUnitTypeLabel} dataAlign="center">Dimension List</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
        }
}