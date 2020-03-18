import React, { Component } from 'react';
import LanguageService from '../../api/LanguageService.js'
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
// import { HashRouter, Route, Switch } from 'react-router-dom';

export default class LanguageListComponent extends Component {

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
                this.editLanguage(row);
            }.bind(this)

        }

        this.state = {
            langaugeList: []
        }
        this.editLanguage = this.editLanguage.bind(this);
        this.addLanguage = this.addLanguage.bind(this);
        this.showStatus = this.showStatus.bind(this);
    }

    editLanguage(language) {
        this.props.history.push({
            pathname: "/language/editLanguage",
            state: { language }
        });
    }

    addLanguage(){
        if (navigator.onLine) {
            this.props.history.push(`/language/addLanguage`)
        } else {
            alert("You must be Online.")
        }
    }
    
    showStatus(cell, row) {
        if (cell) {
            return "Active";
        } else {
            return "Disabled";
        }
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageList()
            .then(response => {
                console.log(response.data)
                this.setState({
                    langaugeList: response.data
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

    render() {

    return (
        <div className="animated">
            <Card>
                <CardHeader>
                    <i className="icon-menu"></i><strong>Language List</strong>{' '}
                    <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Language" onClick={this.addLanguage}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                </CardHeader>
                <CardBody>
                    <BootstrapTable data={this.state.langaugeList} version="4" striped hover pagination search  options={this.options}>
                        <TableHeaderColumn isKey dataField="languageName" >Language Name</TableHeaderColumn>
                        <TableHeaderColumn dataField="active" dataFormat={this.showStatus} dataSort>Status</TableHeaderColumn>
                    </BootstrapTable>
                </CardBody>
            </Card>
            <div>
                    <h6>{this.state.message}</h6>
                    <h6>{this.props.match.params.messageCode}</h6>
                </div>
        </div>
    );
    }
}