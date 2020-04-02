import React, { Component } from 'react';
import {
    Card, CardBody, CardHeader,
    CardFooter, Button, Col, Progress, FormGroup
} from 'reactstrap';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import * as JsStoreFunction from "../../CommonComponent/JsStoreFunctions.js"
import * as JsStoreFunctionCore from "../../CommonComponent/JsStoreFunctionsCore"
import moment from 'moment';
import MasterSyncService from '../../api/MasterSyncService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import i18next from 'i18next';
export default class SyncMasterData extends Component {

    constructor() {
        super();
        this.state = {
            totalMasters: 20,
            syncedMasters: 0,
            syncedPercentage: 0
        }
        this.syncMasters = this.syncMasters.bind(this);
        this.retryClicked = this.retryClicked.bind(this);
    }

    componentDidMount() {
        document.getElementById("retryButtonDiv").style.display = "none";
        this.syncMasters();
    }

    render() {
        return (
            <>
                <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                </div>
                <Col xs="12" sm="12">
                    <Card>
                        <CardHeader>
                            <strong>{i18n.t('static.masterDataSync.masterDataSync')}</strong>
                        </CardHeader>
                        <CardBody>
                            <div className="text-center">{this.state.syncedPercentage}% ({i18next.t('static.masterDataSync.synced')} {this.state.syncedMasters} {i18next.t('static.masterDataSync.of')} {this.state.totalMasters} {i18next.t('static.masterDataSync.masters')})</div>
                            <Progress value={this.state.syncedMasters} max={this.state.totalMasters} />
                        </CardBody>

                        <CardFooter id="retryButtonDiv">
                            <FormGroup>
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => this.retryClicked()}><i className="fa fa-refresh"></i> {i18n.t('static.common.retry')}</Button>
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </Col>
            </>
        )

    }


    syncMasters() {
        if (navigator.onLine) {
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                var realmId = AuthenticationService.getRealmId();
                db1 = e.target.result;
                var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                var updatedSyncDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                var lastSyncDateRequest = lastSyncDateTransaction.getAll();
                lastSyncDateRequest.onsuccess = function (event) {
                    var lastSyncDate = lastSyncDateRequest.result[0];
                    console.log("lastsyncDate",lastSyncDate);
                    var result = lastSyncDateRequest.result;
                    console.log("Result",result)
                    console.log("RealmId",realmId)
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].id == realmId) {
                            console.log("in if")
                            var lastSyncDateRealm = lastSyncDateRequest.result[i];
                            console.log("last sync date in realm",lastSyncDateRealm)
                        }
                        if(result[i].id==0){
                            var lastSyncDate = lastSyncDateRequest.result[i];
                            console.log("last sync date",lastSyncDate)
                        }
                    }
                    if (lastSyncDate == undefined) {
                        lastSyncDate = "2020-01-01 00:00:00";
                    } else {
                        lastSyncDate = lastSyncDate.lastSyncDate;
                    }
                    if (lastSyncDateRealm == undefined) {
                        lastSyncDateRealm = "2020-01-01 00:00:00";
                    } else {
                        lastSyncDateRealm = lastSyncDateRealm.lastSyncDate;
                    }
                    console.log("Last sync date above",lastSyncDateRealm)
                    AuthenticationService.setupAxiosInterceptors();
                    if (navigator.onLine) {
                        //Code to Sync Country list
                        MasterSyncService.getCountryListForSync(lastSyncDate)
                            .then(response => {
                                if (response.status == 200) {
                                    console.log("Response", response.data)
                                    var json = response.data;
                                    var countryTransaction = db1.transaction(['country'], 'readwrite');
                                    var countryObjectStore = countryTransaction.objectStore('country');
                                    for (var i = 0; i < json.length; i++) {
                                        countryObjectStore.put(json[i]);
                                    }
                                    this.setState({
                                        syncedMasters: this.state.syncedMasters + 1,
                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                    })
                                    if (navigator.onLine) {
                                        //Code to Sync Budget list
                                        console.log("Last sync date realm",lastSyncDateRealm)
                                        MasterSyncService.getBudgetListForSync(lastSyncDateRealm)
                                            .then(response => {
                                                if (response.status == 200) {
                                                    console.log("Response", response.data)
                                                    var json = response.data;
                                                    var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                                    var budgetObjectStore = budgetTransaction.objectStore('budget');
                                                    for (var i = 0; i < json.length; i++) {
                                                        budgetObjectStore.put(json[i]);
                                                    }
                                                    this.setState({
                                                        syncedMasters: this.state.syncedMasters + 1,
                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                    })
                                                    if (navigator.onLine) {
                                                        //Code to Sync Currency list
                                                        MasterSyncService.getCurrencyListForSync(lastSyncDate)
                                                            .then(response => {
                                                                if (response.status == 200) {
                                                                    console.log("Response", response.data)
                                                                    var json = response.data;
                                                                    var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                                                    var currencyObjectStore = currencyTransaction.objectStore('currency');
                                                                    for (var i = 0; i < json.length; i++) {
                                                                        currencyObjectStore.put(json[i]);
                                                                    }
                                                                    this.setState({
                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                    })
                                                                    if (navigator.onLine) {
                                                                        //Code to Sync DataSource list
                                                                        MasterSyncService.getDataSourceListForSync(lastSyncDateRealm)
                                                                            .then(response => {
                                                                                if (response.status == 200) {
                                                                                    console.log("Response", response.data)
                                                                                    var json = response.data;
                                                                                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                                                                    var dataSourceObjectStore = dataSourceTransaction.objectStore('dataSource');
                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                        dataSourceObjectStore.put(json[i]);
                                                                                    }
                                                                                    this.setState({
                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                    })
                                                                                    if (navigator.onLine) {
                                                                                        //Code to Sync DataSourceType list
                                                                                        MasterSyncService.getDataSourceTypeListForSync(lastSyncDateRealm)
                                                                                            .then(response => {
                                                                                                if (response.status == 200) {
                                                                                                    console.log("Response", response.data)
                                                                                                    var json = response.data;
                                                                                                    var dataSourceTypeTransaction = db1.transaction(['dataSourceType'], 'readwrite');
                                                                                                    var dataSourceTypeObjectStore = dataSourceTypeTransaction.objectStore('dataSourceType');
                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                        dataSourceTypeObjectStore.put(json[i]);
                                                                                                    }
                                                                                                    this.setState({
                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                    })
                                                                                                    if (navigator.onLine) {
                                                                                                        //Code to Sync Dimension list
                                                                                                        MasterSyncService.getDimensionListForSync(lastSyncDate)
                                                                                                            .then(response => {
                                                                                                                if (response.status == 200) {
                                                                                                                    console.log("Response", response.data)
                                                                                                                    var json = response.data;
                                                                                                                    var dimensionTransaction = db1.transaction(['dimension'], 'readwrite');
                                                                                                                    var dimensionObjectStore = dimensionTransaction.objectStore('dimension');
                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                        dimensionObjectStore.put(json[i]);
                                                                                                                    }
                                                                                                                    this.setState({
                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                    })
                                                                                                                    if (navigator.onLine) {
                                                                                                                        //Code to Sync FundingSource list
                                                                                                                        MasterSyncService.getFundingSourceListForSync(lastSyncDateRealm)
                                                                                                                            .then(response => {
                                                                                                                                if (response.status == 200) {
                                                                                                                                    console.log("Response", response.data)
                                                                                                                                    var json = response.data;
                                                                                                                                    var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                                                                                                                    var fundingSourceObjectStore = fundingSourceTransaction.objectStore('fundingSource');
                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                        fundingSourceObjectStore.put(json[i]);
                                                                                                                                    }
                                                                                                                                    this.setState({
                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                    })
                                                                                                                                    if (navigator.onLine) {
                                                                                                                                        //Code to Sync HealthArea list
                                                                                                                                        MasterSyncService.getHealthAreaListForSync(lastSyncDateRealm)
                                                                                                                                            .then(response => {
                                                                                                                                                if (response.status == 200) {
                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                    var json = response.data;
                                                                                                                                                    var healthAreaTransaction = db1.transaction(['healthArea'], 'readwrite');
                                                                                                                                                    var healthAreaObjectStore = healthAreaTransaction.objectStore('healthArea');
                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                        healthAreaObjectStore.put(json[i]);
                                                                                                                                                    }
                                                                                                                                                    this.setState({
                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                    })
                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                        //Code to Sync Organisation list
                                                                                                                                                        MasterSyncService.getOrganisationListForSync(lastSyncDateRealm)
                                                                                                                                                            .then(response => {
                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                    var json = response.data;
                                                                                                                                                                    var organisationTransaction = db1.transaction(['organisation'], 'readwrite');
                                                                                                                                                                    var organisationObjectStore = organisationTransaction.objectStore('organisation');
                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                        organisationObjectStore.put(json[i]);
                                                                                                                                                                    }
                                                                                                                                                                    this.setState({
                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                    })
                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                        //Code to Sync ProcurementAgent list
                                                                                                                                                                        MasterSyncService.getProcurementAgentListForSync(lastSyncDateRealm)
                                                                                                                                                                            .then(response => {
                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                    var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                                                                                                                                                                                    var procurementAgentObjectStore = procurementAgentTransaction.objectStore('procurementAgent');
                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                        procurementAgentObjectStore.put(json[i]);
                                                                                                                                                                                    }
                                                                                                                                                                                    this.setState({
                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                    })
                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                        //Code to Sync ProductCategory list
                                                                                                                                                                                        MasterSyncService.getProductCategoryListForSync(lastSyncDateRealm)
                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                    var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
                                                                                                                                                                                                    var productCategoryObjectStore = productCategoryTransaction.objectStore('productCategory');
                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                        productCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                    }
                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                    })
                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                        //Code to Sync Program list
                                                                                                                                                                                                        MasterSyncService.getProgramListForSync(lastSyncDateRealm)
                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                    var programTransaction = db1.transaction(['program'], 'readwrite');
                                                                                                                                                                                                                    var programObjectStore = programTransaction.objectStore('program');
                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                        programObjectStore.put(json[i]);
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                    })
                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                        //Code to Sync RealmCountry list
                                                                                                                                                                                                                        MasterSyncService.getRealmCountryListForSync(lastSyncDateRealm)
                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                                    var realmCountryTransaction = db1.transaction(['realmCountry'], 'readwrite');
                                                                                                                                                                                                                                    var realmCountryObjectStore = realmCountryTransaction.objectStore('realmCountry');
                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                        realmCountryObjectStore.put(json[i]);
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                        //Code to Sync Realm list
                                                                                                                                                                                                                                        MasterSyncService.getRealmListForSync(lastSyncDateRealm)
                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                                                    var realmTransaction = db1.transaction(['realm'], 'readwrite');
                                                                                                                                                                                                                                                    var realmObjectStore = realmTransaction.objectStore('realm');
                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                        realmObjectStore.put(json[i]);
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                        //Code to Sync Region list
                                                                                                                                                                                                                                                        MasterSyncService.getRegionListForSync(lastSyncDateRealm)
                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                                                                    var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                                                                                                                                                                                                                                    var regionObjectStore = regionTransaction.objectStore('region');
                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                        regionObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                        //Code to Sync SubFundingSource list
                                                                                                                                                                                                                                                                        MasterSyncService.getSubFundingSourceListForSync(lastSyncDateRealm)
                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                                                                                    var subFundingSourceTransaction = db1.transaction(['subFundingSource'], 'readwrite');
                                                                                                                                                                                                                                                                                    var subFundingSourceObjectStore = subFundingSourceTransaction.objectStore('subFundingSource');
                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                        subFundingSourceObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                                        //Code to Sync Supplier list
                                                                                                                                                                                                                                                                                        MasterSyncService.getSupplierListForSync(lastSyncDateRealm)
                                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                                                                                                    var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                                                                                                                                                                                                                                                                                                    var supplierObjectStore = supplierTransaction.objectStore('supplier');
                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                        supplierObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                                                        //Code to Sync TracerCategory list
                                                                                                                                                                                                                                                                                                        MasterSyncService.getTracerCategoryListForSync(lastSyncDateRealm)
                                                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                                                                                                                    var tracerCategoryTransaction = db1.transaction(['tracerCategory'], 'readwrite');
                                                                                                                                                                                                                                                                                                                    var tracerCategoryObjectStore = tracerCategoryTransaction.objectStore('tracerCategory');
                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                        tracerCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                                                                        //Code to Sync Unit list
                                                                                                                                                                                                                                                                                                                        MasterSyncService.getUnitListForSync(lastSyncDate)
                                                                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                                                                                                                                    var unitTransaction = db1.transaction(['unit'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                    var unitObjectStore = unitTransaction.objectStore('unit');
                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                        unitObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                                                                                        //Code to Sync Language list
                                                                                                                                                                                                                                                                                                                                        MasterSyncService.getLanguageListForSync(lastSyncDate)
                                                                                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                                                                                if (response.status == 200) {
                                                                                                                                                                                                                                                                                                                                                    console.log("Response", response.data)
                                                                                                                                                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                                                                                                                                                    var languageTransaction = db1.transaction(['language'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                    var languageObjectStore = languageTransaction.objectStore('language');
                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                        languageObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                                    if (this.state.syncedMasters === this.state.totalMasters) {
                                                                                                                                                                                                                                                                                                                                                        var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                        var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                                                                                                                                                                                                                                                                                                                                                        var updatedLastSyncDateJson = {
                                                                                                                                                                                                                                                                                                                                                            lastSyncDate: updatedSyncDate,
                                                                                                                                                                                                                                                                                                                                                            id: 0
                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                        var updateLastSyncDate = lastSyncDateTransaction.put(updatedLastSyncDateJson)
                                                                                                                                                                                                                                                                                                                                                        var updatedLastSyncDateJson1 = {
                                                                                                                                                                                                                                                                                                                                                            lastSyncDate: updatedSyncDate,
                                                                                                                                                                                                                                                                                                                                                            id: realmId
                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                        var updateLastSyncDate = lastSyncDateTransaction.put(updatedLastSyncDateJson1)
                                                                                                                                                                                                                                                                                                                                                        updateLastSyncDate.onsuccess = function (event) {
                                                                                                                                                                                                                                                                                                                                                            document.getElementById("retryButtonDiv").style.display = "none";
                                                                                                                                                                                                                                                                                                                                                            this.props.history.push(`/dashboard/` + i18n.t('static.masterDataSync.success'))
                                                                                                                                                                                                                                                                                                                                                        }.bind(this)
                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                            message: `static.masterDataSync.syncFailed`
                                                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                            });
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                                        })
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                                    })
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                            });
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                                        })
                                                                                                                                                                                                    }
                                                                                                                                                                                                } else {
                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                                    })
                                                                                                                                                                                                }
                                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                            });
                                                                                                                                                                                    } else {
                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                        this.setState({
                                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                                        })
                                                                                                                                                                                    }
                                                                                                                                                                                } else {
                                                                                                                                                                                    this.setState({
                                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                                    })
                                                                                                                                                                                }
                                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                            });
                                                                                                                                                                    } else {
                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                        this.setState({
                                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                                        })
                                                                                                                                                                    }
                                                                                                                                                                } else {
                                                                                                                                                                    this.setState({
                                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                                    })
                                                                                                                                                                }
                                                                                                                                                            }).catch(error => {
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
                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                            });
                                                                                                                                                    } else {
                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                        this.setState({
                                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                                        })
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    this.setState({
                                                                                                                                                        message: response.data.messageCode
                                                                                                                                                    })
                                                                                                                                                }
                                                                                                                                            }).catch(error => {
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
                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                            });
                                                                                                                                    } else {
                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                        this.setState({
                                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                                        })
                                                                                                                                    }
                                                                                                                                } else {
                                                                                                                                    this.setState({
                                                                                                                                        message: response.data.messageCode
                                                                                                                                    })
                                                                                                                                }
                                                                                                                            }).catch(error => {
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
                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                            });
                                                                                                                    } else {
                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                        this.setState({
                                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                                        })
                                                                                                                    }
                                                                                                                } else {
                                                                                                                    this.setState({
                                                                                                                        message: response.data.messageCode
                                                                                                                    })
                                                                                                                }
                                                                                                            }).catch(error => {
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
                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                            });
                                                                                                    } else {
                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                        this.setState({
                                                                                                            message: 'static.common.onlinealerttext'
                                                                                                        })
                                                                                                    }
                                                                                                } else {
                                                                                                    this.setState({
                                                                                                        message: response.data.messageCode
                                                                                                    })
                                                                                                }
                                                                                            }).catch(error => {
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
                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                            });
                                                                                    } else {
                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                        this.setState({
                                                                                            message: 'static.common.onlinealerttext'
                                                                                        })
                                                                                    }
                                                                                } else {
                                                                                    this.setState({
                                                                                        message: response.data.messageCode
                                                                                    })
                                                                                }
                                                                            }).catch(error => {
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
                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                            });
                                                                    } else {
                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                        this.setState({
                                                                            message: 'static.common.onlinealerttext'
                                                                        })
                                                                    }
                                                                } else {
                                                                    this.setState({
                                                                        message: response.data.messageCode
                                                                    })
                                                                }
                                                            }).catch(error => {
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
                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                            });
                                                    } else {
                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                        this.setState({
                                                            message: 'static.common.onlinealerttext'
                                                        })
                                                    }
                                                } else {
                                                    this.setState({
                                                        message: response.data.messageCode
                                                    })
                                                }
                                            }).catch(error => {
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
                                                document.getElementById("retryButtonDiv").style.display = "block";
                                            });
                                    } else {
                                        document.getElementById("retryButtonDiv").style.display = "block";
                                        this.setState({
                                            message: 'static.common.onlinealerttext'
                                        })
                                    }
                                } else {
                                    this.setState({
                                        message: response.data.messageCode
                                    })
                                }
                            }).catch(error => {
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
                                document.getElementById("retryButtonDiv").style.display = "block";
                            });
                    } else {
                        document.getElementById("retryButtonDiv").style.display = "block";
                        this.setState({
                            message: 'static.common.onlinealerttext'
                        })
                    }
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                message: 'static.common.onlinealerttext'
            })
        }
    }


    retryClicked() {
        this.setState({
            totalMasters: 20,
            syncedMasters: 0,
            syncedPercentage: 0,
            errorMessage: "",
            successMessage: ""
        })
        this.syncMasters();
    }
}