Ext.define('Chart', {
    _recordsToChartData: function(records) {
        //TODO: this method is extremely ugly.  Maybe there is a nice functional way to do it?
        var dict = {};
        for (var i = 0; i < records.length; i++) {
            var exclusions = records[i].DaysInProgressExclusions

            var m = 1;
            var MAX = 20;   //as the function is written, this should be a multiple of 5
            while (m * 5 <= MAX) {
                var multiple = 5 * m;
                if (exclusions <= multiple) {
                    var begin = (multiple == 5) ? 0 : multiple - 4;

                    var name = 'Stories ' + begin + ' to ' + multiple;
                    this._populateDictionary(dict, multiple, name);
                    break;
                }
                m++;
            }
            if (m * 5 > MAX) {
                var name = 'More than ' + MAX;
                var index = MAX + 1;    //ensure this is the largest key in the dictionary
                this._populateDictionary(dict, index, name);
            }
        }

        var data = [];
        for (var prop in dict) {
            data.push(dict[prop]);
        }

        //TODO: data may have to be sorted...for over the object properties may not be in any guaranteed order?
        return data;
    },

    _populateDictionary: function(dict, index, name) {
        if (dict[index] == undefined) {
            dict[index] = { 'name': name, 'data': 1 };
        } else {
            var obj = dict[index];
            obj.data++;
        }
    },

    _create: function(App){
        return Ext.create('Ext.chart.Chart', {
                renderTo: Ext.getBody(),
                width: 500,
                height: 350,
                animate: true,
                store: App.chartStore,
                theme: 'Base:gradients',
                legend: {
                    visible:true,
                    position: 'left',
                    labelFont: '12px Arial'
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
                        font: '12px Arial'
                    }
                }]
            });
    }
});