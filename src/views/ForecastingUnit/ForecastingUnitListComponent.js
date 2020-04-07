import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, CardHeader , FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col,Form} from 'reactstrap';
import ForecastingUnitService from '../../api/ForecastingUnitService';
//import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
//import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import ProductService from '../../api/ProductService';
import TracerCategoryService from '../../api/TracerCategoryService';


const entityname=i18n.t('static.forecastingunit.forecastingunit');
export default class ForecastingUnitListComponent extends Component {

    constructor(props) {
        super(props);
       
        this.state = {
            realms: [],
            productCategories:[],
            tracerCategories:[],
           forecastingUnitList: [],
            message: '',
            selSource: []
        }

        this.editForecastingUnit = this.editForecastingUnit.bind(this);
        this.addNewForecastingUnit = this.addNewForecastingUnit.bind(this);
        this.filterData = this.filterData.bind(this);
    }

    filterData() {
        let realmId = document.getElementById("realmId").value;
        let productCategoryId = document.getElementById("productCategoryId").value;
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;
        //alert(realmId+" "+productCategoryId+" "+tracerCategoryId)
        if (realmId != 0 && productCategoryId != 0 && tracerCategoryId != 0){
                    const selSource = this.state.forecastingUnitList.filter(c => c.realm.realmId == realmId &&  c.tracerCategory.tracerCategoryId == tracerCategoryId && c.productCategory.productCategoryId == productCategoryId  )
                    this.setState({
                        selSource
                    });
                } else if (realmId != 0 && productCategoryId != 0){
                    const selSource = this.state.forecastingUnitList.filter(c => c.realm.realmId == realmId &&  c.productCategory.productCategoryId == productCategoryId  )
                    this.setState({
                        selSource
                    });
                }  else  if (realmId != 0 &&  tracerCategoryId != 0){
                    const selSource = this.state.forecastingUnitList.filter(c => c.realm.realmId == realmId &&  c.tracerCategory.tracerCategoryId == tracerCategoryId   )
                    
                    this.setState({
                        selSource
                    });
                }else if ( productCategoryId != 0 && tracerCategoryId != 0){
                    const selSource = this.state.forecastingUnitList.filter(c =>   c.tracerCategory.tracerCategoryId == tracerCategoryId && c.productCategory.productCategoryId == productCategoryId  )
                    this.setState({
                        selSource
                    }); 
                } else if (realmId != 0 ){
                    const selSource = this.state.forecastingUnitList.filter(c => c.realm.realmId == realmId  )
                    this.setState({
                        selSource
                    });
                }  else if ( productCategoryId != 0){
                    const selSource = this.state.forecastingUnitList.filter(c =>   c.productCategory.productCategoryId == productCategoryId  )
                    this.setState({
                        selSource
                    });
                }  else if (tracerCategoryId != 0 ){
                    const selSource = this.state.forecastingUnitList.filter(c =>   c.tracerCategory.tracerCategoryId == tracerCategoryId  )
                    this.setState({
                        selSource
                    });
                }  else{
            this.setState({
                selSource: this.state.forecastingUnitList
            });
        }
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
        .then(response => {
            if (response.status == 200) {
                this.setState({
                    realms: response.data
                })
            } else {
                this.setState({ message: response.data.messageCode })
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
                            break;
                    }
                }
            }
        );
        TracerCategoryService.getTracerCategoryListAll()
        .then(response => {
            this.setState({
                tracerCategories: response.data
            })
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
        ProductService.getProductCategoryList()
        .then(response => {
            this.setState({
                productCategories: response.data
            })
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


   
        ForecastingUnitService.getForecastingUnitList().then(response => {
           this.setState({
               forecastingUnitList: response.data,
                selSource: response.data
            })
        })
            .catch(
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

    editForecastingUnit(forecastingUnit) {
        this.props.history.push({
            pathname: "/forecastingUnit/editForecastingUnit",
            state: { forecastingUnit: forecastingUnit }
        });

    }

    addNewForecastingUnit() {

        if (navigator.onLine) {
            this.props.history.push(`/forecastingUnit/addForecastingUnit`)
        } else {
            alert(i18n.t('static.common.online'))
        }
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
            const { tracerCategories } = this.state;
            let tracercategoryList = tracerCategories.length > 0
                && tracerCategories.map((item, i) => {
                    return (
                        <option key={i} value={item.tracerCategoryId}>
                            {item.label.label_en}
                        </option>
                    )
                }, this);
                const { productCategories } = this.state;
                let productCategoryList = productCategories.length > 0
                    && productCategories.map((item, i) => {
                        return (
                            <option key={i} value={item.productCategoryId}>
                                {item.label.label_en}
                            </option>
                        )
                    }, this);

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
            dataField: 'productCategory.label.label_en',
            text: i18n.t('static.productcategory.productcategory'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        },{
            dataField: 'tracerCategory.label.label_en',
            text: i18n.t('static.tracercategory.tracercategory'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        },{
            dataField: 'genericLabel.label_en',
            text: i18n.t('static.product.productgenericname'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        },{
            dataField: 'label.label_en',
            text: i18n.t('static.forecastingunit.forecastingunit'),
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
                        <i className="icon-menu"></i>{i18n.t('static.common.listEntity',{entityname})}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity',{entityname})} onClick={this.addNewForecastingUnit}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody>
                    <Form >
                    <Col md="3 pl-0">
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
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                       
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col md="3 pl-0">
                            <FormGroup>
                            <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="productCategoryId"
                                            id="productCategoryId"
                                            bsSize="sm"
                                        >
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {productCategoryList}
                                        </Input>
                                        
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col md="3 pl-0">
                            <FormGroup>
                            <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="tracerCategoryId"
                                            id="tracerCategoryId"
                                            bsSize="sm"
                                        >
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {tracercategoryList}
                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        </Form>
                    <ToolkitProvider
                            keyField="forecastingUnitId"
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
                                                    this.editForecastingUnit(row);
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