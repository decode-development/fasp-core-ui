import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import CountryService from '../../api/CountryService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { DATE_FORMAT_CAP } from '../../Constants.js';
import moment from 'moment';

import i18n from '../../i18n';
import { boolean } from 'yup';
import ProgramService from '../../api/ProgramService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';



const entityname = i18n.t('static.dashboard.manualTagging');
export default class ManualTagging extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countryList: [],
            message: '',
            outputList:
                [{
                    expectedDeliveryDate: '2020-04-20',
                    shipmentStatus: 'SUBMIITED',
                    procurementAgent: {
                        label: {
                            label_en: 'PSM'
                        }
                    },
                    budget: {
                        label: {
                            label_en: 'Family Planning - Malawi 2020 - MWI3'
                        }
                    },
                    suggestedOrderQty: 20000,
                    totalAmount: 57200
                },
                {
                    expectedDeliveryDate: '2020-08-25',
                    shipmentStatus: 'SUBMITTED',
                    procurementAgent: {
                        label: {
                            label_en: 'PSM'
                        }
                    },
                    budget: {
                        label: {
                            label_en: 'Family Planning - Malawi 2020 - MWI3'
                        }
                    },
                    suggestedOrderQty: 67982,
                    totalAmount: 194428.52
                },
                {
                    expectedDeliveryDate: '2021-02-07',
                    shipmentStatus: 'PLANNED',
                    procurementAgent: {
                        label: {
                            label_en: 'PSM'
                        }
                    },
                    budget: {
                        label: {
                            label_en: 'Family Planning - Malawi 2020 - MWI3'
                        }
                    },
                    suggestedOrderQty: 50000,
                    totalAmount: 143000
                },
                {
                    expectedDeliveryDate: '2021-06-16',
                    shipmentStatus: 'PLANNED',
                    procurementAgent: {
                        label: {
                            label_en: 'PSM'
                        }
                    },
                    budget: {
                        label: {
                            label_en: 'Family Planning - Malawi 2020 - MWI3'
                        }
                    },
                    suggestedOrderQty: 47823,
                    totalAmount: 136773.78
                }],

            loading: true,
            programs: [],
            planningUnits: [],
            outputListAfterSearch:
                [
                    {
                        expectedDeliveryDate: '2020-08-25',
                        shipmentStatus: 'SUBMITTED',
                        procurementAgent: {
                            label: {
                                label_en: 'PSM'
                            }
                        },
                        budget: {
                            label: {
                                label_en: 'Family Planning - Malawi 2020 - MWI3'
                            }
                        },
                        suggestedOrderQty: 65000,
                        totalAmount: 185900
                    }]
        }
        this.addNewCountry = this.addNewCountry.bind(this);
        this.editCountry = this.editCountry.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
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

    filterData() {

    }


    addNewCountry() {
        if (navigator.onLine) {
            this.props.history.push(`/country/addCountry`)
        } else {
            alert("You must be Online.")
        }

    }
    editCountry(country) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_COUNTRY')) {
            console.log(country);
            this.props.history.push({
                pathname: `/country/editCountry/${country.countryId}`,
                // state: { country: country }
            });
        }
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        console.log("new date--->", new Date());
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        programs: response.data
                    })
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

    getPlanningUnitList() {
        AuthenticationService.setupAxiosInterceptors();
        var programId = document.getElementById("programId").value;
        ProgramService.getProgramPlaningUnitListByProgramId(programId)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        planningUnits: response.data
                    })
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
    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    toggleLarge() {
        this.setState({
            manualTag: !this.state.manualTag,
        })
    }

    addCommas(cell, row) {
        console.log("row---------->", row);
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

      formatDate(cell, row) {
        if (cell != null && cell != "") {
          var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
          return modifiedDate;
        } else {
          return "";
        }
      }

    render() {
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0 && planningUnits.map((item, i) => {
            return (
                <option key={i} value={item.planningUnit.id}>
                    {getLabelText(item.planningUnit.label, this.state.lang)}
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
            dataField: 'expectedDeliveryDate',
            text: 'Expected Delivery Date',
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatDate
        }, {
            dataField: 'shipmentStatus',
            text: 'Shipment Status',
            sort: true,
            align: 'center',
            headerAlign: 'center',
            // formatter: this.formatLabel
        }, {
            dataField: 'procurementAgent.label.label_en',
            text: 'Planning Unit',
            sort: true,
            align: 'center',
            headerAlign: 'center',
            // formatter: this.formatLabel
        },
        {
            dataField: 'budget.label.label_en',
            text: 'Budget',
            sort: true,
            align: 'center',
            headerAlign: 'center',
            // formatter: this.formatLabel
        },
        {
            dataField: 'suggestedOrderQty',
            text: 'Suggested Quantity',
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.addCommas
        },
        {
            dataField: 'totalAmount',
            text: 'Total Amount',
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.addCommas
        }
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
                text: 'All', value: this.state.outputList.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card >
                    <CardBody className="">
                        <Col md="12 pl-0">
                            <div className="d-md-flex">
                                <FormGroup className="col-md-3 pl-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                onChange={this.getPlanningUnitList}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {planningUnitList}

                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                                        <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
                                                                    </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        <ToolkitProvider
                            keyField="countryId"
                            data={this.state.outputList}
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
                                                    this.toggleLarge();
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>

                        {/* Consumption modal */}
                        <Modal isOpen={this.state.manualTag}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                                <strong>Search ERP Orders</strong>
                            </ModalHeader>
                            <ModalBody>
                                <Col md="12 pl-0">
                                    <div className="d-md-flex">
                                        <FormGroup className="col-md-3 pl-0">
                                            <Label htmlFor="appendedInputButton">Order No</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="orderNo"
                                                        id="orderNo"
                                                        bsSize="sm"
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">Prime Line No</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="primeLineNo"
                                                        id="primeLineNo"
                                                        bsSize="sm"
                                                    >
                                                    </Input>
                                                    <InputGroupAddon addonType="append">
                                                        <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </Col>
                                
                        <ToolkitProvider
                            keyField="optList"
                            data={this.state.outputListAfterSearch}
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
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveConsumption}> <i className="fa fa-check"></i> Link</Button>{' '}
                                <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Consumption')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </ModalFooter>
                        </Modal>
                        {/* Consumption modal */}
                    </CardBody>
                </Card>
                {/* <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        );
    }

}