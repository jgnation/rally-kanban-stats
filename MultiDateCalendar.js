Ext.define('MultiDateCalendar', {
    _create: function(App){
        Ext.tip.QuickTipManager.init();
        var store;

        return Ext.create('Ext.form.Panel', {           
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
                scope: App,
                handler: function() {
                    var form, field;
                    
                    form  = Ext.getCmp('formPanel').getForm();
                    field = Ext.getCmp('multiDateField');
                    
                    if ( form.isValid() ) {
                        var values = form.getValues();
                        var valuesString = field.getSubmitValue();
                        var valuesArray = field.expandValues(valuesString, 'Y-m-d', ';', '/');

                        App.checkboxValue = Ext.getCmp('weekendCheckbox').getValue();

                        App.excludedDates =  _.map(valuesArray, function(date) {
                            return date.toString();
                        });                     

                        App._runReport();                    
                    }
                    else {
                        console.log("The form is invalid.");
                        //alert to the screen?
                        App._runReport(); 
                    };
                }
            }],
            
            renderTo: Ext.getBody()
        });
    }
});