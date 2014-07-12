
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

		this.excludedDates = [];

		this._createContainers();
        this._createDateFields();
		this._addMultiDateCalendar();

    },

    _createContainers: function() {
		//this container will contain the topLeftContainer and topRightContainer
		this.topContainer = Ext.create('Ext.container.Container', {
			title: 'Top',
			flex: 1,
			layout: {
				type: 'hbox', // 'horizontal' layout
				align: 'stretch'
			}
		});
		this.add(this.topContainer);

		//this will contain the date fields and get report button
		this.topLeftContainer = Ext.create('Ext.container.Container', {
			title: 'TopLeft',
			flex: .30,
			layout: {
				type: 'vbox',
				align: 'stretch'
			}
		});
		this.topContainer.add(this.topLeftContainer);

		//this will contain the statistics grid
		this.topCenterContainer = Ext.create('Ext.container.Container', {
			title: 'TopCenter',
			flex: .20,
			layout: {
				type: 'vbox',
				align: 'stretch'
			}
		});
		this.topContainer.add(this.topCenterContainer);

		//this will contain the chart
		this.topRightContainer = Ext.create('Ext.container.Container', {
			title: 'TopRight',
			flex: .30,
			layout: {
				type: 'vbox',
				align: 'stretch'
			}
		});
		this.topContainer.add(this.topRightContainer);

		//this container will contain the grid
		this.bottomContainer = Ext.create('Ext.container.Container', {
			title: 'Bottom',
			flex: 2,
			layout: {
				align: 'stretch'
			}
		});
		this.add(this.bottomContainer);
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

		this.topLeftContainer.add(start);
		this.topLeftContainer.add(end);
	},

	_loadData: function(startDate, endDate) {
		var storeFilters = [
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
					//property: 'InProgressDate',
					property: 'AcceptedDate',
					operator: '>=',
					value: startDate
				},
				{
					property: 'AcceptedDate',
					operator: '<=',
					value: endDate
				}
			];

		if (this.myStore) {
			this.myStore.setFilter(storeFilters);
			this.myStore.load();
		} else {
			var store = Ext.create('MainStore');
    		this.myStore = store._createStore(this, storeFilters);			
		}
    },

    _createChart: function(records) {
		var dict = {};
   		for (var i = 0; i < records.length; i++) {
   			var exclusions = records[i].DaysInProgressExclusions

   			var m = 1;
   			while (m < 100) {
   				var multiple = 5 * m;
   				if (exclusions <= multiple) {
   					var begin;
   					if (multiple == 5) begin = 0;
   					else begin = multiple - 4;

   					var name = 'Stories ' + begin + ' to ' + multiple;
   					if (dict[multiple] == undefined) {
   						dict[multiple] = { 'name': name, 'data': 1 };
   					} else {
   						var obj = dict[multiple];
   						obj.data = obj.data + 1;
   					}
   					break;
   				}
   				if (m == 100) {
   					//TODO
   				}
   				m++;
   			}
   		}

   		var data = [];
   		for (var prop in dict) {
   			data.push(dict[prop]);
   		}

   		if (this.chartStore) {
   			this.chartStore.loadRawData(data);
   		} else {
			this.chartStore = Ext.create('Ext.data.JsonStore', {
			    fields: ['name', 'data'],
			    data: data
			});

			this.chart = Ext.create('Ext.chart.Chart', {
			    renderTo: Ext.getBody(),
			    width: 500,
			    height: 350,
			    animate: true,
			    store: this.chartStore,
			    theme: 'Base:gradients',
			    legend: {
					visible:true,
					position: 'left',
					labelFont: '10px Comic Sans MS'
				},
			    series: [{
			        type: 'pie',
			        angleField: 'data',
			        showInLegend: true,
			        tips: {
			            trackMouse: true,
			            width: 140,
			            height: 28,
			            renderer: function(storeItem, item) {
			                // calculate and display percentage on hover
			                var total = 0;
			                store.each(function(rec) {
			                    total += rec.get('data');
			                });
			                this.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get('data') / total * 100) + '%'); 
			            }
			        },
			        highlight: {
			            segment: {
			                margin: 20
			            }
			        },
			        label: {
			            field: 'name',
			            display: 'rotate',
			            contrast: true,
			            font: '18px Arial'
			        }
			    }]
			});
			this.topRightContainer.add(this.chart);
		}
		this._createCenterGrid(data, records);
    },

    _createCenterGrid: function(data, records) {
		var totalStories = _.reduce(data, function(sum, el) {
  			return sum + el.data;
		}, 0);

		var totalDaysExclusions = _.reduce(records, function(sum, el) {
  			return sum + el.DaysInProgressExclusions;
		}, 0);

		var average = totalDaysExclusions / records.length;
		var averageRounded = Math.round(average * 100) / 100;

		data.push({ name: 'Total Stories Completed', data: totalStories });
		data.push({ name: 'Average Number of Days In Progress', data: averageRounded });

		if (this.centerGridStore) {
			this.centerGridStore.loadRawData(data);
		} else {
			this.centerGridStore = Ext.create('Rally.data.custom.Store', {
				fields: ['name', 'data'],
	    	 	data: data
	    	});

			this.centerGrid = Ext.create('Rally.ui.grid.Grid', {
				store: this.centerGridStore,
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
			this.topCenterContainer.add(this.centerGrid);
		}
    },

    // Create and Show a Grid of given stories
    _loadGrid: function(myStoryStore, records) {

    	if (this.customGridStore) {
    		this.customGridStore.loadRawData(records);
    	} else {
    		this.customGridStore = Ext.create('Rally.data.custom.Store', {
				data: records
			});

			this.myGrid = Ext.create('Rally.ui.grid.Grid', {
				store: this.customGridStore,
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

			this.bottomContainer.add(this.myGrid);
    	}
    },

    _addMultiDateCalendar:function() {
	    Ext.tip.QuickTipManager.init();

		var store, panel;

		panel = Ext.create('Ext.form.Panel', {	        
	        id: 'formPanel',
	        
	        layout: 'vbox',
	        frame: false,
			border: false,
	        
	        defaults: {
	            autoScroll: true,
	            bodyPadding: 8,
				listeners: {
					specialkey: function(form, event) {
						if (event.getKey() === event.ENTER) {
							form.up().down('#validateButton').handler();
						};
					}
				}
	        },
	        
	        items: [{
		            xtype: 'multidatefield',
		            id: 'multiDateField',
		            fieldLabel: 'Exclusions',
		            allowBlank: true,
		            multiValue: true,
		            submitFormat: 'Y-m-d',
		            submitRangeSeparator: '/',
	        	}, 
				{
		            xtype: 'fieldcontainer',
		            fieldLabel: 'Exclude Weekends',
		            defaultType: 'checkboxfield',
		            items: [
		                {
		                    name      : 'weekendCheckbox',
		                    inputValue: '1',
		                    checked   : true,
		                    id        : 'weekendCheckbox'
						}
		            ]
		        },
                {
	            xtype: 'button',
	            id:    'validateButton',
	            text:  'Get Report',
	            scope: this,
	            handler: function() {
	                var form, field;
	                
	                form  = Ext.getCmp('formPanel').getForm();
	                field = Ext.getCmp('multiDateField');
	                
	                if ( form.isValid() ) {
	                    var values = form.getValues();
	                    var valuesString = field.getSubmitValue();
	                    var valuesArray = field.expandValues(valuesString, 'Y-m-d', ';', '/');

						this.checkboxValue = Ext.getCmp('weekendCheckbox').getValue();

		        		this.excludedDates =  _.map(valuesArray, function(date) {
		        			return date.toString();
		        		});			        	

			        	this._runReport();                    
	                }
	                else {
	                	console.log("The form is invalid.");
	                	//alert to the screen?
	                    this._runReport(); 
	                };
	            }
	        }],
	        
	        renderTo: Ext.getBody()
		});

		this.topLeftContainer.add(panel);
    },

    _runReport: function() {
	    var sDate = Rally.util.DateTime.toIsoString(this.startDate);
		var eDate = Rally.util.DateTime.toIsoString(this.endDate);
		this._loadData(sDate, eDate);
    }
});

//sort grid results in chronological order
//take care of case when zero results are returned
//take care of error in chart code
//add ability to see a chart with exclusions and without.  Switch between them with a radio button.
//fix switching months on calendar

//https://github.com/nohuhu/Ext.ux.form.field.MultiDate


//split into separate files:
//http://stackoverflow.com/questions/20617913/how-to-break-up-a-custom-app-into-multiple-js-files