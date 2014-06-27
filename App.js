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
        this._createDateFields();

      	this.exclusionsStack = new Array();

      	this.exclusionsContainer = Ext.create('Ext.container.Container', {
      		title: 'Exclusions',
	        layout: {
	                //type: 'hbox', // 'horizontal' layout
	                align: 'stretch'
	        },
	        items: [
	        {
		        xtype: 'label',
		        text: 'Exclusions:'
		    }]
    	});

    	this.add(this.exclusionsContainer);

    	this._createButtons();
    },

    _createButtons: function() {
	    //create exclusion fields
		var addExclusionButton = Ext.create('Ext.Container', {
		    items: [{
		        xtype: 'rallybutton',
		        text: 'Add Exclusion',
		        listeners: {
	            	click: function(myStore, myData, success) {
	            		this._createExclusionFields();
	              	},
	              	scope: this
	            },
		    }],
		    renderTo: Ext.getBody().dom,
		    scope: this
		});

		var getReportButton = Ext.create('Ext.Container', {
		    items: [{
		        xtype: 'rallybutton',
		        text: 'Get Report',
		        listeners: {
	            	click: function(myStore, myData, success) {
	            		var sDate = Rally.util.DateTime.toIsoString(this.startDate);
	            		var eDate = Rally.util.DateTime.toIsoString(this.endDate);
	                	this._loadData(sDate, eDate);
	              	},
	              	scope: this
	            },
		    }],
		    renderTo: Ext.getBody().dom,
		    scope: this
		});
		this.add(addExclusionButton);
		this.add(getReportButton);
    },

    _createDateFields: function() {
		var start = Ext.create('Ext.Container', {
	    	items: [{
		        xtype: 'rallydatefield',
		        fieldLabel: 'Start Date',
		        value: this.startDate = new Date(),
		        listeners: {
					change: function(start, newValue, oldValue, eOpts) {
						this.startDate = newValue;
					},
					scope: this
	    		}
	    	}],
	    	renderTo: Ext.getBody().dom
	    });

	    var end = Ext.create('Ext.Container', {
		    items: [{
		        xtype: 'rallydatefield',
		        fieldLabel: 'End Date',
		        value: this.endDate = new Date(),
		        listeners: {
					change: function(start, newValue, oldValue, eOpts) {
						this.endDate = newValue;
					},
					scope: this
	    		}
		    }],
	    	renderTo: Ext.getBody().dom
		});

		this.add(start);
		this.add(end);
    },

    _createExclusionFields: function() {
    	var singleExclusionContainer = Ext.create('Ext.container.Container', {
	        layout: {
	                type: 'hbox', // 'horizontal' layout
	                align: 'stretch'
	            }
    	});

		var start = Ext.create('Ext.Container', {
	    	items: [{
		        xtype: 'rallydatefield',
		        fieldLabel: 'Start Date',
		        value: this.startDate = new Date(),
		        listeners: {
					change: function(start, newValue, oldValue, eOpts) {
						this.startDate = newValue;
					},
					scope: this
	    		}
	    	}],
	    	renderTo: Ext.getBody().dom
	    });

	    var end = Ext.create('Ext.Container', {
		    items: [{
		        xtype: 'rallydatefield',
		        fieldLabel: 'End Date',
		        value: this.endDate = new Date(),
		        listeners: {
					change: function(start, newValue, oldValue, eOpts) {
						this.endDate = newValue;
					},
					scope: this
	    		}
		    }],
	    	renderTo: Ext.getBody().dom
		});
		singleExclusionContainer.add(start);
		singleExclusionContainer.add(end);
		//this.add(singleExclusionContainer);
		this.exclusionsContainer.add(singleExclusionContainer);
    },

    _loadData: function(startDate, endDate) {

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
	          	property: 'InProgressDate',
	          	operator: '>=',
	          	value: startDate
	          },
	          {
	          	property: 'AcceptedDate',
	          	operator: '<=',
	          	value: endDate
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




//this works!
	          // {
	          // 	//'2013-12-04T15:49:51.077Z'
	          // 	property: 'AcceptedDate',
	          // 	operator: '>=',
	          // 	value: '2014-01-01T15:49:51.077Z'
	          // }


//horizontal layout of components, Interactive Grid, 34:00


//every time I press 'Add Exclusion', create a new start field, and a new end field, and a new container
//Add both of the fields to a container
//add container to list of containers? or a stack!