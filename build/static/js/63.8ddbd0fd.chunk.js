(this["webpackJsonp@coreui/coreui-pro-react-admin-template"]=this["webpackJsonp@coreui/coreui-pro-react-admin-template"]||[]).push([[63],{1056:function(e,a){},1135:function(e,a,l){},1443:function(e,a,l){"use strict";l.r(a);var t=l(150),n=l(151),r=l(153),s=l(152),o=l(156),c=l(154),i=l(2),u=l.n(i),m=l(494),d=l(491),b=l(496),v=l(495),E=l(497),p=l(564),h=l(601),N=l(592),f=l(593),D=l(526),C=l(1137),g=l(1423),S=(l(1049),l(1091)),I=(l(1134),l(1135),l(726)),k=l.n(I),w=l(861),M=(l(862),k.a.US),A=function(e){function a(e){var l;return Object(t.a)(this,a),(l=Object(r.a)(this,Object(s.a)(a).call(this,e))).saveChanges=l.saveChanges.bind(Object(o.a)(l)),l.updateDimensions=l.updateDimensions.bind(Object(o.a)(l)),l.state={value:["UT","OH"],windowWidth:window.innerWidth,orientation:"vertical",openDirection:"down"},l}return Object(c.a)(a,e),Object(n.a)(a,[{key:"componentDidMount",value:function(){this.updateDimensions(),window.addEventListener("resize",this.updateDimensions)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("resize",this.updateDimensions)}},{key:"saveChanges",value:function(e){this.setState({value:e})}},{key:"updateDimensions",value:function(){var e=window.innerWidth;this.setState((function(a){return{windowWidth:e,orientation:e<620?"vertical":"horizontal",openDirection:e<620?"up":"down"}}))}},{key:"render",value:function(){var e=this;return u.a.createElement("div",{className:"animated fadeIn"},u.a.createElement(m.a,null,u.a.createElement(d.a,{sm:12,md:6,style:{flexBasis:"auto"}},u.a.createElement(b.a,null,u.a.createElement(v.a,null,u.a.createElement("i",{className:"icon-note"}),u.a.createElement("strong",null,"Masked Input")," ",u.a.createElement("small",null,"React Text Mask")," ",u.a.createElement("a",{href:"https://coreui.io/pro/react/",className:"badge badge-danger"},"CoreUI Pro Component")),u.a.createElement(E.a,null,u.a.createElement(p.a,null,u.a.createElement(h.a,null,"Date input"),u.a.createElement(N.a,null,u.a.createElement(f.a,{addonType:"prepend"},u.a.createElement(D.a,null,u.a.createElement("i",{className:"fa fa-calendar"}))),u.a.createElement(g.b,{mask:[/\d/,/\d/,"/",/\d/,/\d/,"/",/\d/,/\d/,/\d/,/\d/],Component:g.a,className:"form-control"})),u.a.createElement(C.a,{color:"muted"},"ex. 99/99/9999")),u.a.createElement(p.a,null,u.a.createElement(h.a,null,"Phone input"),u.a.createElement(N.a,null,u.a.createElement(f.a,{addonType:"prepend"},u.a.createElement(D.a,null,u.a.createElement("i",{className:"fa fa-phone"}))),u.a.createElement(g.b,{mask:["(",/[1-9]/,/\d/,/\d/,")"," ",/\d/,/\d/,/\d/,"-",/\d/,/\d/,/\d/,/\d/],Component:g.a,className:"form-control"})),u.a.createElement(C.a,{color:"muted"},"ex. (999) 999-9999")),u.a.createElement(p.a,null,u.a.createElement(h.a,null,"Taxpayer Identification Numbers"),u.a.createElement(N.a,null,u.a.createElement(f.a,{addonType:"prepend"},u.a.createElement(D.a,null,u.a.createElement("i",{className:"fa fa-usd"}))),u.a.createElement(g.b,{mask:[/\d/,/\d/,"-",/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/],Component:g.a,className:"form-control"})),u.a.createElement(C.a,{color:"muted"},"ex. 99-9999999")),u.a.createElement(p.a,null,u.a.createElement(h.a,null,"Social Security Number"),u.a.createElement(N.a,null,u.a.createElement(f.a,{addonType:"prepend"},u.a.createElement(D.a,null,u.a.createElement("i",{className:"fa fa-male"}))),u.a.createElement(g.b,{mask:[/\d/,/\d/,/\d/,"-",/\d/,/\d/,"-",/\d/,/\d/,/\d/,/\d/],Component:g.a,className:"form-control"})),u.a.createElement(C.a,{color:"muted"},"ex. 999-99-9999")),u.a.createElement(p.a,null,u.a.createElement(h.a,null,"Eye Script"),u.a.createElement(N.a,null,u.a.createElement(f.a,{addonType:"prepend"},u.a.createElement(D.a,null,u.a.createElement("i",{className:"fa fa-asterisk"}))),u.a.createElement(g.b,{mask:["~",/\d/,".",/\d/,/\d/," ","~",/\d/,".",/\d/,/\d/," ",/\d/,/\d/,/\d/],Component:g.a,className:"form-control"})),u.a.createElement(C.a,{color:"muted"},"ex. ~9.99 ~9.99 999")),u.a.createElement(p.a,null,u.a.createElement(h.a,null,"Credit Card Number"),u.a.createElement(N.a,null,u.a.createElement(f.a,{addonType:"prepend"},u.a.createElement(D.a,null,u.a.createElement("i",{className:"fa fa-credit-card"}))),u.a.createElement(g.b,{mask:[/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/],Component:g.a,className:"form-control"})),u.a.createElement(C.a,{color:"muted"},"ex. 9999 9999 9999 9999"))))),u.a.createElement(d.a,{sm:12,md:6},u.a.createElement(b.a,null,u.a.createElement(v.a,null,u.a.createElement("i",{className:"icon-note"}),u.a.createElement("strong",null,"React-Select")," ",u.a.createElement("a",{href:"https://coreui.io/pro/react/",className:"badge badge-danger"},"CoreUI Pro Component"),u.a.createElement("div",{className:"card-header-actions"},u.a.createElement("a",{href:"https://github.com/JedWatson/react-select",rel:"noreferrer noopener",target:"_blank",className:"card-header-action"},u.a.createElement("small",{className:"text-muted"},"docs")))),u.a.createElement(E.a,null,u.a.createElement(w.a,{name:"form-field-name2",value:this.state.value,options:M,onChange:this.saveChanges,multi:!0}))),u.a.createElement(b.a,null,u.a.createElement(v.a,null,u.a.createElement("i",{className:"icon-calendar"}),u.a.createElement("strong",null,"React-Dates")," ",u.a.createElement("a",{href:"https://coreui.io/pro/react/",className:"badge badge-danger"},"CoreUI Pro Component"),u.a.createElement("div",{className:"card-header-actions"},u.a.createElement("a",{href:"https://github.com/airbnb/react-dates",rel:"noreferrer noopener",target:"_blank",className:"card-header-action"},u.a.createElement("small",{className:"text-muted"},"docs")))),u.a.createElement(E.a,null,u.a.createElement(S.DateRangePicker,{startDate:this.state.startDate,startDateId:"startDate",endDate:this.state.endDate,endDateId:"endDate",onDatesChange:function(a){var l=a.startDate,t=a.endDate;return e.setState({startDate:l,endDate:t})},focusedInput:this.state.focusedInput,onFocusChange:function(a){return e.setState({focusedInput:a})},orientation:this.state.orientation,openDirection:this.state.openDirection}))))))}}]),a}(u.a.Component);a.default=A},726:function(e,a){a.AU=[{value:"australian-capital-territory",label:"Australian Capital Territory",className:"State-ACT"},{value:"new-south-wales",label:"New South Wales",className:"State-NSW"},{value:"victoria",label:"Victoria",className:"State-Vic"},{value:"queensland",label:"Queensland",className:"State-Qld"},{value:"western-australia",label:"Western Australia",className:"State-WA"},{value:"south-australia",label:"South Australia",className:"State-SA"},{value:"tasmania",label:"Tasmania",className:"State-Tas"},{value:"northern-territory",label:"Northern Territory",className:"State-NT"}],a.US=[{value:"AL",label:"Alabama",disabled:!0},{value:"AK",label:"Alaska"},{value:"AS",label:"American Samoa"},{value:"AZ",label:"Arizona"},{value:"AR",label:"Arkansas"},{value:"CA",label:"California"},{value:"CO",label:"Colorado"},{value:"CT",label:"Connecticut"},{value:"DE",label:"Delaware"},{value:"DC",label:"District Of Columbia"},{value:"FM",label:"Federated States Of Micronesia"},{value:"FL",label:"Florida"},{value:"GA",label:"Georgia"},{value:"GU",label:"Guam"},{value:"HI",label:"Hawaii"},{value:"ID",label:"Idaho"},{value:"IL",label:"Illinois"},{value:"IN",label:"Indiana"},{value:"IA",label:"Iowa"},{value:"KS",label:"Kansas"},{value:"KY",label:"Kentucky"},{value:"LA",label:"Louisiana"},{value:"ME",label:"Maine"},{value:"MH",label:"Marshall Islands"},{value:"MD",label:"Maryland"},{value:"MA",label:"Massachusetts"},{value:"MI",label:"Michigan"},{value:"MN",label:"Minnesota"},{value:"MS",label:"Mississippi"},{value:"MO",label:"Missouri"},{value:"MT",label:"Montana"},{value:"NE",label:"Nebraska"},{value:"NV",label:"Nevada"},{value:"NH",label:"New Hampshire"},{value:"NJ",label:"New Jersey"},{value:"NM",label:"New Mexico"},{value:"NY",label:"New York"},{value:"NC",label:"North Carolina"},{value:"ND",label:"North Dakota"},{value:"MP",label:"Northern Mariana Islands"},{value:"OH",label:"Ohio"},{value:"OK",label:"Oklahoma"},{value:"OR",label:"Oregon"},{value:"PW",label:"Palau"},{value:"PA",label:"Pennsylvania"},{value:"PR",label:"Puerto Rico"},{value:"RI",label:"Rhode Island"},{value:"SC",label:"South Carolina"},{value:"SD",label:"South Dakota"},{value:"TN",label:"Tennessee"},{value:"TX",label:"Texas"},{value:"UT",label:"Utah"},{value:"VT",label:"Vermont"},{value:"VI",label:"Virgin Islands"},{value:"VA",label:"Virginia"},{value:"WA",label:"Washington"},{value:"WV",label:"West Virginia"},{value:"WI",label:"Wisconsin"},{value:"WY",label:"Wyoming"}]}}]);
//# sourceMappingURL=63.8ddbd0fd.chunk.js.map