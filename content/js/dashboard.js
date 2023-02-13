/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.65, "KoPercent": 1.35};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.85275, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.579, 500, 1500, "Demographics"], "isController": false}, {"data": [0.946, 500, 1500, "Health Finance"], "isController": false}, {"data": [0.936, 500, 1500, "Diseas Surveillance"], "isController": false}, {"data": [0.95, 500, 1500, "Health Facility"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2000, 27, 1.35, 499.23499999999996, 202, 18775, 318.0, 755.8000000000002, 1137.7999999999993, 2604.94, 69.58942240779402, 517.8431628392484, 9.97289818197634], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Demographics", 500, 7, 1.4, 781.6579999999998, 406, 18775, 578.5, 1282.8000000000002, 1439.1499999999996, 4084.9300000000076, 22.826880934989042, 169.8640944576333, 3.187738255569759], "isController": false}, {"data": ["Health Finance", 500, 8, 1.6, 396.5999999999998, 203, 10901, 283.0, 473.0, 855.8499999999999, 2603.7700000000013, 21.082813290605497, 156.8857785882948, 3.0265366735537187], "isController": false}, {"data": ["Diseas Surveillance", 500, 8, 1.6, 419.1520000000001, 202, 9007, 276.5, 547.7000000000005, 882.8, 4191.910000000009, 18.089070583553415, 134.60812289714556, 2.6674313067544593], "isController": false}, {"data": ["Health Facility", 500, 4, 0.8, 399.5300000000001, 216, 15004, 287.5, 481.90000000000003, 740.8999999999997, 1558.6500000000003, 21.845508563439356, 162.56130395840614, 3.114691650646627], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,482 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 9,007 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 15,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 4,783 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,017 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,605 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 18,775 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 5,684 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 8,542 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 5,656 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 3,286 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 3,193 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,370 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 7,128 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 9,797 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,599 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,454 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 8,606 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,127 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 6,468 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,462 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 4,093 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 5,628 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,954 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 10,901 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 2,778 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}, {"data": ["The operation lasted too long: It took 4,202 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.7037037037037037, 0.05], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2000, 27, "The operation lasted too long: It took 2,482 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 9,007 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 15,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 4,783 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,017 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Demographics", 500, 7, "The operation lasted too long: It took 7,128 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 4,783 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 8,606 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,127 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 18,775 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Health Finance", 500, 8, "The operation lasted too long: It took 2,482 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,454 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,605 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 10,901 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,778 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Diseas Surveillance", 500, 8, "The operation lasted too long: It took 9,007 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 8,542 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,599 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 5,628 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 6,468 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Health Facility", 500, 4, "The operation lasted too long: It took 15,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 9,797 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,017 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,462 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
