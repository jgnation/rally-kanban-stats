Ext.define('CenterGrid', {
    _addTotalStories: function(data) {
        var totalStories = _.reduce(data, function(sum, el) {
            return sum + el.data;
        }, 0);

        data.push({ name: 'Total Stories Completed', data: totalStories });
    },

    _addAverageDays: function(data, records) {
        var totalDaysExclusions = _.reduce(records, function(sum, el) {
            return sum + el.DaysInProgressExclusions;
        }, 0);

        var average = totalDaysExclusions / records.length;
        var averageRounded = Math.round(average * 100) / 100;

        data.push({ name: 'Average Number of Days In Progress', data: averageRounded });
    },

    _create: function(App) {
        return Ext.create('Rally.ui.grid.Grid', {
                store: App.centerGridStore,
                showPagingToolbar: false,
                listeners: {
                    load: function(myStore, myData, success) {
                        console.log("I'm here!");
                    }
                },
                columnCfgs: [{
                    text: '',
                    dataIndex: 'name',
                },
                {
                    text: '',
                    dataIndex: 'data'
                }]
            });
    }
});