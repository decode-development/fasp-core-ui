(this["webpackJsonp@coreui/coreui-pro-react-admin-template"]=this["webpackJsonp@coreui/coreui-pro-react-admin-template"]||[]).push([[34],{492:function(e,t,a){"use strict";var n=a(18),r=a(49),s=a(2),o=a.n(s),c=a(61),l=a.n(c),i=a(487),u=a.n(i),d=a(488),m=l.a.oneOfType([l.a.number,l.a.string]),p=l.a.oneOfType([l.a.bool,l.a.number,l.a.string,l.a.shape({size:l.a.oneOfType([l.a.bool,l.a.number,l.a.string]),order:m,offset:m})]),f={tag:d.q,xs:p,sm:p,md:p,lg:p,xl:p,className:l.a.string,cssModule:l.a.object,widths:l.a.array},b={tag:"div",widths:["xs","sm","md","lg","xl"]},g=function(e,t,a){return!0===a||""===a?e?"col":"col-"+t:"auto"===a?e?"col-auto":"col-"+t+"-auto":e?"col-"+a:"col-"+t+"-"+a},h=function(e){var t=e.className,a=e.cssModule,s=e.widths,c=e.tag,l=Object(r.a)(e,["className","cssModule","widths","tag"]),i=[];s.forEach((function(t,n){var r=e[t];if(delete l[t],r||""===r){var s=!n;if(Object(d.k)(r)){var o,c=s?"-":"-"+t+"-",m=g(s,t,r.size);i.push(Object(d.m)(u()(((o={})[m]=r.size||""===r.size,o["order"+c+r.order]=r.order||0===r.order,o["offset"+c+r.offset]=r.offset||0===r.offset,o)),a))}else{var p=g(s,t,r);i.push(p)}}})),i.length||i.push("col");var m=Object(d.m)(u()(t,i),a);return o.a.createElement(c,Object(n.a)({},l,{className:m}))};h.propTypes=f,h.defaultProps=b,t.a=h},506:function(e,t,a){"use strict";var n=a(18),r=a(49),s=a(491),o=a(37),c=a(2),l=a.n(c),i=a(61),u=a.n(i),d=a(487),m=a.n(d),p=a(488),f={active:u.a.bool,"aria-label":u.a.string,block:u.a.bool,color:u.a.string,disabled:u.a.bool,outline:u.a.bool,tag:p.q,innerRef:u.a.oneOfType([u.a.object,u.a.func,u.a.string]),onClick:u.a.func,size:u.a.string,children:u.a.node,className:u.a.string,cssModule:u.a.object,close:u.a.bool},b=function(e){function t(t){var a;return(a=e.call(this,t)||this).onClick=a.onClick.bind(Object(s.a)(a)),a}Object(o.a)(t,e);var a=t.prototype;return a.onClick=function(e){this.props.disabled?e.preventDefault():this.props.onClick&&this.props.onClick(e)},a.render=function(){var e=this.props,t=e.active,a=e["aria-label"],s=e.block,o=e.className,c=e.close,i=e.cssModule,u=e.color,d=e.outline,f=e.size,b=e.tag,g=e.innerRef,h=Object(r.a)(e,["active","aria-label","block","className","close","cssModule","color","outline","size","tag","innerRef"]);c&&"undefined"===typeof h.children&&(h.children=l.a.createElement("span",{"aria-hidden":!0},"\xd7"));var v="btn"+(d?"-outline":"")+"-"+u,j=Object(p.m)(m()(o,{close:c},c||"btn",c||v,!!f&&"btn-"+f,!!s&&"btn-block",{active:t,disabled:this.props.disabled}),i);h.href&&"button"===b&&(b="a");var y=c?"Close":null;return l.a.createElement(b,Object(n.a)({type:"button"===b&&h.onClick?"button":void 0},h,{className:j,ref:g,onClick:this.onClick,"aria-label":a||y}))},t}(l.a.Component);b.propTypes=f,b.defaultProps={color:"secondary",tag:"button"},t.a=b},523:function(e,t,a){"use strict";var n=a(18),r=a(49),s=a(2),o=a.n(s),c=a(61),l=a.n(c),i=a(487),u=a.n(i),d=a(488),m={tag:d.q,className:l.a.string,cssModule:l.a.object},p=function(e){var t=e.className,a=e.cssModule,s=e.tag,c=Object(r.a)(e,["className","cssModule","tag"]),l=Object(d.m)(u()(t,"input-group-text"),a);return o.a.createElement(s,Object(n.a)({},c,{className:l}))};p.propTypes=m,p.defaultProps={tag:"span"},t.a=p},545:function(e,t,a){"use strict";var n=a(18),r=a(49),s=a(491),o=a(37),c=a(2),l=a.n(c),i=a(61),u=a.n(i),d=a(487),m=a.n(d),p=a(488),f={children:u.a.node,type:u.a.string,size:u.a.string,bsSize:u.a.string,valid:u.a.bool,invalid:u.a.bool,tag:p.q,innerRef:u.a.oneOfType([u.a.object,u.a.func,u.a.string]),plaintext:u.a.bool,addon:u.a.bool,className:u.a.string,cssModule:u.a.object},b=function(e){function t(t){var a;return(a=e.call(this,t)||this).getRef=a.getRef.bind(Object(s.a)(a)),a.focus=a.focus.bind(Object(s.a)(a)),a}Object(o.a)(t,e);var a=t.prototype;return a.getRef=function(e){this.props.innerRef&&this.props.innerRef(e),this.ref=e},a.focus=function(){this.ref&&this.ref.focus()},a.render=function(){var e=this.props,t=e.className,a=e.cssModule,s=e.type,o=e.bsSize,c=e.valid,i=e.invalid,u=e.tag,d=e.addon,f=e.plaintext,b=e.innerRef,g=Object(r.a)(e,["className","cssModule","type","bsSize","valid","invalid","tag","addon","plaintext","innerRef"]),h=["radio","checkbox"].indexOf(s)>-1,v=new RegExp("\\D","g"),j=u||("select"===s||"textarea"===s?s:"input"),y="form-control";f?(y+="-plaintext",j=u||"input"):"file"===s?y+="-file":h&&(y=d?null:"form-check-input"),g.size&&v.test(g.size)&&(Object(p.t)('Please use the prop "bsSize" instead of the "size" to bootstrap\'s input sizing.'),o=g.size,delete g.size);var O=Object(p.m)(m()(t,i&&"is-invalid",c&&"is-valid",!!o&&"form-control-"+o,y),a);return("input"===j||u&&"function"===typeof u)&&(g.type=s),g.children&&!f&&"select"!==s&&"string"===typeof j&&"select"!==j&&(Object(p.t)('Input with a type of "'+s+'" cannot have children. Please use "value"/"defaultValue" instead.'),delete g.children),l.a.createElement(j,Object(n.a)({},g,{ref:b,className:O}))},t}(l.a.Component);b.propTypes=f,b.defaultProps={type:"text"},t.a=b},575:function(e,t,a){"use strict";var n=a(18),r=a(49),s=a(2),o=a.n(s),c=a(61),l=a.n(c),i=a(487),u=a.n(i),d=a(488),m={children:l.a.node,row:l.a.bool,check:l.a.bool,inline:l.a.bool,disabled:l.a.bool,tag:d.q,className:l.a.string,cssModule:l.a.object},p=function(e){var t=e.className,a=e.cssModule,s=e.row,c=e.disabled,l=e.check,i=e.inline,m=e.tag,p=Object(r.a)(e,["className","cssModule","row","disabled","check","inline","tag"]),f=Object(d.m)(u()(t,!!s&&"row",l?"form-check":"form-group",!(!l||!i)&&"form-check-inline",!(!l||!c)&&"disabled"),a);return"fieldset"===m&&(p.disabled=c),o.a.createElement(m,Object(n.a)({},p,{className:f}))};p.propTypes=m,p.defaultProps={tag:"div"},t.a=p},577:function(e,t,a){"use strict";var n=a(151),r=a(152),s=a(499),o=a.n(s),c=a(494),l=function(){function e(){Object(n.a)(this,e)}return Object(r.a)(e,[{key:"addRealm",value:function(e){return console.log(e),o.a.post("".concat(c.a,"/api/realm/"),e,{})}},{key:"getRealmListAll",value:function(){return o.a.get("".concat(c.a,"/api/realm/"),{})}},{key:"updateRealm",value:function(e){return o.a.put("".concat(c.a,"/api/realm/"),e,{})}}]),e}();t.a=new l},582:function(e,t,a){"use strict";var n=a(18),r=a(49),s=a(2),o=a.n(s),c=a(61),l=a.n(c),i=a(487),u=a.n(i),d=a(488),m={tag:d.q,size:l.a.string,className:l.a.string,cssModule:l.a.object},p=function(e){var t=e.className,a=e.cssModule,s=e.tag,c=e.size,l=Object(r.a)(e,["className","cssModule","tag","size"]),i=Object(d.m)(u()(t,"input-group",c?"input-group-"+c:null),a);return o.a.createElement(s,Object(n.a)({},l,{className:i}))};p.propTypes=m,p.defaultProps={tag:"div"},t.a=p},583:function(e,t,a){"use strict";var n=a(18),r=a(49),s=a(2),o=a.n(s),c=a(61),l=a.n(c),i=a(487),u=a.n(i),d=a(488),m=a(523),p={tag:d.q,addonType:l.a.oneOf(["prepend","append"]).isRequired,children:l.a.node,className:l.a.string,cssModule:l.a.object},f=function(e){var t=e.className,a=e.cssModule,s=e.tag,c=e.addonType,l=e.children,i=Object(r.a)(e,["className","cssModule","tag","addonType","children"]),p=Object(d.m)(u()(t,"input-group-"+c),a);return"string"===typeof l?o.a.createElement(s,Object(n.a)({},i,{className:p}),o.a.createElement(m.a,{children:l})):o.a.createElement(s,Object(n.a)({},i,{className:p,children:l}))};f.propTypes=p,f.defaultProps={tag:"div"},t.a=f},615:function(e,t,a){"use strict";var n=a(18),r=a(49),s=a(2),o=a.n(s),c=a(61),l=a.n(c),i=a(487),u=a.n(i),d=a(488),m=l.a.oneOfType([l.a.number,l.a.string]),p=l.a.oneOfType([l.a.string,l.a.number,l.a.shape({size:m,order:m,offset:m})]),f={children:l.a.node,hidden:l.a.bool,check:l.a.bool,size:l.a.string,for:l.a.string,tag:d.q,className:l.a.string,cssModule:l.a.object,xs:p,sm:p,md:p,lg:p,xl:p,widths:l.a.array},b={tag:"label",widths:["xs","sm","md","lg","xl"]},g=function(e,t,a){return!0===a||""===a?e?"col":"col-"+t:"auto"===a?e?"col-auto":"col-"+t+"-auto":e?"col-"+a:"col-"+t+"-"+a},h=function(e){var t=e.className,a=e.cssModule,s=e.hidden,c=e.widths,l=e.tag,i=e.check,m=e.size,p=e.for,f=Object(r.a)(e,["className","cssModule","hidden","widths","tag","check","size","for"]),b=[];c.forEach((function(t,n){var r=e[t];if(delete f[t],r||""===r){var s,o=!n;if(Object(d.k)(r)){var c,l=o?"-":"-"+t+"-";s=g(o,t,r.size),b.push(Object(d.m)(u()(((c={})[s]=r.size||""===r.size,c["order"+l+r.order]=r.order||0===r.order,c["offset"+l+r.offset]=r.offset||0===r.offset,c))),a)}else s=g(o,t,r),b.push(s)}}));var h=Object(d.m)(u()(t,!!s&&"sr-only",!!i&&"form-check-label",!!m&&"col-form-label-"+m,b,!!b.length&&"col-form-label"),a);return o.a.createElement(l,Object(n.a)({htmlFor:p},f,{className:h}))};h.propTypes=f,h.defaultProps=b,t.a=h},668:function(e,t,a){"use strict";var n=a(151),r=a(152),s=a(499),o=a.n(s),c=a(494),l=function(){function e(){Object(n.a)(this,e)}return Object(r.a)(e,[{key:"addProcurementAgent",value:function(e){return o.a.post("".concat(c.a,"/api/procurementAgent/"),e,{})}},{key:"getProcurementAgentListAll",value:function(){return o.a.get("".concat(c.a,"/api/procurementAgent/"),{})}},{key:"updateProcurementAgent",value:function(e){return o.a.put("".concat(c.a,"/api/procurementAgent/"),e,{})}}]),e}();t.a=new l},958:function(e,t,a){"use strict";a.r(t);var n=a(151),r=a(152),s=a(154),o=a(153),c=a(156),l=a(155),i=a(2),u=a.n(i),d=a(501),m=a(497),p=a(502),f=a(492),b=a(575),g=a(615),h=a(582),v=a(545),j=a(583),y=a(506),O=a(592),A=(a(593),a(577)),k=a(668),E=a(517),N=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(s.a)(this,Object(o.a)(t).call(this,e))).options={sortIndicator:!0,hideSizePerPage:!1,paginationSize:3,hidePageListOnlyOnePage:!0,clearSearch:!0,alwaysShowAllBtns:!1,withFirstAndLast:!1,onRowClick:function(e){this.editProcurementAgent(e)}.bind(Object(c.a)(a))},a.state={realms:[],procurementAgentList:[],message:"",selProcurementAgent:[]},a.editProcurementAgent=a.editProcurementAgent.bind(Object(c.a)(a)),a.filterData=a.filterData.bind(Object(c.a)(a)),a.addNewProcurementAgent=a.addNewProcurementAgent.bind(Object(c.a)(a)),a}return Object(l.a)(t,e),Object(r.a)(t,[{key:"addNewProcurementAgent",value:function(){this.props.history.push("/procurementAgent/addProcurementAgent")}},{key:"filterData",value:function(){var e=document.getElementById("realmId").value;if(0!=e){var t=this.state.subFundingSourceList.filter((function(t){return t.realm.realmId==e}));console.log("selProcurementAgent---",t),this.setState({selProcurementAgent:t})}else this.setState({selProcurementAgent:this.state.procurementAgentList})}},{key:"editProcurementAgent",value:function(e){this.props.history.push({pathname:"/procurementAgent/editProcurementAgent",state:{procurementAgent:e}})}},{key:"componentDidMount",value:function(){var e=this;E.a.setupAxiosInterceptors(),A.a.getRealmListAll().then((function(t){e.setState({realms:t.data.data})})).catch((function(t){switch(t.message){case"Network Error":e.setState({message:t.message});break;default:e.setState({message:t.response.data.message})}})),k.a.getProcurementAgentListAll().then((function(t){e.setState({procurementAgentList:t.data.data,selProcurementAgent:t.data.data})})).catch((function(t){switch(t.message){case"Network Error":e.setState({message:t.message});break;default:e.setState({message:t.response.data.message})}}))}},{key:"showProcurementAgentLabel",value:function(e,t){return e.label_en}},{key:"showRealmLabel",value:function(e,t){return e.label.label_en}},{key:"showStatus",value:function(e,t){return e?"Active":"Disabled"}},{key:"render",value:function(){var e=this.state.realms,t=e.length>0&&e.map((function(e,t){return u.a.createElement("option",{key:t,value:e.realmId},e.label.label_en)}),this);return u.a.createElement("div",{className:"animated"},u.a.createElement("h5",null,this.props.match.params.message),u.a.createElement("h5",null,this.state.message),u.a.createElement(d.a,null,u.a.createElement(m.a,null,u.a.createElement("i",{className:"icon-menu"}),u.a.createElement("strong",null,"Procurement Agent List")," ",u.a.createElement("div",{className:"card-header-actions"},u.a.createElement("div",{className:"card-header-action"},u.a.createElement("a",{href:"javascript:void();",title:"Add Procurement Agent",onClick:this.addNewProcurementAgent},u.a.createElement("i",{className:"fa fa-plus-square"}))))),u.a.createElement(p.a,null,u.a.createElement(f.a,{md:"3"},u.a.createElement(b.a,null,u.a.createElement(g.a,{htmlFor:"appendedInputButton"},"Realm"),u.a.createElement("div",{className:"controls"},u.a.createElement(h.a,null,u.a.createElement(v.a,{type:"select",name:"realmId",id:"realmId",bsSize:"lg"},u.a.createElement("option",{value:"0"},"Please select"),t),u.a.createElement(j.a,{addonType:"append"},u.a.createElement(y.a,{color:"secondary",onClick:this.filterData},"Go")))))),u.a.createElement(O.BootstrapTable,{data:this.state.selProcurementAgent,version:"4",hover:!0,pagination:!0,search:!0,headerStyle:{background:"#D1EEEE"},options:this.options},u.a.createElement(O.TableHeaderColumn,{isKey:!0,dataField:"procurementAgentId",hidden:!0},"ID"),u.a.createElement(O.TableHeaderColumn,{dataField:"procurementAgentCode",dataSort:!0,dataFormat:this.showSubFundingSourceLabel,dataAlign:"center"},"Procurement Agent Code"),u.a.createElement(O.TableHeaderColumn,{filterFormatted:!0,dataField:"label",dataSort:!0,dataFormat:this.showProcurementAgentLabel,dataAlign:"center"},"Procurement Agent Name"),u.a.createElement(O.TableHeaderColumn,{filterFormatted:!0,dataField:"realm",dataFormat:this.showRealmLabel,dataAlign:"center",dataSort:!0},"Realm"),u.a.createElement(O.TableHeaderColumn,{dataField:"submittedToApprovedLeadTime",dataSort:!0,dataAlign:"center"},"Submitted To Approved Lead Time"),u.a.createElement(O.TableHeaderColumn,{filterFormatted:!0,dataField:"active",dataFormat:this.showStatus,dataAlign:"center",dataSort:!0},"Status")))))}}]),t}(i.Component);t.default=N}}]);
//# sourceMappingURL=34.4dd92eaa.chunk.js.map