(this["webpackJsonp@coreui/coreui-pro-react-admin-template"]=this["webpackJsonp@coreui/coreui-pro-react-admin-template"]||[]).push([[89],{1105:function(e,a,t){"use strict";t.r(a);var l=t(151),r=t(152),n=t(154),c=t(153),s=t(155),o=t(2),m=t.n(o),u=t(157),i=t.n(u),d=t(487),E=t.n(d),b=t(492),g=t(495),h=t(1078),N=function(e){function a(e){var t;return Object(l.a)(this,a),(t=Object(n.a)(this,Object(c.a)(a).call(this,e))).state={bgColor:"rgb(255, 255, 255)"},t}return Object(s.a)(a,e),Object(r.a)(a,[{key:"componentDidMount",value:function(){var e=i.a.findDOMNode(this).parentNode.firstChild,a=window.getComputedStyle(e).getPropertyValue("background-color");this.setState({bgColor:a||this.state.bgColor})}},{key:"render",value:function(){return m.a.createElement("table",{className:"w-100"},m.a.createElement("tbody",null,m.a.createElement("tr",null,m.a.createElement("td",{className:"text-muted"},"HEX:"),m.a.createElement("td",{className:"font-weight-bold"},Object(h.rgbToHex)(this.state.bgColor))),m.a.createElement("tr",null,m.a.createElement("td",{className:"text-muted"},"RGB:"),m.a.createElement("td",{className:"font-weight-bold"},this.state.bgColor))))}}]),a}(o.Component),f=function(e){function a(){return Object(l.a)(this,a),Object(n.a)(this,Object(c.a)(a).apply(this,arguments))}return Object(s.a)(a,e),Object(r.a)(a,[{key:"render",value:function(){var e=this.props,a=e.className,t=e.children,l=E()(a,"theme-color w-75 rounded mb-3");return m.a.createElement(b.a,{xl:"2",md:"4",sm:"6",xs:"12",className:"mb-4"},m.a.createElement("div",{className:l,style:{paddingTop:"75%"}}),t,m.a.createElement(N,null))}}]),a}(o.Component),p=function(e){function a(){return Object(l.a)(this,a),Object(n.a)(this,Object(c.a)(a).apply(this,arguments))}return Object(s.a)(a,e),Object(r.a)(a,[{key:"render",value:function(){return m.a.createElement("div",{className:"animated fadeIn"},m.a.createElement("div",{className:"card"},m.a.createElement("div",{className:"card-header"},m.a.createElement("i",{className:"icon-drop"})," Theme colors"),m.a.createElement("div",{className:"card-body"},m.a.createElement(g.a,null,m.a.createElement(f,{className:"bg-primary"},m.a.createElement("h6",null,"Brand Primary Color")),m.a.createElement(f,{className:"bg-secondary"},m.a.createElement("h6",null,"Brand Secondary Color")),m.a.createElement(f,{className:"bg-success"},m.a.createElement("h6",null,"Brand Success Color")),m.a.createElement(f,{className:"bg-danger"},m.a.createElement("h6",null,"Brand Danger Color")),m.a.createElement(f,{className:"bg-warning"},m.a.createElement("h6",null,"Brand Warning Color")),m.a.createElement(f,{className:"bg-info"},m.a.createElement("h6",null,"Brand Info Color")),m.a.createElement(f,{className:"bg-light"},m.a.createElement("h6",null,"Brand Light Color")),m.a.createElement(f,{className:"bg-dark"},m.a.createElement("h6",null,"Brand Dark Color"))))),m.a.createElement("div",{className:"card"},m.a.createElement("div",{className:"card-header"},m.a.createElement("i",{className:"icon-drop"})," Grays"),m.a.createElement("div",{className:"card-body"},m.a.createElement(g.a,{className:"mb-3"},m.a.createElement(f,{className:"bg-gray-100"},m.a.createElement("h6",null,"Gray 100 Color")),m.a.createElement(f,{className:"bg-gray-200"},m.a.createElement("h6",null,"Gray 200 Color")),m.a.createElement(f,{className:"bg-gray-300"},m.a.createElement("h6",null,"Gray 300 Color")),m.a.createElement(f,{className:"bg-gray-400"},m.a.createElement("h6",null,"Gray 400 Color")),m.a.createElement(f,{className:"bg-gray-500"},m.a.createElement("h6",null,"Gray 500 Color")),m.a.createElement(f,{className:"bg-gray-600"},m.a.createElement("h6",null,"Gray 600 Color")),m.a.createElement(f,{className:"bg-gray-700"},m.a.createElement("h6",null,"Gray 700 Color")),m.a.createElement(f,{className:"bg-gray-800"},m.a.createElement("h6",null,"Gray 800 Color")),m.a.createElement(f,{className:"bg-gray-900"},m.a.createElement("h6",null,"Gray 900 Color"))))),m.a.createElement("div",{className:"card"},m.a.createElement("div",{className:"card-header"},m.a.createElement("i",{className:"icon-drop"})," Additional colors"),m.a.createElement("div",{className:"card-body"},m.a.createElement(g.a,null,m.a.createElement(f,{className:"bg-blue"},m.a.createElement("h6",null,"Blue Color")),m.a.createElement(f,{className:"bg-light-blue"},m.a.createElement("h6",null,"Light Blue Color")),m.a.createElement(f,{className:"bg-indigo"},m.a.createElement("h6",null,"Indigo Color")),m.a.createElement(f,{className:"bg-purple"},m.a.createElement("h6",null,"Purple Color")),m.a.createElement(f,{className:"bg-pink"},m.a.createElement("h6",null,"Pink Color")),m.a.createElement(f,{className:"bg-red"},m.a.createElement("h6",null,"Red Color")),m.a.createElement(f,{className:"bg-orange"},m.a.createElement("h6",null,"Orange Color")),m.a.createElement(f,{className:"bg-yellow"},m.a.createElement("h6",null,"Yellow Color")),m.a.createElement(f,{className:"bg-green"},m.a.createElement("h6",null,"Green Color")),m.a.createElement(f,{className:"bg-teal"},m.a.createElement("h6",null,"Teal Color")),m.a.createElement(f,{className:"bg-cyan"},m.a.createElement("h6",null,"Cyan Color"))))))}}]),a}(o.Component);a.default=p},492:function(e,a,t){"use strict";var l=t(18),r=t(49),n=t(2),c=t.n(n),s=t(61),o=t.n(s),m=t(487),u=t.n(m),i=t(488),d=o.a.oneOfType([o.a.number,o.a.string]),E=o.a.oneOfType([o.a.bool,o.a.number,o.a.string,o.a.shape({size:o.a.oneOfType([o.a.bool,o.a.number,o.a.string]),order:d,offset:d})]),b={tag:i.q,xs:E,sm:E,md:E,lg:E,xl:E,className:o.a.string,cssModule:o.a.object,widths:o.a.array},g={tag:"div",widths:["xs","sm","md","lg","xl"]},h=function(e,a,t){return!0===t||""===t?e?"col":"col-"+a:"auto"===t?e?"col-auto":"col-"+a+"-auto":e?"col-"+t:"col-"+a+"-"+t},N=function(e){var a=e.className,t=e.cssModule,n=e.widths,s=e.tag,o=Object(r.a)(e,["className","cssModule","widths","tag"]),m=[];n.forEach((function(a,l){var r=e[a];if(delete o[a],r||""===r){var n=!l;if(Object(i.k)(r)){var c,s=n?"-":"-"+a+"-",d=h(n,a,r.size);m.push(Object(i.m)(u()(((c={})[d]=r.size||""===r.size,c["order"+s+r.order]=r.order||0===r.order,c["offset"+s+r.offset]=r.offset||0===r.offset,c)),t))}else{var E=h(n,a,r);m.push(E)}}})),m.length||m.push("col");var d=Object(i.m)(u()(a,m),t);return c.a.createElement(s,Object(l.a)({},o,{className:d}))};N.propTypes=b,N.defaultProps=g,a.a=N},495:function(e,a,t){"use strict";var l=t(18),r=t(49),n=t(2),c=t.n(n),s=t(61),o=t.n(s),m=t(487),u=t.n(m),i=t(488),d=o.a.oneOfType([o.a.number,o.a.string]),E={tag:i.q,noGutters:o.a.bool,className:o.a.string,cssModule:o.a.object,form:o.a.bool,xs:d,sm:d,md:d,lg:d,xl:d},b={tag:"div",widths:["xs","sm","md","lg","xl"]},g=function(e){var a=e.className,t=e.cssModule,n=e.noGutters,s=e.tag,o=e.form,m=e.widths,d=Object(r.a)(e,["className","cssModule","noGutters","tag","form","widths"]),E=[];m.forEach((function(a,t){var l=e[a];if(delete d[a],l){var r=!t;E.push(r?"row-cols-"+l:"row-cols-"+a+"-"+l)}}));var b=Object(i.m)(u()(a,n?"no-gutters":null,o?"form-row":"row",E),t);return c.a.createElement(s,Object(l.a)({},d,{className:b}))};g.propTypes=E,g.defaultProps=b,a.a=g}}]);
//# sourceMappingURL=89.2fd35a39.chunk.js.map