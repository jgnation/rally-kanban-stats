
Ext.Loader.setConfig({
    enabled:        true,
    disableCaching: true,
    paths: {
        'Ext.ux':  'ux'
    }
});

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    launch: function() {

		this.excludedDates = [];

		//create initial widgits
		this._createContainers();
        this._createDateFields();
		this._createMultiDateCalendar();
    },

    /*
     * Establish the layout of the screen
     */
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

	_createMultiDateCalendar:function() {
    	var calendar = Ext.create('MultiDateCalendarPanel');
    	var panel = calendar._create(this);

		this.topLeftContainer.add(panel);
    },

    /*
     * Called by the 'Get Report' button handler (see MultiDateCalendarPanel.js)
     */
    _runReport: function() {
	    var sDate = Rally.util.DateTime.toIsoString(this.startDate);
		var eDate = Rally.util.DateTime.toIsoString(this.endDate);
		this._loadData(sDate, eDate);
    },

    /*
     * Query the Rally wsapi
     */
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

    /*
     * Called when the query to the Rally wsapi returns (see MainStore.js)
     */
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

    /*
     * Called when the query to the Rally wsapi returns (see MainStore.js)
     */
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

	   	if (records.length > 0)	this.topRightContainer.setVisible(true);
		else this.topRightContainer.setVisible(false);

		this._createCenterGrid(data, records);
    },

    /*
     * Creates a grid to accompany the chart (see this._createChart())
     */
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

		if (records.length > 0)	this.topCenterContainer.setVisible(true);
		else this.topCenterContainer.setVisible(false);
    }
});

/*
TODO:
-----
-add links to story in main grid
-fix jumpy chart
-prefix 'private' methods with an underscore, public without
-sort grid results in chronological order
-take care of case when zero results are returned
-add ability to see a chart with exclusions and without.  Switch between them with a radio button.
-fix switching months on calendar
-fix multidate calendar error by extending the object rather than editing the code
-https://github.com/nohuhu/Ext.ux.form.field.MultiDate
*/
