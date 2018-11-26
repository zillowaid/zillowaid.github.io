const STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
const STATE_CODE = {'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'}
const STATE_ABBR = {'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'}

var CURRENT_STATE = ''

set_state_plot = function (state, req) {
    crumbs = document.getElementById('crumbs');
    $('#countyPlotDiv').hide()
    if(req==true){
        $('#plot_frame').show();
        $("#PLOT_IFRAME").attr("src", 'plots/states/' + state + '/' + state + '.html');
    }
    crumbs.innerHTML = "<a href='javascript:set_us_plot()' >US</a>>><a href='javascript:set_state_plot(\"" + state + "\", true);'>" + STATE_CODE[state] + "</a>"
    CURRENT_STATE = state
}

set_us_plot = function () {
    $('#countyPlotDiv').hide()
    $('#plot_frame').show();
    crumbs = document.getElementById('crumbs');
    $("#PLOT_IFRAME").attr("src", 'plots/US.html');
    crumbs.innerHTML = "US"
}

set_county_plots = function (data) {
    console.log(data)
    fips = parseInt(data.split('<br>')[2].split(': ')[1])
    county = data.split('<br>')[0].split(': ')[1]
    crumbs = document.getElementById('crumbs');
    makeCountyPlot(CURRENT_STATE, fips, county)
    crumbs.innerHTML += ">>" + county
}

onLoadHandler = function () {
    $('#plot_frame').show();
    PLOT_IFRAME = document.getElementById('PLOT_IFRAME')
    var doc = PLOT_IFRAME.contentWindow || PLOT_IFRAME.contentDocument;
    if (doc.document) {
        doc = doc.document;
    }
    var innerDoc = doc
    PLOT_DOC = innerDoc.getElementsByClassName('plotly-graph-div')[0]
    PLOT_DOC.on('plotly_click', function (data) {
        if (data['points'][0]['data']['locationmode'] == "USA-states") {
            state = data['points'][0]['location']
            set_state_plot(state, true)
        } else if (data['points'][0]['data']['name'] == 'US Counties') {
            set_county_plots(data['points'][0]['text'])
        }
    });
}


function processData(allText, county) {
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
    make_count_plot(values, county)
}

function make_count_plot(data, county){
    traces = []
    ma = 0
    x = data['Date']
    y = data['ZHVIPerSqft_AllHomes']
    ma = Math.max(Math.max(...y), ma)
    var trace = {
        x: x,
        y: y,
        name : '$ per sqft',
        line:{
            width:4,
        }
    }
    traces.push(trace)
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
        title: county,
        height: '600',
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
    $('#countyPlotDiv').show();
    $('#plot_frame').hide();
    Plotly.newPlot('countyPlotDiv', traces, layout, config);
}

function makeCountyPlot(state, fips, county){
    $.ajax({
        type: "GET",
        url: 'plots/states/'+CURRENT_STATE+'/'+fips.toString()+'.csv',
        dataType: "text",
        success: function (data) {
            processData(data, county);
        }
    });
}