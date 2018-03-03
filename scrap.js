var request = require('request');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var urlmongo = 'mongodb://localhost:27017/lottery';

var urlget = 'http://lottery.kapook.com/history.html';
request(urlget, function (error, response, html) {
    if (!error) {
        var a = cheerio.load(html);
        a('tbody').filter(function () {
            var data = a(this);
            var indata = data.children();
            var date, url;
            // console.log(Object.keys(indata).length);
            for (var i = 0; i < Object.keys(indata).length; i++) {
                if (typeof (indata[i]) !== 'undefined') {
                    if (Object.keys(indata[i].children[1].children[0]).length === 5) {
                        if (typeof (indata[i].children[1].children[1]) !== 'undefined') {
                            date = indata[i].children[1].children[1].children[1].children[0].data;
                            url = indata[i].children[1].children[1].children[1].attribs.href;
                            changeDateFormat(date, url)
                        }

                    }
                }
            }

        });
    }
});

function changeDateFormat(date, url) {
    var tmpURL = url.split('/');
    var fullLot = tmpURL[4].split('.')[0];
    var tmpFullLot = fullLot.split('-');
    var day = parseInt(tmpFullLot[2]);
    var month = parseInt(tmpFullLot[1]);
    var year = parseInt(tmpFullLot[0]) + 543;
    var dateTH = date.split(' ');
    var monthTH = dateTH[1];

    getData1(url, day, month, year, monthTH, date);
}

function getData1(url, day, month, year, monthTH, date) {            //แกะวิธีแรก
    var lottery = {};
    lottery['date'] = {};
    lottery['first-prize'] = {};
    lottery['front3'] = {};
    lottery['back3'] = {};
    lottery['back2'] = {};
    lottery['nearby'] = {};
    lottery['second-prize'] = {};
    lottery['third-prize'] = {};
    lottery['four-prize'] = {};
    lottery['five-prize'] = {};
    var check = true;
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            try {

                //วันที่
                $('h5').filter(function () {
                    var data = $(this);
                    var a = data.children();
                    lottery['date'] = {
                        'date': a[0].children[0].data
                    }
                });

                //รางวัลที่ 1
                $('.bigprize').filter(function () {
                    var data1 = $(this);
                    var a = data1.children();
                    lottery['first-prize'] = {
                        '1': a[0].children[1].children[0].data,
                        'prize': 6000000
                    }

                    lottery['front3'] = {
                        '1': a[1].children[3].children[1].children[0].data,
                        '2': a[1].children[3].children[3].children[0].data,
                        'prize': 4000
                    }


                    lottery['back3'] = {
                        '1': a[1].children[5].children[1].children[0].data,
                        '2': a[1].children[5].children[3].children[0].data,
                        'prize': 4000
                    }
                    lottery['back2'] = {
                        '1': a[2].children[2].children[0].data,
                        'prize': 2000
                    }

                });

                //รางวัลใกล้เคียง => 2 รางวัล
                $('.nearby').filter(function () {
                    var data2 = $(this);
                    var b = data2.children();
                    lottery['nearby'] = {
                        '1': b[1].children[0].data,
                        '2': b[2].children[0].data,
                        'prize': 100000
                    }

                });

                //รางวัลที่ 2  => 5 รางวัล
                $('.second-prize').filter(function () {
                    var data3 = $(this);
                    var c = data3.children();
                    for (var i = 1; i <= 5; i++) {
                        lottery['second-prize'][i] = c[i].children[0].data
                    }
                    lottery['second-prize']['prize'] = 200000
                });


                //รางวัลที่ 3  => 10 รางวัล
                $('.third-prize').filter(function () {
                    var data4 = $(this);
                    var d = data4.children();
                    for (var i = 1; i <= 10; i++) {
                        lottery['third-prize'][i] = d[i].children[0].data
                    }
                    lottery['third-prize']['prize'] = 80000
                });

                //รางวัลที่ 4  => 50 รางวัล
                $('.four-prize').filter(function () {
                    var data5 = $(this);
                    var e = data5.children();
                    for (var i = 1; i <= 50; i++) {
                        lottery['four-prize'][i] = e[i].children[0].data
                    }
                    lottery['third-prize']['prize'] = 40000
                });

                //รางวัลที่ 5  => 100 รางวัล
                $('.five-prize').filter(function () {
                    var data6 = $(this);
                    var f = data6.children();
                    for (var i = 1; i <= 100; i++) {
                        lottery['five-prize'][i] = f[i].children[0].data
                    }
                    lottery['third-prize']['prize'] = 20000
                });
            } catch (e) {
                getData2(url, day, month, year, monthTH, date);
                check = false;
            }
            if (check) {
                MongoClient.connect(urlmongo, function (err, db) {
                    if (err) throw err;
                    var values = {
                        'numericDate': year + '/' + month + '/' + day,
                        'fullDate': date,
                        'shortYear': year,
                        'month': month,
                        'date': day,
                        'monthTH': monthTH,
                        'url': url,
                        'firstPrize': lottery['first-prize'],
                        'front3': lottery['front3'],
                        'back3': lottery['back3'],
                        'back2': lottery['back2'],
                        'nearby': lottery['nearby'],
                        'second-prize': lottery['second-prize'],
                        'third-prize': lottery['third-prize'],
                        'four-prize': lottery['four-prize'],
                        'five-prize': lottery['five-prize']
                    }
                    db.collection("lottery").insertOne(values, function (err, res) {
                        if (err) throw err;
                        console.log("เพิ่มข้อมูลสำเร็จ");
                        db.close();
                    });
                });
            }
        }
    });
}

function getData2(url, day, month, year, monthTH, date) {            //แกะวิธีที่ 2
    var lottery = {};
    lottery['date'] = {};
    lottery['first-prize'] = {};
    lottery['front3'] = {};
    lottery['back3'] = {};
    lottery['back2'] = {};
    lottery['nearby'] = {};
    lottery['second-prize'] = {};
    lottery['third-prize'] = {};
    lottery['four-prize'] = {};
    lottery['five-prize'] = {};
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            try {
                //วันที่
                $('h5').filter(function () {
                    var data = $(this);
                    var a = data.children();
                    lottery['date'] = {
                        'date': a[0].children[0].data
                    }
                });

                //รางวัลที่ 1
                $('.first-prize').filter(function () {
                    var data2 = $(this);
                    var a1 = data2.children();
                    lottery['first-prize']['1'] = a1[1].children[0].data;
                    lottery['first-prize']['prize'] = 2000000
                });

                // เมื่อก่อนไม่มีรางวัลเลขหน้า 3 ตัว
                //รางวัลเลขหน้า 3 ตัว
                lottery['front3'] = "noData";

                //รางวัลเลขท้าย 3 ตัว
                $('.back3').filter(function () {
                    var data2 = $(this);
                    var a1 = data2.children();
                    var count = 1;
                    for (var i = 0; i < Object.keys(a1[1]).length; i++) {
                        if (typeof (a1[1].children[i]) !== 'undefined') {
                            if (Object.keys(a1[1].children[i]).length === 10)
                                lottery['back3'][count++] = a1[1].children[i].children[0].data;
                        }
                    }
                    lottery['back3']['prize'] = 2000
                });

                //รางวัลเลขท้าย 2 ตัว
                $('.back2').filter(function () {
                    var data2 = $(this);
                    var a1 = data2.children();
                    lottery['back2']['1'] = a1[1].children[0].data;
                    lottery['back2']['prize'] = 1000
                });

                //รางวัลใกล้เคียง => 2 รางวัล
                $('.nearby').filter(function () {
                    var data2 = $(this);
                    var b = data2.children();
                    lottery['nearby'] = {
                        '1': b[1].children[0].data,
                        '2': b[2].children[0].data,
                        'prize': 50000
                    }
                });

                //รางวัลที่ 2  => 5 รางวัล
                $('.second-prize').filter(function () {
                    var data3 = $(this);
                    var c = data3.children();
                    for (var i = 1; i <= 5; i++) {
                        lottery['second-prize'][i] = c[i].children[0].data
                    }
                    lottery['second-prize']['prize'] = 100000
                });


                //รางวัลที่ 3  => 10 รางวัล
                $('.third-prize').filter(function () {
                    var data4 = $(this);
                    var d = data4.children();
                    for (var i = 1; i <= 10; i++) {
                        lottery['third-prize'][i] = d[i].children[0].data
                    }
                    lottery['third-prize']['prize'] = 40000
                });

                //รางวัลที่ 4  => 50 รางวัล
                $('.four-prize').filter(function () {
                    var data5 = $(this);
                    var e = data5.children();
                    for (var i = 1; i <= 50; i++) {
                        lottery['four-prize'][i] = e[i].children[0].data
                    }
                    lottery['four-prize']['prize'] = 20000
                });

                //รางวัลที่ 5  => 100 รางวัล
                $('.five-prize').filter(function () {
                    var data6 = $(this);
                    var f = data6.children();
                    for (var i = 1; i <= 100; i++) {
                        lottery['five-prize'][i] = f[i].children[0].data
                    }
                    lottery['five-prize']['prize'] = 10000
                });
            } catch (e) {
                console.log(url);
                lottery['date'] = "noData";
                lottery['first-prize'] = "noData";
                lottery['front3'] = "noData";
                lottery['back3'] = "noData";
                lottery['back2'] = "noData";
                lottery['nearby'] = {
                    '1': "noData",
                    '2': "noData"
                }
                for (var i = 1; i <= 5; i++) {
                    lottery['second-prize'][i] = "noData";
                }
                for (var i = 1; i <= 10; i++) {
                    lottery['third-prize'][i] = "noData";
                }
                for (var i = 1; i <= 50; i++) {
                    lottery['four-prize'][i] = "noData";
                }
                for (var i = 1; i <= 100; i++) {
                    lottery['five-prize'][i] = "noData";
                }
            }

            MongoClient.connect(urlmongo, function (err, db) {
                if (err) throw err;
                var values = {
                    'numericDate': year + '/' + month + '/' + day,
                    'fullDate': date,
                    'shortYear': year,
                    'month': month,
                    'date': day,
                    'monthTH': monthTH,
                    'url': url,
                    'firstPrize': lottery['first-prize'],
                    'front3': lottery['front3'],
                    'back3': lottery['back3'],
                    'back2': lottery['back2'],
                    'nearby': lottery['nearby'],
                    'second-prize': lottery['second-prize'],
                    'third-prize': lottery['third-prize'],
                    'four-prize': lottery['four-prize'],
                    'five-prize': lottery['five-prize']
                }
                db.collection("lottery").insertOne(values, function (err, res) {
                    if (err) throw err;
                    console.log("เพิ่มข้อมูลสำเร็จ");
                    db.close();
                });
            });
        }
    });
}

