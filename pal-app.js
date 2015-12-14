require('console-stamp')(console, '[HH:MM:ss.l]');
var http = require('http');
var url = require('url');
var util = require('util');

var machines = process.env.ORIGIN_SERVERS.split(',');
var timestamps = {};
var changed = false;

setInterval(function() {
    machines.forEach(function(entry) {
        var request = url.parse('http://' + entry, true, true);
        request['agent'] = false;

        http.get(request, function(res) {
            var data = "";
            res.setEncoding('UTF-8');
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                var publishDate = JSON.parse(data).lastPublishDate;
                if (timestamps.hasOwnProperty(request.host)) {
                    if (timestamps[request.host] != publishDate) {
                        timestamps[request.host] = publishDate;
                        console.log('url: ' + request.host + ' new timestamp:' + timestamps[request.host]);
                        changed = true;
                    }
                }else {
                    timestamps[request.host] = publishDate;
                    console.log('initial timestamp ' + 'url: ' + request.host + ' ' + timestamps[request.host]);
                }
            });
        }).on('error', function(err) {
            console.log(err);
        });
    });
    if (changed) {
        console.log('-----');
        changed = false;
    }
}, 1000);


