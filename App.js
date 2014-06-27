///project/2381863766 ?
//YYYY-MM-DDT00:00:00Z
//	"yyyy-MM-dd hh:mm:ss a", "MM/dd/yyyy hh:mm:ss a", "dd/MM/yyyy hh:mm:ss a", "yyyy/MM/dd hh:mm:ss a", "yyyy-MMM-dd hh:mm:ss a"

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    launch: function() {
        //Write app code here
        console.log('Our First App woot!');
      	this._loadData();
    },

    _loadData: function() {

      var myStore = Ext.create('Rally.data.wsapi.Store', {
          model: 'User Story',
          autoLoad: true,
          filters: [
	          {
	          	property: 'ScheduleState',
	          	operation: '=',
	          	value: 'Accepted'
	          },
	          {
	          	property: 'DirectChildrenCount',
	          	operation: '=',
	          	value: '0'
	          },
	          {
	          	//'2013-12-04T15:49:51.077Z'
	          	property: 'AcceptedDate',
	          	operator: '>=',
	          	value: '2014-01-01T15:49:51.077Z'
	          }
          ],
          listeners: {
              load: function(myStore, myData, success) {
                console.log('got data!', myStore, myData, success);
                this._loadGrid(myStore);
              },
              scope: this
          },
          fetch: ['FormattedID', 'Name', 'AcceptedDate', 'InProgressDate', 'RevisionHistory', 'Revisions', 'Description', 'User', 'Project']
      });

    },

    // Create and Show a Grid of given stories
    _loadGrid: function(myStoryStore) {

      var myGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myStoryStore,
        //I want this:ID, name, days in progress, in progress date, accepted date
        columnCfgs: [
          'FormattedID', 'Name', 'InProgressDate', 'AcceptedDate', 'Project'
        ]
      });

      this.add(myGrid);
      console.log('what is this?', this);
 
    }
});

//Add a date selector to get starting and ending date to run report on
//add starting date and ending date to filter
//run query.  I now have all the data I need

//add controls for exclusions:
//exclude weekends checkbox
//allow user to add as many date ranges as they want to exclude
//add all excluded dates to an array (or something similar)
//for each item returned from the query, see if any of the days between the starting and accepted date are within the excluded dates array
//each match equals a date that should be subtracted from the 'days in progress value'
//the days in progress value should be accepted date - in progress date

//make a sweet pie chart

