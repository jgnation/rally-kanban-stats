Ext.define('Chart', {
    _recordsToChartData: function(records) {
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

        return data;
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