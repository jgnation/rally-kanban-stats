
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
    		this.myStore = store._create(this, storeFilters);			
		}
    },

    _createChart: function(records) {
    	var chart = Ext.create('Chart');

   		var data = chart._recordsToChartData(records);

   		if (this.chartStore) {
   			this.chartStore.loadRawData(data);
   		} else {
			this.chartStore = Ext.create('Ext.data.JsonStore', {
			    fields: ['name', 'data'],
			    data: data
			});

    		this.chart = chart._create(this);
			
			this.topRightContainer.add(this.chart);
		}
		this._createCenterGrid(data, records);
    },

    _createCenterGrid: function(data, records) {
	    var centerGrid = Ext.create('CenterGrid');
		centerGrid._addTotalStories(data);
		centerGrid._addAverageDays(data, records);


		if (this.centerGridStore) {
			this.centerGridStore.loadRawData(data);
		} else {
			this.centerGridStore = Ext.create('Rally.data.custom.Store', {
				fields: ['name', 'data'],
	    	 	data: data
	    	});

			this.centerGrid = centerGrid._create(this);
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

			var mainGrid = Ext.create('MainGrid');
			this.myGrid = mainGrid._create(this);

			this.bottomContainer.add(this.myGrid);
    	}
    },

    _addMultiDateCalendar:function() {
    	var calendar = Ext.create('MultiDateCalendar');
    	var panel = calendar._create(this);

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

//pass callbacks into other files