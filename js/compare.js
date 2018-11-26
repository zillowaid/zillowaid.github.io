
FIPS_DATA = {}

function make_cross_plot(urls){
    DATA = []
    asyncs = []
    for(var i=0;i<urls.length; i++)
    {
        asyncs.push($.ajax({
            type: "GET",
            url: urls[i],
            dataType: "text",
            success: function (data) {
                return processData(data);
            }
        }));
    }

    $.when.apply(this, asyncs).done(function() {
        console.log(DATA)
        plot(DATA)
    });
    function processData(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [];
        var values = { 'Date': [], 'ZHVIPerSqft_AllHomes': [], 'RegionName': [] }
        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {
                for (var j = 0; j < headers.length; j++) {
                    if(headers[j]=='ZHVIPerSqft_AllHomes')
                        values[headers[j]].push(parseFloat(data[j]))
                    if(headers[j]=='Date')
                        values[headers[j]].push(data[j])
                    if(headers[j]=='RegionName')
                        values['RegionName'] = data[j]

                }
            }
        }
        DATA.push(values)
    }

    function plot(DATA) {
        traces = []
        ma = 0
        for(var i=0; i<DATA.length;i++){
            x = DATA[i]['Date']
            y = DATA[i]['ZHVIPerSqft_AllHomes']
            fips_code = DATA[i]['RegionName']
            statename = FIPS_DATA[fips_code]['StateName']
            countyname = FIPS_DATA[fips_code]['CountyName']
            ma = Math.max(Math.max(...y), ma)
            var trace = {
                x: x,
                y: y,
                name : '$ per Sqft ('+statename+' - '+countyname+')',
                line:{
                    width:4,
                }
            }
            traces.push(trace)
        }
        var line = {
            x: ['2017-12-31', '2017-12-31'],
            y: [0, 1.2*ma],
            name: 'Today',
            line:{
                width:4,
                color:'gray',
                dash:'dash'
            },
            hoverinfor:['skip','x','y']
        }
        traces.push(line)
        var layout = {
            annotations: [{
                    x: 0.5004254919715793,
                    y: -0.16191064079952971,
                    showarrow: false,
                    text: 'Time',
                    xref: 'paper',
                    yref: 'paper',
                    font: {
                        color: "black",
                        size: 24
                    }
                },
                {
                    x: -0.03,
                    y: 0.4714285714285711,
                    showarrow: true,
                    text: 'All Homes $ PerSqft',
                    textangle: -90,
                    xref: 'paper',
                    yref: 'paper',
                    font: {
                        color: "black",
                        size: 18
                    }
                }
            ]
        }
        config = {'showLink': false, 'scrollZoom': false, 'displayModeBar': false};
        Plotly.newPlot('myDiv', traces, layout, config);
    }
}