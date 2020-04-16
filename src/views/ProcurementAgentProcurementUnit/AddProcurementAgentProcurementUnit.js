
import React, { Component } from 'react';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row

} from 'reactstrap';
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import StatusUpdateButtonFeature from '../../CommonComponent/StatusUpdateButtonFeature';
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
import AuthenticationService from '../Common/AuthenticationService.js';
import ProcurementUnitService from "../../api/ProcurementUnitService";
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n';
const entityname = i18n.t('static.dashboard.procurementAgentProcurementUnit')
export default class AddProcurementAgentProcurementUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        if (this.props.location.state.procurementAgentProcurementUnit.length > 0) {
            rows = this.props.location.state.procurementAgentProcurementUnit;
        }
        this.state = {
            procurementAgentProcurementUnit: this.props.location.state.procurementAgentProcurementUnit,
            procurementUnitId: '',
            procurementUnitName: '',
            skuCode: '',
            vendorPrice: '',
            approvedToShippedLeadTime: '',
            gtin: '',
            procurementAgentProcurementUnitId: 0,
            isNew: true,
            rows: rows,
            procurementAgentList: [],
            procurementUnitList: [],
            addRowMessage: '',
            lang: localStorage.getItem('lang'),
            procurementAgentId: this.props.location.state.procurementAgentId
        }
        this.addRow = this.addRow.bind(this);
        // this.deleteLastRow = this.deleteLastRow.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.enableRow = this.enableRow.bind(this);
        this.disableRow = this.disableRow.bind(this);
        this.updateRow = this.updateRow.bind(this);

    }

    updateRow(idx) {
        const rows = [...this.state.rows]
        this.setState({
            procurementUnitId: this.state.rows[idx].procurementUnit.id,
            procurementUnitName: this.state.rows[idx].procurementUnit.label.label_en,
            skuCode: this.state.rows[idx].skuCode,
            vendorPrice: this.state.rows[idx].vendorPrice,
            approvedToShippedLeadTime: this.state.rows[idx].approvedToShippedLeadTime,
            gtin: this.state.rows[idx].gtin,
            procurementAgentProcurementUnitId: this.state.rows[idx].procurementAgentProcurementUnitId,
            isNew: false
        })
        rows.splice(idx, 1);
        this.setState({ rows });
    }

    enableRow(idx) {
        this.state.rows[idx].active = true;
        this.setState({ rows: this.state.rows })
    }

    disableRow(idx) {
        this.state.rows[idx].active = false;
        this.setState({ rows: this.state.rows })
    }
    addRow() {
        let addRow = true;
        if (addRow) {
            this.state.rows.map(item => {
                if (item.procurementUnit.id == this.state.procurementUnitId) {
                    addRow = false;
                }
            })
        }
        if (addRow == true) {
            var procurementAgentName = document.getElementById("procurementAgentId");
            var value = procurementAgentName.selectedIndex;
            var selectedProcurementAgentName = procurementAgentName.options[value].text;
            this.state.rows.push(
                {
                    procurementUnit: {
                        id: this.state.procurementUnitId,
                        label:
                        {
                            label_en: this.state.procurementUnitName
                        },
                    },
                    procurementAgent: {
                        id: this.state.procurementAgentId,
                        label:{
                            label_en:selectedProcurementAgentName
                        }
                    },
                    skuCode: this.state.skuCode,
                    vendorPrice: this.state.vendorPrice,
                    approvedToShippedLeadTime: this.state.approvedToShippedLeadTime,
                    gtin: this.state.gtin,
                    active: true,
                    isNew: this.state.isNew,
                    procurementAgentProcurementUnitId: this.state.procurementAgentProcurementUnitId
                })
            this.setState({ rows: this.state.rows, addRowMessage: '' })
        } else {
            this.state.addRowMessage = i18n.t('static.procurementAgentProcurementUnit.procurementUnitAlreadyExists')
        }
        this.setState({
            procurementUnitId: '',
            procurementUnitName: '',
            skuCode: '',
            vendorPrice: '',
            approvedToShippedLeadTime: '',
            gtin: '',
            procurementAgentProcurementUnitId: 0,
            isNew: true
        });

    }
    // deleteLastRow() {
    //     this.setState({
    //         rows: this.state.rows.slice(0, -1)
    //     });
    // }

    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    setTextAndValue = (event) => {
        if (event.target.name === 'skuCode') {
            this.setState({ skuCode: event.target.value });
        }
        if (event.target.name === 'vendorPrice') {
            this.setState({ vendorPrice: event.target.value });
        }
        if (event.target.name === 'approvedToShippedLeadTime') {
            this.setState({ approvedToShippedLeadTime: event.target.value });
        }
        if (event.target.name === 'gtin') {
            this.setState({ gtin: event.target.value });
        } else if (event.target.name === 'procurementUnitId') {
            this.setState({ procurementUnitName: event.target[event.target.selectedIndex].text });
            this.setState({ procurementUnitId: event.target.value })
        }
    };

    submitForm() {
        console.log("Rows on submit", this.state.rows)
        // var procurementAgentProcurementUnit = {
        //     procurementAgentId: this.state.procurementAgentId,
        //     procurementUnits: this.state.rows
        // }

        AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.addprocurementAgentProcurementUnitMapping(this.state.rows)
            .then(response => {
                if (response.status == "200") {
                    this.props.history.push(`/procurementAgent/listProcurementAgent/` + i18n.t(response.data.messageCode, { entityname }))
                } else {
                    this.setState({
                        message: response.data.message
                    })
                }

            }).catch(
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getProcurementAgentListAll().then(response => {
            console.log(response.data);
            if (response.status == "200") {
                this.setState({
                    procurementAgentList: response.data
                });
            } else {
                this.setState({
                    message: response.data.message
                })
            }

        }).catch(
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
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );
        AuthenticationService.setupAxiosInterceptors();
        ProcurementUnitService.getProcurementUnitListActive().then(response => {
            // console.log(response.data.data);
            if (response.status == 200) {
                this.setState({
                    procurementUnitList: response.data
                });
            } else {
                this.setState({
                    message: response.data.messageCode
                })
            }

        }).catch(
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
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );
    }
    render() {
        const { procurementUnitList } = this.state;
        let procurementUnits = procurementUnitList.length > 0 && procurementUnitList.map((item, i) => {
            return (
                <option key={i} value={item.procurementUnitId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        const { procurementAgentList } = this.state;
        let procurementAgents = procurementAgentList.length > 0 && procurementAgentList.map((item, i) => {
            return (
                <option key={i} value={item.procurementAgentId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <CardHeader>
                                <strong>{i18n.t('static.procurementAgentProcurementUnit.mapProcurementUnit')}</strong>
                            </CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.procurementagent.procurementagent')}</Label>
                                    <Input type="select" value={this.state.procurementAgentId} name="procurementAgentId" id="procurementAgentId" disabled>
                                        {procurementAgents}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.procurementUnit.procurementUnit')}</Label>
                                    <Input type="select" name="procurementUnitId" id="select" value={this.state.procurementUnitId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        {procurementUnits}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="skuCode">{i18n.t('static.procurementAgentProcurementUnit.skuCode')}</Label>
                                    <Input type="text" name="skuCode" id="skuCode" value={this.state.skuCode} placeholder={i18n.t('static.procurementAgentProcurementUnit.skuCodeText')} onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="vendorPrice">{i18n.t('static.procurementAgentProcurementUnit.vendorPrice')}</Label>
                                    <Input type="number" min="0" name="vendorPrice" id="vendorPrice" value={this.state.vendorPrice} placeholder={i18n.t('static.procurementAgentProcurementUnit.vendorPriceText')} onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="leadTime">{i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime')}</Label>
                                    <Input type="number" min="0" name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" value={this.state.approvedToShippedLeadTime} placeholder={i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTimeText')} onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="skuCode">{i18n.t('static.procurementAgentProcurementUnit.gtin')}</Label>
                                    <Input type="text" name="gtin" id="gtin" value={this.state.gtin} placeholder={i18n.t('static.procurementAgentProcurementUnit.gtinText')} onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    {/* <Button type="button" size="md" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button> */}
                                    <Button type="submit" size="md" color="success" onClick={this.addRow} className="float-right mr-1" ><i className="fa fa-check"></i> {i18n.t('static.common.add')}</Button>
                                    &nbsp;

                        </FormGroup>
                                <h5 className="red">{this.state.addRowMessage}</h5>
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th className="text-left">{i18n.t('static.procurementagent.procurementagent')}</th>
                                            <th className="text-left">{i18n.t('static.procurementUnit.procurementUnit')}</th>
                                            <th className="text-left">{i18n.t('static.procurementAgentProcurementUnit.skuCode')}</th>
                                            <th className="text-left">{i18n.t('static.procurementAgentProcurementUnit.vendorPrice')}</th>
                                            <th className="text-left">{i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime')}</th>
                                            <th className="text-left">{i18n.t('static.procurementAgentProcurementUnit.gtin')}</th>
                                            <th className="text-left">{i18n.t('static.common.status')}</th>
                                            <th className="text-left">{i18n.t('static.common.update')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    <td>
                                                        {this.state.rows[idx].procurementAgent.label.label_en}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].procurementUnit.label.label_en}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].skuCode}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].vendorPrice}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].approvedToShippedLeadTime}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].gtin}
                                                    </td>
                                                    <td>
                                                        {/* <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /> */}
                                                        <StatusUpdateButtonFeature removeRow={this.handleRemoveSpecificRow} enableRow={this.enableRow} disableRow={this.disableRow} rowId={idx} status={this.state.rows[idx].active} isRowNew={this.state.rows[idx].isNew} />
                                                    </td>
                                                    <td>
                                                        <UpdateButtonFeature updateRow={this.updateRow} rowId={idx} isRowNew={this.state.rows[idx].isNew} />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>

                                </Table>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                    &nbsp;
                                </FormGroup>

                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + i18n.t('static.message.cancelled', { entityname }))
    }
}