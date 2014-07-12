Ext.define('MainGrid', {
    _create: function(App) {
        return Ext.create('Rally.ui.grid.Grid', {
                store: App.customGridStore,
                columnCfgs: [{
                    flex: 1,
                    text: 'ID',
                    dataIndex: 'FormattedID',
                }, 
                {
                    flex: 1,
                    text: 'Name',
                    dataIndex: 'Name',
                },
                {
                    flex: 1,
                    text: 'Days In Progress', 
                    dataIndex: 'DaysInProgress'
                },
                {
                    flex: 1,
                    text: 'Days In Progress (w/ Exclusions)', 
                    dataIndex: 'DaysInProgressExclusions'
                },
                {
                    flex: 1,
                    text: 'In Progress Date',
                    dataIndex: 'InProgressDate',
                },
                {
                    flex: 1,
                    text: 'Accepted Date',
                    dataIndex: 'AcceptedDate',
                }]
            });
    }
});