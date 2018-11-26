function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var json = []
    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        var tmp = {}
        if (data.length == headers.length) {
            for (var j = 0; j < headers.length; j++) {
                tmp[headers[j]] = data[j]
            }
        }
        tmp['id'] = tmp['StateName']+tmp['CountyName']
        json.push(tmp)
        FIPS_DATA[tmp['FIPS']] = tmp
    }
    fillSearch(json)
}

function fillSearch(json) {
    selected_data = {}
    $('#basic').magicsearch({
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
        multiple: true,
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
            // console.log('add',data)
            selected_data[data['FIPS']] = data
            urls = makeUrls(selected_data)
            console.log(urls, selected_data)
            if(urls.length>0)
            {
                $('#myDiv').show();
                make_cross_plot(urls)
            }
            else{
                $('#myDiv').hide();
            }
            return true;
        },
        afterDelete: function ($input, data) {
            // console.log('del', data)
            delete selected_data[data['FIPS']]
            console.log(urls, selected_data)
            urls = makeUrls(selected_data)
            if(urls.length>0)
            {
                $('#myDiv').show();
                make_cross_plot(urls)
            }
            else{
                $('#myDiv').hide();
            }
            return true;
        }
    });
}

function makeUrls(data){
    fips = Object.keys(data)
    urls = []
    for(var i=0;i<fips.length;i++){
        statecode = data[fips[i]]['StateCode']
        url = '/plots/states/'+statecode+'/'+fips[i]+'.csv'
        urls.push(url)
    }
    return urls
}

$.ajax({
    type: "GET",
    url: '/plots/cross.csv',
    dataType: "text",
    success: function (data) {
        return processData(data);
    }
})
