import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, NavItem ,UncontrolledDropdown,DropdownToggle,DropdownMenu,DropdownItem} from 'reactstrap';
import PropTypes from 'prop-types';

import { AppAsideToggler, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import DefaultHeaderDropdown from './DefaultHeaderDropdown'
import logo from '../../assets/img/brand/logo.svg'
import sygnet from '../../assets/img/brand/sygnet.svg'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  constructor(props){
    super(props);
    this.changeLanguage=this.changeLanguage.bind(this)
  }
  changeLanguage(lang ) {
   
  localStorage.setItem('lang',lang);
  window.location.reload();
  }
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand
          full={{ src: logo, width: 89, height: 25, alt: 'CoreUI Logo' }}
          minimized={{ src: sygnet, width: 30, height: 30, alt: 'CoreUI Logo' }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />
        <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3">
            <NavLink to="/dashboard" className="nav-link" >Dashboard</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink to="/ProgramTree" className="nav-link" >KENYA-FAMILY PLANNING-MOH</NavLink>
          </NavItem>
        </Nav>
        <Nav className="ml-auto" navbar>
        <UncontrolledDropdown nav direction="down">
            <DropdownToggle nav>
           { localStorage.getItem('lang').toString()}
           <i class="fa fa-caret-down" aria-hidden="true"></i>
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem  onClick= {this.changeLanguage.bind(this,'en')}> English</DropdownItem>
              <DropdownItem onClick={this.changeLanguage.bind(this,'sp')}> Spanish</DropdownItem>
             </DropdownMenu>
          </UncontrolledDropdown>
          <DefaultHeaderDropdown onLogout={this.props.onLogout} accnt />
        </Nav>
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
