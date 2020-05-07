import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BudgetServcie from '../../api/BudgetService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import FundingSourceService from '../../api/FundingSourceService';
import moment from 'moment';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

const entityname = i18n.t('static.dashboard.budget');

class ListBudgetComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      budgetList: [],
      lang: localStorage.getItem('lang'),
      message: '',
      selBudget: [],
      fundingSourceList: []
    }

    // this.options = {
    //   sortIndicator: true,
    //   hideSizePerPage: true,
    //   paginationSize: 3,
    //   hidePageListOnlyOnePage: true,
    //   clearSearch: true,
    //   alwaysShowAllBtns: false,
    //   withFirstAndLast: false,
    //   onRowClick: function (row) {
    //     this.editBudget(row);
    //   }.bind(this)
    // }

    // this.showBudgetLabel = this.showBudgetLabel.bind(this);
    // this.showSubFundingSourceLabel = this.showSubFundingSourceLabel.bind(this);
    // this.showFundingSourceLabel = this.showFundingSourceLabel.bind(this);
    this.editBudget = this.editBudget.bind(this);
    this.addBudget = this.addBudget.bind(this);
    this.filterData = this.filterData.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.formatLabel = this.formatLabel.bind(this);
    this.addCommas = this.addCommas.bind(this);
  }



  filterData() {
    let fundingSourceId = document.getElementById("fundingSourceId").value;
    if (fundingSourceId != 0) {
      const selBudget = this.state.budgetList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
      this.setState({
        selBudget: selBudget
      });
    } else {
      this.setState({
        selBudget: this.state.budgetList
      });
    }
  }
  formatDate(cell, row) {
    if (cell != null && cell != "") {
      var modifiedDate = moment(cell).format('MM-DD-YYYY');
      return modifiedDate;
    } else {
      return "";
    }
  }
  editBudget(budget) {
    var budgetId = budget.budgetId
    this.props.history.push({
      pathname: `/budget/editBudget/${budgetId}`,
      // state: { budget }
    });
  }

  addBudget(budget) {
    // console.log("going to Add Budget");
    this.props.history.push({
      pathname: "/budget/addBudget"
    });
  }


  componentDidMount() {
    AuthenticationService.setupAxiosInterceptors();
    BudgetServcie.getBudgetList()
      .then(response => {
        console.log(response)
        if (response.status == 200) {
          console.log("budget after status 200 new console --- ---->", response.data);
          this.setState({
            budgetList: response.data,
            selBudget: response.data
          })
        } else {
          this.setState({ message: response.data.messageCode })
        }
      })
    // .catch(
    //   error => {
    //     if (error.message === "Network Error") {
    //       this.setState({ message: error.message });
    //     } else {
    //       switch (error.response ? error.response.status : "") {
    //         case 500:
    //         case 401:
    //         case 404:
    //         case 406:
    //         case 412:
    //           this.setState({ message: error.response.data.messageCode });
    //           break;
    //         default:
    //           this.setState({ message: 'static.unkownError' });
    //           break;
    //       }
    //     }
    //   }
    // );
    FundingSourceService.getFundingSourceListAll()
      .then(response => {
        if (response.status == 200) {
          console.log("funding source after status 200--->" + response.data)
          this.setState({
            fundingSourceList: response.data
          })
        } else {
          this.setState({ message: response.data.messageCode })
        }
      })
    // .catch(
    //   error => {
    //     if (error.message === "Network Error") {
    //       this.setState({ message: error.message });
    //     } else {
    //       switch (error.response ? error.response.status : "") {
    //         case 500:
    //         case 401:
    //         case 404:
    //         case 406:
    //         case 412:
    //           this.setState({ message: error.response.data.messageCode });
    //           break;
    //         default:
    //           this.setState({ message: 'static.unkownError' });
    //           console.log("Error code unkown");
    //           break;
    //       }
    //     }
    //   }
    // );

  }
  // showSubFundingSourceLabel(cell, row) {
  //   return getLabelText(cell.label, this.state.lang);
  // }

  // showFundingSourceLabel(cell, row) {
  //   return getLabelText(cell.fundingSource.label, this.state.lang);
  // }

  // showStatus(cell, row) {
  //   if (cell) {
  //     return "Active";
  //   } else {
  //     return "Disabled";
  //   }
  // }

  formatLabel(cell, row) {
    console.log("celll----", cell);
    if (cell != null && cell != "") {
      return getLabelText(cell, this.state.lang);
    }
  }

  addCommas(cell, row) {
    console.log("---------->m in");
    cell += '';
    var x = cell.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }


  render() {

    const { SearchBar, ClearSearchButton } = Search;
    const { fundingSourceList } = this.state;

    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );

    let fundingSources = fundingSourceList.length > 0 && fundingSourceList.map((item, i) => {
      return (
        <option key={i} value={item.fundingSourceId}>
          {getLabelText(item.label, this.state.lang)}
        </option>
      )
    }, this);

    const columns = [

      {
        dataField: 'program.label',
        text: i18n.t('static.budget.program'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'fundingSource.label',
        text: i18n.t('static.budget.fundingsource'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel

      },
      {
        dataField: 'notes',
        text: i18n.t('static.program.notes'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
      },
      {
        dataField: 'budgetAmt',
        text: i18n.t('static.budget.budgetamount'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.addCommas
      },
      {
        dataField: 'startDate',
        text: i18n.t('static.common.startdate'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatDate
      },
      {
        dataField: 'stopDate',
        text: i18n.t('static.common.stopdate'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatDate
      },
      {
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
        text: 'All', value: this.state.selBudget.length
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
            <i className="icon-menu"></i>{i18n.t('static.common.listEntity', { entityname })}{' '}
            <div className="card-header-actions">
              <div className="card-header-action">
                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addBudget}><i className="fa fa-plus-square"></i></a>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pb-lg-0 ">
            {/* <BootstrapTable data={this.state.table} version="4" striped hover pagination search options={this.options}>
              <TableHeaderColumn isKey dataField="budgetId" hidden>Budget Id</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="label" dataFormat={this.showBudgetLabel} dataSort>{i18n.t('static.budget.budget')}</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="subFundingSource" dataFormat={this.showSubFundingSourceLabel} dataSort>{i18n.t('static.budget.subfundingsource')}</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="subFundingSource" dataFormat={this.showFundingSourceLabel} dataSort>{i18n.t('static.budget.fundingsource')}</TableHeaderColumn>
              <TableHeaderColumn dataField="budgetAmt" dataSort>{i18n.t('static.budget.budgetamount')}</TableHeaderColumn>
              <TableHeaderColumn dataField="startDate" dataSort>{i18n.t('static.common.startdate')}</TableHeaderColumn>
              <TableHeaderColumn dataField="stopDate" dataSort>{i18n.t('static.common.stopdate')}</TableHeaderColumn>
              <TableHeaderColumn dataFormat={this.showStatus} dataField="active" dataSort>{i18n.t('static.common.active')}</TableHeaderColumn>
            </BootstrapTable> */}
            <Col md="3 pl-0" >
              <FormGroup className="Selectdiv">
                <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                <div className="controls SelectGo">
                  <InputGroup>
                    <Input
                      type="select"
                      name="fundingSourceId"
                      id="fundingSourceId"
                      bsSize="sm"
                    >
                      <option value="0">{i18n.t('static.common.all')}</option>
                      {fundingSources}
                    </Input>
                    <InputGroupAddon addonType="append">
                      <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </FormGroup>
            </Col>
            <ToolkitProvider
              keyField="budgetId"
              data={this.state.selBudget}
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
                          // row.startDate = moment(row.startDate).format('YYYY-MM-DD');
                          // row.stopDate = moment(row.stopDate).format('YYYY-MM-DD');
                          // row.startDate = moment(row.startDate);
                          // row.stopDate = moment(row.stopDate);
                          this.editBudget(row);
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
    )
  }
}

export default ListBudgetComponent;