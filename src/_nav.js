export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
    },
    {
      name: 'Health Area',
      url: '/healthArea',
      icon: 'icon-speedometer',
      children: [
        {
          name: 'Add Health Area',
          url: '/healthArea/addHealthArea',
          icon: 'fa fa-code',
        }
      ]
    },
    {
      name: 'Funding Source',
      url: '/fundingSource',
      icon: 'fa fa-money',
      children: [
        {
          name: 'Add Funding Source',
          url: '/fundingSource/addFundingSource',
          icon: 'fa fa-plus',
        },
        {
          name: 'Funding Source List',
          url: '/fundingSource/listFundingSource',
          icon: 'fa fa-list-alt',
        }
      ]
    },
    {
      name: 'Sub Funding Source',
      url: '/subFundingSource/listSubFundingSource',
      icon: 'fa fa-money'
    },
    {
      name: 'Procurement Agent',
      url: '/procurementAgent/listProcurementAgent',
      icon: 'fa fa-user'
    }
  ]
};
