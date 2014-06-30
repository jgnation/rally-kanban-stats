///project/2381863766 ?
//YYYY-MM-DDT00:00:00Z
//	"yyyy-MM-dd hh:mm:ss a", "MM/dd/yyyy hh:mm:ss a", "dd/MM/yyyy hh:mm:ss a", "yyyy/MM/dd hh:mm:ss a", "yyyy-MMM-dd hh:mm:ss a"

Ext.Loader.setConfig({
    enabled:        true,
    disableCaching: true,
    paths: {
        'Ext.ux':  'ux'
    }
});

Ext.require([
    'Ext.ux.form.field.MultiDate'
]);

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    launch: function() {

    	this.excludedDates = new Array();

        //Write app code here
        console.log('Our First App woot!');
        this._createDateFields();
		this._addMultiDateCalendar();
    	this._createButtons();
    },

    _createButtons: function() {
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
                var a = this.excludedDates; //this works
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

					function calculateExclusions(record, excludedDates) {
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

				        var dateStringArray =  _.map(dateArray, function(date) {
				        	return date.toString();
				        });

				        var intersection = _.intersection(dateStringArray, excludedDates); //run intersection in string arrays instead of date arrays

						var exclusions = calculateDateDifference(record) - intersection.length;
				        return exclusions >= 0 ? exclusions : 0;
					}

                    return Ext.apply({            	
                        DaysInProgress: calculateDateDifference(record, this),
                        DaysInProgressExclusions: calculateExclusions(record, this.excludedDates)
                    }, record.getData());
                }, this);

                this._loadGrid(myStore, records);
              },
              scope: this
          },
          fetch: ['FormattedID', 'Name', 'AcceptedDate', 'InProgressDate', 'RevisionHistory', 'Revisions', 'Description', 'User', 'Project']
      });
    },

    // Create and Show a Grid of given stories
    _loadGrid: function(myStoryStore, records) {

		var myGrid = Ext.create('Rally.ui.grid.Grid', {
			//store: myStoryStore,
			store: Ext.create('Rally.data.custom.Store', {
			    data: records
			}),
			//I want this:ID, name, days in progress, in progress date, accepted date
			//columnCfgs: ['FormattedID', 'Name', 'InProgressDate', 'AcceptedDate', { text: 'DaysInProgress', dataIndex: 'DirectChildrenCount' }, 'Project']
			columnCfgs: [{
			    text: 'FormattedID',
			    dataIndex: 'FormattedID',
			}, 
			{
			    text: 'Name',
			    dataIndex: 'Name',
			},
			{
				text: 'InProgressDate',
				dataIndex: 'InProgressDate',
			},
			{
				text: 'AcceptedDate',
				dataIndex: 'AcceptedDate',
			}, 
			{
				text: 'DaysInProgress', 
				dataIndex: 'DaysInProgress'
			}, 
			{
				text: 'DaysInProgress (Exclusions)', 
				dataIndex: 'DaysInProgressExclusions'
			},
			{
				text: 'Project', 
				dataIndex: 'Project' //why doesn't this one work?
			}]
		});

		this.add(myGrid);
		console.log('what is this?', this); 
    },

    _addMultiDateCalendar:function() {
    	console.log("blah");
    	//Ext.onReady(function() {
		    Ext.tip.QuickTipManager.init();

			var store, panel;

			panel = Ext.create('Ext.form.Panel', {
		       // width:	200,
		        //height: 200,
		        
		        id: 'formPanel',
		        
		        layout: 'vbox',
		        
		        defaults: {
		            autoScroll: true,
		            //bodyPadding: 8,
					listeners: {
						specialkey: function(form, event) {
							if (event.getKey() === event.ENTER) {
								form.up().down('#validateButton').handler();
							};
						}
					}
		        },
		        
		        //position: 'absolute',
		        //x:  20,
		       // y:  20,
		        
		        items: [{
		            xtype: 'multidatefield',
		            id: 'multiDateField',
		            allowBlank: false,
		            multiValue: true,
		            submitFormat: 'Y-m-d',
		            submitRangeSeparator: '/',
		        }, {
		            xtype: 'button',
		            id:    'validateButton',
		            text:  'Validate',
		            scope: this,
		            handler: function() {
		                var form, field;
		                
		                form  = Ext.getCmp('formPanel').getForm();
		                field = Ext.getCmp('multiDateField');
		                
		                if ( form.isValid() ) {
		                    var values = form.getValues();
		                    var valuesString = field.getSubmitValue();
		                    var valuesArray = field.expandValues(valuesString, 'Y-m-d', ';', '/');
		                    this.excludedDates =  _.map(valuesArray, function(date) {
				        		return date.toString();
				        	});
		                    alert('Form is valid: ' + Ext.JSON.encode(values[ field.inputId ]));
		                }
		                else {
		                    alert('Form is invalid');
		                };
		            }
		        }],
		        
		        renderTo: Ext.getBody()
			});

			this.add(panel);
		//});
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



//after hitting 'Get Report':
//Run a report using the query that is already built
//a)filter the results that are returned, removing the exclusions
//b)use filters to remove weekends (this actually won't work because I still need calculate days in progress w/ the exclusions)


//filtering exclusions:
//a) 




//ok, I have an array of exluded values
//now I want to see if any of the days from the date range of each story overlap with the excluded dates


//look at each story returned from the rally api
//


//user press getRecords
//