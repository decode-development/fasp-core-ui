import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness, TreeLevels } from 'basicprimitives';
import { DndProvider, DropTarget, DragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faEdit,faArrowsAlt } from '@fortawesome/free-solid-svg-icons'
import i18n from '../i18n'
// import { Col, Row, Card, Button, FormGroup, Label, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import TreeData from './TreeData';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, Modal, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import Provider from '../Samples/Provider'
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../views/Forms/ValidationForms/ValidationForms.css'
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import AuthenticationService from '../views/Common/AuthenticationService';
import AuthenticationServiceComponent from '../views/Common/AuthenticationServiceComponent';
import classnames from 'classnames';

const ItemTypes = {
    NODE: 'node'
}
let initialValues = {
    forecastMethod: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        forecastMethod: Yup.string()
            .required(i18n.t('static.user.validlanguage')),

    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

const Node = ({ itemConfig, isDragging, connectDragSource, canDrop, isOver, connectDropTarget }) => {
    const opacity = isDragging ? 0.4 : 1
    let itemTitleColor = Colors.RoyalBlue;
    if (isOver) {
        if (canDrop) {
            itemTitleColor = "green";
        } else {
            itemTitleColor = "red";
        }
    }

    return connectDropTarget(connectDragSource(
        <div className="ContactTemplate" style={{ opacity, backgroundColor: itemConfig.nodeBackgroundColor, borderColor: itemConfig.nodeBorderColor }}>
            <div className="ContactTitleBackground" style={{ backgroundColor: itemConfig.itemTitleColor }}>
                <div className="ContactTitle" style={{ color: itemConfig.titleTextColor }}><b>{itemConfig.title}</b></div>
            </div>
            <div className="ContactPhone" style={{ color: itemConfig.nodeValueColor, left: '2px', top: '31px', width: '95%', height: '36px' }}>{itemConfig.nodeValue}</div>

        </div>
    ))
}

const NodeDragSource = DragSource(
    ItemTypes.NODE,
    {
        beginDrag: ({ itemConfig }) => ({ id: itemConfig.id }),
        endDrag(props, monitor) {
            const { onMoveItem } = props;
            const item = monitor.getItem()
            const dropResult = monitor.getDropResult()
            if (dropResult) {
                onMoveItem(dropResult.id, item.id);
            }
        },
    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }),
)(Node);
const NodeDragDropSource = DropTarget(
    ItemTypes.NODE,
    {
        drop: ({ itemConfig }) => ({ id: itemConfig.id }),
        canDrop: ({ canDropItem, itemConfig }, monitor) => {
            const { id } = monitor.getItem();
            return canDropItem(itemConfig.id, id);
        },
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    }),
)(NodeDragSource);

export default class MorbidityScenarioOne extends Component {
    constructor() {
        super();

        this.onRemoveItem = this.onRemoveItem.bind(this);
        this.canDropItem = this.canDropItem.bind(this);
        this.onMoveItem = this.onMoveItem.bind(this);

        this.onAddButtonClick = this.onAddButtonClick.bind(this);
        this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);
        this.onHighlightChanged = this.onHighlightChanged.bind(this);
        this.onCursorChanged = this.onCursorChanged.bind(this);
        this.resetTree = this.resetTree.bind(this);

        this.dataChange = this.dataChange.bind(this);
        this.scenarioChange = this.scenarioChange.bind(this);
        this.nodeTypeChange = this.nodeTypeChange.bind(this);
        this.updateNodeInfoInJson = this.updateNodeInfoInJson.bind(this);

        this.addScenario = this.addScenario.bind(this);
        this.levelClicked = this.levelClicked.bind(this);
        this.deleteScenario = this.deleteScenario.bind(this);
        this.state = {
            displayParentData: false,
            displayPlanningUnit: false,
            displayUsage: false,
            openAddNodeModal: false,
            openAddScenarioModal: false,
            title: '',
            cursorItem: 0,
            highlightItem: 0,
            items: TreeData.morbidity_scenario_one,
            currentItemConfig: {},
            activeTab: 0,
            activeTab1: new Array(2).fill('1'),
            tabList: [
                {
                    scenarioId: 1,
                    scenarioName: 'High',
                    scenarioDesc: 'High',
                    active: true
                },
                {
                    scenarioId: 2,
                    scenarioName: 'Medium',
                    scenarioDesc: 'Medium',
                    active: true
                }
            ],
            scenario: {
                scenarioId: '',
                scenarioName: '',
                scenarioDesc: '',
                active: ''

            }
        }
    }

    levelClicked(i) {
        console.log("level onclick function called----" + i);
    }

    deleteScenario(scenarioId, scenarioName, index) {
        console.log("scenarioId---", scenarioId);
        confirmAlert({
            message: "Are you sure you want to delete the scenario - " + scenarioName,
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        let newArray = [...this.state.tabList];
                        newArray[index].active = false;
                        // var obj = newArray.filter(obj => {
                        //     return obj.scenarioId === scenarioId
                        // });
                        // console.log("obj---",obj);
                        // console.log("obj---",obj.active);
                        // var foundIndex = newArray.findIndex(x => x.scenarioId == obj.scenarioId);
                        // newArray[foundIndex] = obj;
                        this.setState({ tabList: newArray });
                        // this.setState({

                        // });
                        // this.props.history.push(`/logout/static.logoutSuccess`)
                    }
                },
                {
                    label: i18n.t('static.program.no')
                }
            ]
        });
    }

    addScenario() {
        const { tabList } = this.state;
        const { scenario } = this.state;
        var newTabObject = {
            scenarioId: parseInt(tabList.length) + 1,
            scenarioName: scenario.scenarioName,
            scenarioDesc: scenario.scenarioDesc,
            active: true
        };
        // console.log("tab data---", newTabObject);
        var tabList1 = [...tabList, newTabObject];
        // console.log("tabList---", tabList1)
        this.setState({
            tabList: [...tabList, newTabObject],
            activeTab: parseInt(tabList.length),
            openAddScenarioModal: false
        }, () => {
            console.log("final tab list---", this.state);
        });
    }
    // toggle(tabPane, tab) {
    //     const newArray = this.state.activeTab.slice()
    //     newArray[tabPane] = tab
    //     this.setState({
    //         activeTab: newArray,
    //     });
    // }

    toggle(e, tab) {
        console.log("event type---", e.button);
        if (this.state.activeTab !== tab.i) {
            this.setState({
                activeTab: tab.i
            });
        }
    }

    toggleModal(tabPane, tab) {
        const newArray = this.state.activeTab1.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab1: newArray,
        });
    }

    resetTree() {
        this.setState({ items: TreeData.morbidity_scenario_one });
    }
    dataChange(event) {
        // alert("hi");
        let { currentItemConfig } = this.state;
        if (event.target.name === "nodeTitle") {
            currentItemConfig.title = event.target.value;
        }
        if (event.target.name === "nodeValueType") {
            currentItemConfig.valueType = event.target.value;
        }
        this.setState({ currentItemConfig: currentItemConfig });
    }

    scenarioChange(event) {
        let { scenario } = this.state;
        if (event.target.name === "scenarioName") {
            scenario.scenarioName = event.target.value;
        }
        if (event.target.name === "scenarioDesc") {
            scenario.scenarioDesc = event.target.value;
        }
        this.setState({ scenario });
    }

    nodeTypeChange(event) {
        var nodeTypeId = event.target.value;
        console.log("node type value---", nodeTypeId)
        if (nodeTypeId == 1) {

        } else if (nodeTypeId == 2) {
            console.log("case 2")
            this.setState({
                displayParentData: true
            });
        }
        else if (nodeTypeId == 3) {
            this.setState({
                displayUsage: true
            });
        }
        else if (nodeTypeId == 4) {
            this.setState({
                displayPlanningUnit: true
            });
        }
        // switch (nodeTypeId) {
        //     case 1:
        //         break;
        //     case 2:
        //         console.log("case 2")
        //         this.setState({
        //             displayParentData: true
        //         });
        //         break;
        //     case 3:
        //         this.setState({
        //             displayUsage: true
        //         });
        //         break;
        //     case 4:
        //         this.setState({
        //             displayPlanningUnit: true
        //         });
        //         break;
        //     default:
        //         console.log()
        // }
    }
    onAddButtonClick(itemConfig) {

        this.setState({ openAddNodeModal: true });

        // const { items } = this.state;
        // var newItem = {
        //     id: parseInt(items.length + 1),
        //     parent: itemConfig.id,
        //     title: "New Title",
        //     description: "New Description",
        //     itemTitleColor: Colors.White,
        //     titleTextColor: Colors.Black,
        //     nodeBackgroundColor: Colors.White,
        //     borderColor: Colors.Black,
        //     // image: "/react/photos/z.png"
        // };

        // this.setState({
        //     items: [...items, newItem],
        //     cursorItem: newItem.id
        // });
    }
    onRemoveButtonClick(itemConfig) {
        const { items } = this.state;

        this.setState(this.getDeletedItems(items, [itemConfig.id]));
    }
    onMoveItem(parentid, itemid) {
        const { items } = this.state;

        this.setState({
            cursorItem: itemid,
            items: (items.map(item => {
                if (item.id === itemid) {
                    return {
                        ...item,
                        parent: parentid
                    }
                }
                return item;
            }))
        })
    }
    canDropItem(parentid, itemid) {
        const { items } = this.state;
        const tree = this.getTree(items);
        let result = parentid !== itemid;
        tree.loopParents(this, parentid, function (id, node) {
            if (id === itemid) {
                result = false;
                return true;
            }
        });
        return result;
    }
    onRemoveItem(id) {
        const { items } = this.state;

        this.setState(this.getDeletedItems(items, [id]));
    }
    getDeletedItems(items = [], deletedItems = []) {
        const tree = this.getTree(items);
        const hash = deletedItems.reduce((agg, itemid) => {
            agg.add(itemid.toString());
            return agg;
        }, new Set());
        const cursorParent = this.getDeletedItemsParent(tree, deletedItems, hash);
        const result = [];
        tree.loopLevels(this, (nodeid, node) => {
            if (hash.has(nodeid.toString())) {
                return tree.SKIP;
            }
            result.push(node);
        });

        return {
            items: result,
            cursorItem: cursorParent
        };
    }
    getDeletedItemsParent(tree, deletedItems, deletedHash) {
        let result = null;
        const lca = LCA(tree);
        result = deletedItems.reduce((agg, itemid) => {
            if (agg == null) {
                agg = itemid;
            } else {
                agg = lca.getLowestCommonAncestor(agg, itemid);
            }
            return agg;
        }, null);

        if (deletedHash.has(result.toString())) {
            result = tree.parentid(result);
        }
        return result;
    }

    getTree(items = []) {
        const tree = Tree();

        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];
            tree.add(item.parent, item.id, item);
        }

        return tree;
    }

    onHighlightChanged(event, data) {
        const { context: item } = data;
        const { config } = this.state;
        // console.log("data1---", item.title);
        // console.log("data2---", item.id);
        // item.id
        if (item != null) {

            this.setState({
                title: item.title,
                config: {
                    ...config,
                    // highlightItem: item.id,
                    // cursorItem: item.id
                },
                highlightItem: item.id,
                cursorItem: item.id
            }, () => {
                console.log("highlighted item---", this.state)
            })
        }
    };
    onCursorChanged(event, data) {
        const { context: item } = data;
        const { config } = this.state;
        console.log("Node clicked-------------------");
        // console.log("data2---", item.id);
        // item.id
        this.setState({ openAddNodeModal: true })
        if (item != null) {

            this.setState({
                title: item.title,
                config: {
                    ...config,
                    // highlightItem: item.id,
                    // cursorItem: item.id
                },
                highlightItem: item.id,
                cursorItem: item.id
            }, () => {
                console.log("highlighted item---", this.state)
            })
        }
    };

    updateNodeInfoInJson(currentItemConfig) {
        var nodes = this.state.items;
        var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.id);
        nodes[findNodeIndex].title = currentItemConfig.title;
        nodes[findNodeIndex].valueType = currentItemConfig.valueType;
        this.setState({
            items: nodes,
            openAddNodeModal: false,
        }, () => {
            console.log("updated tree data+++", this.state);
        });
    }

    tabPane() {
        let treeLevel = this.state.items.length;
        const treeLevelItems = []
        for (var i = 0; i <= treeLevel; i++) {
            if (i == 0) {
                treeLevelItems.push({
                    annotationType: AnnotationType.Level,
                    levels: [0],
                    title: "Level 0",
                    titleColor: Colors.RoyalBlue,
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0,
                    borderColor: Colors.Gray,
                    fillColor: Colors.Gray,
                    lineType: LineType.Dotted,
                    // onclick: this.levelClicked(i)
                });
            }
            else if (i % 2 == 0) {
                treeLevelItems.push(new LevelAnnotationConfig({
                    levels: [i],
                    title: "Level " + i,
                    titleColor: Colors.RoyalBlue,
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0,
                    borderColor: Colors.Gray,
                    fillColor: Colors.Gray,
                    lineType: LineType.Solid,
                    // onclick: this.levelClicked(i)
                })
                );
            }
            else {
                treeLevelItems.push(new LevelAnnotationConfig({
                    levels: [i],
                    title: "Level " + i,
                    titleColor: Colors.RoyalBlue,
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0.08,
                    borderColor: Colors.Gray,
                    fillColor: Colors.Gray,
                    lineType: LineType.Dotted,
                    // onclick: this.levelClicked(i)
                }));
            }
            // treeLevelItems[i].addEventListener("click", function () {
            //     /* Do your stuffs here */
            //     console.log("level clicked---------------");
            // });
            // treeLevelItems[i].onclick = function () { console.log("anchal-----------------"); };
            console.log("level json***");
        }
        const config = {
            ...this.state,
            // pageFitMode: PageFitMode.Enabled,
            pageFitMode: PageFitMode.None,
            // highlightItem: 0,
            hasSelectorCheckbox: Enabled.False,
            hasButtons: Enabled.True,
            buttonsPanelSize: 40,
            onButtonsRender: (({ context: itemConfig }) => {
                return <>  <button key="1" className="StyledButton" style={{ width: '23px', height: '23px' }}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.onAddButtonClick(itemConfig);
                    }}>
                    <FontAwesomeIcon icon={faPlus} />
                </button>
                    <button key="2" className="StyledButton" style={{ width: '23px', height: '23px' }}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button key="2" className="StyledButton" style={{ width: '23px', height: '23px' }}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}>
                        <FontAwesomeIcon icon={faArrowsAlt} />
                    </button>
                    {itemConfig.parent != null &&
                        <button key="3" className="StyledButton" style={{ width: '23px', height: '23px' }}
                            onClick={(event) => {
                                event.stopPropagation();
                                confirmAlert({
                                    message: "Are you sure you want to delete this node.",
                                    buttons: [
                                        {
                                            label: i18n.t('static.program.yes'),
                                            onClick: () => {
                                                this.onRemoveButtonClick(itemConfig);
                                            }
                                        },
                                        {
                                            label: i18n.t('static.program.no')
                                        }
                                    ]
                                });
                            }}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>}

                </>
            }),
            orientationType: OrientationType.Top,
            defaultTemplateName: "contactTemplate",
            // itemTitleFirstFontColor: Colors.White,
            linesColor: Colors.Black,
            annotations: treeLevelItems,
            templates: [{
                name: "contactTemplate",
                itemSize: { width: 175, height: 75 },
                minimizedItemSize: { width: 2, height: 2 },
                highlightPadding: { left: 1, top: 1, right: 1, bottom: 1 },
                onItemRender: ({ context: itemConfig }) => {
                    return <NodeDragDropSource
                        itemConfig={itemConfig}
                        onRemoveItem={this.onRemoveItem}
                        canDropItem={this.canDropItem}
                        onMoveItem={this.onMoveItem}
                    />;
                }
            }]
        }

        return (
            <>
                {this.state.tabList.map(function (data, i) {
                    return (
                        <TabPane tabId={i} key={i}>
                            <div class="sample">
                                <Provider>
                                    <div className="placeholder"
                                        style={{ clear: 'both' }}
                                    >
                                        <OrgDiagram centerOnCursor={true} config={config}
                                        // onCursorChanged={(e)=>{this.onCursorChanged}}
                                        />
                                    </div>
                                </Provider>

                            </div>
                            {/* </Row> */}
                        </TabPane>
                    )
                })}

            </>
        );
    }

    tabPane1() {
        return (
            <>
                <TabPane tabId="1">
                    <FormGroup>
                        <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            name="nodeTitle"
                            onChange={(e) => { this.dataChange(e) }}
                            value={this.state.currentItemConfig.title}></Input>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span></Label>
                        <Input
                            type="select"
                            name="nodeTypeId"
                            bsSize="sm"
                            onChange={(e) => { this.nodeTypeChange(e) }}
                            required
                            value={this.state.currentItemConfig.valueType}
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Top Node</option>
                            <option value="2">Data Node</option>
                            <option value="3">Usage Node</option>
                            <option value="4">Planning Unit Node</option>
                        </Input>
                    </FormGroup>
                    {this.state.displayUsage &&
                        <FormGroup>
                            <Label htmlFor="currencyId">Usage<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeValueType"
                                bsSize="sm"
                                onChange={(e) => { this.dataChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">Condoms</option>
                            </Input>
                        </FormGroup>
                    }
                    {this.state.displayPlanningUnit &&
                        <FormGroup>
                            <Label htmlFor="currencyId">Planning Unit<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeValueType"
                                bsSize="sm"
                                onChange={(e) => { this.dataChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">No logo condoms pack of 500</option>
                            </Input>
                        </FormGroup>
                    }
                    <FormGroup>
                        <Label htmlFor="currencyId">Month<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            name="nodeTitle"
                            onChange={(e) => { this.dataChange(e) }}
                            value={this.state.currentItemConfig.title}></Input>
                    </FormGroup>
                    {this.state.displayParentData &&
                        <>
                            <FormGroup>
                                <Label htmlFor="currencyId">Parent<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="nodeTitle"
                                    readOnly={true}
                                    onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.currentItemConfig.title}></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">Parent Value<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="nodeTitle"
                                    readOnly={true}
                                    onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.currentItemConfig.title}></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">Percentage Of Parent<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="nodeTitle"
                                    onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.currentItemConfig.title}></Input>
                            </FormGroup></>}
                    <FormGroup>
                        <Label htmlFor="currencyId">Node Value<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            name="nodeTitle"
                            onChange={(e) => { this.dataChange(e) }}
                            value={this.state.currentItemConfig.title}></Input>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="currencyId">Notes<span class="red Reqasterisk">*</span></Label>
                        <Input type="textarea"
                            name="nodeTitle"
                            onChange={(e) => { this.dataChange(e) }}
                            value={this.state.currentItemConfig.title}></Input>
                    </FormGroup>
                </TabPane>
                <TabPane tabId="2">

                </TabPane>

            </>
        );
    }
    render() {
        // console.log("this.state+++", this.state);


        return <div className="animated fadeIn">
            <Row>
                <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                    <Card className="mb-lg-0 mt-lg-2">
                        <CardBody className="pt-lg-2">
                            <div className="container-fuild">
                                <div>
                                    <Formik
                                        enableReinitialize={true}
                                        initialValues={initialValues}
                                        validate={validate(validationSchema)}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {


                                        }}
                                        render={
                                            ({
                                                values,
                                                errors,
                                                touched,
                                                handleChange,
                                                handleBlur,
                                                handleSubmit,
                                                isSubmitting,
                                                isValid,
                                                setTouched,
                                                handleReset,
                                                setFieldValue,
                                                setFieldTouched
                                            }) => (
                                                <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='userForm' autocomplete="off">
                                                    <CardBody className="pt-0 pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                        <div className="col-md-12 pl-lg-0">
                                                            <Row>
                                                                {/* <FormGroup className=""> */}
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Forecast Method'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="languageId"
                                                                        id="languageId"
                                                                        bsSize="sm"
                                                                        // valid={!errors.languageId && this.state.user.language.languageId != ''}
                                                                        // invalid={touched.languageId && !!errors.languageId}
                                                                        // onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        // onBlur={handleBlur}
                                                                        required
                                                                    // value={this.state.user.language.languageId}
                                                                    >
                                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                                    </Input>
                                                                    {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                                </FormGroup>
                                                                {/* </FormGroup> */}
                                                                {/* <FormGroup className="pl-3"> */}
                                                                <FormGroup className="col-md-3">
                                                                    <Label htmlFor="languageId">{'Tree Name'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="languageId"
                                                                        id="languageId"
                                                                        bsSize="sm"
                                                                        // valid={!errors.languageId && this.state.user.language.languageId != ''}
                                                                        // invalid={touched.languageId && !!errors.languageId}
                                                                        // onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        // onBlur={handleBlur}
                                                                        required
                                                                    // value={this.state.user.language.languageId}
                                                                    >
                                                                    </Input>
                                                                    {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                                </FormGroup>
                                                                {/* </FormGroup> */}
                                                                {/* <FormGroup className="pl-3"> */}

                                                                {/* </FormGroup> */}
                                                            </Row>
                                                        </div>
                                                    </CardBody>
                                                </Form>
                                            )} />
                                </div>
                                <Row>
                                    <Col xs="12" md="12" className="mb-4">
                                        <Nav tabs>

                                            {this.state.tabList.filter(c => c.active == true).map((data, i) =>
                                                // data.active &&
                                                <NavItem>
                                                    <NavLink
                                                        active={this.state.activeTab === i}
                                                        onClick={(e) => { this.toggle(e, { i }); }}
                                                        key={i}
                                                        onDoubleClick={() => {
                                                            let scenario = this.state.tabList.find(x => x.scenarioId === data.scenarioId);
                                                            this.setState({
                                                                openAddScenarioModal: true,
                                                                scenario
                                                            })
                                                        }}
                                                    >
                                                        {data.scenarioName}   <i className="fa fa-trash" onClick={(e) => { this.deleteScenario(data.scenarioId, data.scenarioName, i) }}></i>
                                                    </NavLink>
                                                </NavItem>

                                            )}

                                            <NavItem>
                                                <Button type="submit" size="md" color="success" className="float-right ml-4 mb-1" style={{ padding: '5px 20px 5px 20px' }} onClick={() => this.setState({ openAddScenarioModal: true })}><i className="fa fa-plus"></i> Add Scenario</Button>
                                            </NavItem>
                                        </Nav>
                                        <TabContent activeTab={this.state.activeTab}>
                                            {this.tabPane()}
                                        </TabContent>
                                    </Col>
                                </Row>

                            </div>
                        </CardBody>
                        <CardFooter>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => { console.log("tree json ---", this.state.items) }}><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                            <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                        </CardFooter>
                    </Card></Col></Row>
            {/* Scenario Modal start------------------- */}
            <Modal isOpen={this.state.openAddScenarioModal}
                className={'modal-md '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Add/Edit Scenario</strong>
                    <Button size="md" onClick={() => this.setState({ openAddScenarioModal: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label htmlFor="currencyId">Scenario Name<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            id="scenarioName"
                            name="scenarioName"
                            onChange={(e) => { this.scenarioChange(e) }}
                            value={this.state.scenario.scenarioName}></Input>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currencyId">Scenario Description<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            id="scenarioDesc"
                            name="scenarioDesc"
                            onChange={(e) => { this.scenarioChange(e) }}
                            value={this.state.scenario.scenarioDesc}></Input>
                    </FormGroup>

                </ModalBody>
                <ModalFooter>
                    <Button type="submit" size="md" onClick={(e) => { this.addScenario() }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddScenarioModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
            {/* Modal end------------------------ */}
            {/* Modal start------------------- */}
            <Modal isOpen={this.state.openAddNodeModal}
                className={'modal-md '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Add/Edit Node</strong>
                    <Button size="md" onClick={() => this.setState({ openAddNodeModal: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col xs="12" md="12" className="mb-4">
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab1[0] === '1'}
                                        onClick={() => { this.toggleModal(0, '1'); }}
                                    >
                                        Node Data
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab1[0] === '2'}
                                        onClick={() => { this.toggleModal(0, '2'); }}
                                    >
                                        Scaling/Transfer
                                    </NavLink>
                                </NavItem>

                            </Nav>
                            <TabContent activeTab={this.state.activeTab1[0]}>
                                {this.tabPane1()}
                            </TabContent>
                        </Col>
                    </Row>

                </ModalBody>
                <ModalFooter>
                    <Button type="submit" size="md" onClick={(e) => { this.updateNodeInfoInJson(this.state.currentItemConfig) }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
            {/* Scenario Modal end------------------------ */}

        </div>

    }
}