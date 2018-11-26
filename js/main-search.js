function processCrossData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var json = []
    var states = []
    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        var tmp = {}
        var tmp2 = {}
        if (data.length == headers.length) {
            for (var j = 0; j < headers.length; j++) {
                tmp[headers[j]] = data[j]
            }
        }
        tmp['id'] = tmp['StateName']+tmp['CountyName']
        json.push(tmp)
    }
    for(var i=0; i<STATES.length;i++){
        states.push({
            'StateName': STATES[i],
            'StateCode': STATE_ABBR[STATES[i]]
        })
    }
    fillStateSearch(states)
    fillCountySearch(json)
}

function fillStateSearch(json) {
    $('#stateSearch').magicsearch({
        // array or string or function or url (for AJAX)
        dataSource: json,
        // unique id
        id: 'StateName',
        // string or array to search through
        fields: 'StateName',
        // data format
        format: '%StateName%',
        inputFormat: '',
        // max number of results
        maxShow: 32,
        // clear the input when no option is selected
        isClear: true,
        // show selected options
        showSelected: true,
        // show dropdown button
        dropdownBtn: false,
        // max number of results in the dropdown
        dropdownMaxItem: 8,
        // multiple select
        multiple: false,
        // true = no limit
        maxItem: 5,
        // show multiple skins
        showMultiSkin: true,
        // multiple styles
        multiStyle: {},
        // multiple fields
        multiField: '',
        // show on focus
        focusShow: false,
        // text when no results
        noResult: '',
        // custom skin
        skin: '',
        // callbacks
        disableRule: function (data) {
            return false;
        },
        success: function ($input, data) {
            console.log('add',data)
            set_state_plot(data['StateCode'], true)
            return true;
        },
        afterDelete: function ($input, data) {
            console.log('del', data)
            return true;
        }
    });
}

function fillCountySearch(json) {
    selected_data = {}
    $('#countySearch').magicsearch({
        // array or string or function or url (for AJAX)
        dataSource: json,
        // unique id
        id: 'id',
        // generate input[type="hidden"]?
        hidden: false,
        // string or array to search through
        fields: ['id'],
        // data format
        format: '%StateName% %CountyName%',
        // input format
        inputFormat: '',
        // max number of results
        maxShow: 32,
        // clear the input when no option is selected
        isClear: true,
        // show selected options
        showSelected: true,
        // show dropdown button
        dropdownBtn: false,
        // max number of results in the dropdown
        dropdownMaxItem: 8,
        // multiple select
        multiple: false,
        // true = no limit
        maxItem: 5,
        // show multiple skins
        showMultiSkin: true,
        // multiple styles
        multiStyle: {},
        // multiple fields
        multiField: '',
        // show on focus
        focusShow: false,
        // text when no results
        noResult: '',
        // custom skin
        skin: '',
        // callbacks
        disableRule: function (data) {
            return false;
        },
        success: function ($input, data) {
            console.log('add',data)
            set_state_plot(data['StateCode'], false)
            s = 'County: Hill<br>State: Montana<br>FIPS: 30041<br>Value: 149.0'
            s = 'County: '+data['CountyName']+'<br>State: '+data['StateName']+'<br>FIPS: '+data['FIPS']+'<br>Value: 0';
            set_county_plots(s)
            return true;
        },
        afterDelete: function ($input, data) {
            console.log('del', data)
            return true;
        }
    });
}


$.ajax({
    type: "GET",
    url: '/plots/cross.csv',
    dataType: "text",
    success: function (data) {
        return processCrossData(data);
    }
})