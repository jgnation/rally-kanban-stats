Ext.define('MainStore', {
    _createStore: function(App, storeFilters){
        return Ext.create('Rally.data.wsapi.Store', {
                model: 'User Story',
                autoLoad: true,
                filters: storeFilters,
                listeners: {
                    load: function(myStore, myData, success) {
                        var records = _.map(myData, function(record) {

                            function calculateDateDifference(record){
                                var inProgressDate = record.get('InProgressDate');
                                var acceptedDate = record.get('AcceptedDate');

                                //http://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates-using-javascript
                                var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                                //var diffDays = Math.round(Math.abs((inProgressDate.getTime() - acceptedDate.getTime())/(oneDay)));
                                var diffDays = Math.ceil(Math.abs((inProgressDate.getTime() - acceptedDate.getTime())/(oneDay)));
                                return diffDays;
                            }

                            function calculateExclusions(record, context) {
                                var field = Ext.getCmp('multiDateField');
                                var inProgressDate = record.get('InProgressDate');
                                var acceptedDate = record.get('AcceptedDate');

                                var inProgressDateString = inProgressDate.getFullYear() + '-'
                                    + ('0' + (inProgressDate.getMonth()+1)).slice(-2) + '-'
                                    + ('0' + inProgressDate.getDate()).slice(-2);

                                var acceptedDateString = acceptedDate.getFullYear() + '-'
                                    + ('0' + (acceptedDate.getMonth()+1)).slice(-2) + '-'
                                    + ('0' + acceptedDate.getDate()).slice(-2);


                                var dateRange = inProgressDateString + "/" + acceptedDateString;
                                var dateArray = field.expandValues(dateRange, 'Y-m-d', ';', '/');

                                var excluded;
                                if (context.checkboxValue) {
                                    var weekendDays = _.filter(dateArray, function(date) {
                                        var day = date.getDay();
                                        return day == 0 || day == 6;
                                    });

                                    var weekendDayStrings =  _.map(weekendDays, function(date) {
                                        return date.toString();
                                    });

                                    excluded = _.uniq(_.union(weekendDayStrings, context.excludedDates));
                                } else {
                                    excluded = context.excludedDates;
                                }

                                var dateStringArray =  _.map(dateArray, function(date) {
                                    return date.toString();
                                });

                                var intersection = _.intersection(dateStringArray, excluded); //run intersection in string arrays instead of date arrays

                                var exclusions = calculateDateDifference(record) - intersection.length;
                                return exclusions >= 0 ? exclusions : 0;
                            }

                            return Ext.apply({              
                                DaysInProgress: calculateDateDifference(record, App),
                                DaysInProgressExclusions: calculateExclusions(record, App)
                            }, record.getData());
                        }, App);

                        App._loadGrid(myStore, records);
                        App._createChart(records);
                    },
                    scope: App
                },
                fetch: ['FormattedID', 'Name', 'AcceptedDate', 'InProgressDate', 'RevisionHistory', 'Revisions', 'Description', 'User', 'Project']
            });
    }
});