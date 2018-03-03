var MongoClient = require('mongodb').MongoClient;
var urlmongo = 'mongodb://localhost:27017/lottery';

var all = function (res) {
    MongoClient.connect(urlmongo, function (err, db) {
        if (err) throw err;
        db.collection('lottery').find({}, { "_id": 0 }).toArray(function (err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
}

var year = function (res, path) {
    MongoClient.connect(urlmongo, function (err, db) {
        if (err) throw err;
        db.collection("lottery").find({
            "shortYear": parseInt(path)
        }, { "_id": 0 }).toArray(function (err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
}


var month = function (res, path) {
    MongoClient.connect(urlmongo, function (err, db) {
        if (err) throw err;
        var sub = path.split('/');

        db.collection("lottery").find({
            "shortYear": parseInt(sub[0]),
            "month": parseInt(sub[1])
        }, { "_id": 0 }).toArray(function (err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
}

var fullDate = function (res, path) {
    MongoClient.connect(urlmongo, function (err, db) {
        if (err) throw err;
        var sub = path.split('/');

        db.collection("lottery").find({
            "shortYear": parseInt(sub[0]),
            "month": parseInt(sub[1]),
            "date": parseInt(sub[2])
        }, { "_id": 0 }).toArray(function (err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
}

var a = {};
var findPrize = function (body, res) {
    a = {};
    MongoClient.connect(urlmongo, function (err, db) {
        if (err) throw err;
        for (var i in body) {
            var checkType = true;
            if (typeof (body[i]) === 'string') {
                a[body[i]] = [];
                var f = body[i].substring(0, 3);
                var b = body[i].substring(3, 6);
                var l = body[i].substring(4, 6);
                savePrize(db, i, body[i], f, b, l);
            } else if (typeof (body[i]) === 'object') {         //กรณีส่งเลขงวดเดียวกันมา
                for (var j in body[i]) {
                    a[body[i][j]] = [];
                    var f = body[i][j].substring(0, 3);
                    var b = body[i][j].substring(3, 6);
                    var l = body[i][j].substring(4, 6);
                    savePrize(db, i, body[i][j], f, b, l);
                }

            }
        }
        db.close();

        setTimeout(function () {
            for (var i in body) {
                if (typeof (body[i]) === 'string') {
                    if (a[body[i]].length === 0) {
                        a[body[i]].push({
                            'ประเภทรางวัล': 'ไม่ถูกรางวัลจ้า'
                        })
                    }
                }
                else if (typeof (body[i]) === 'object') {
                    for (var j in body[i]) {
                        if (a[body[i][j]].length === 0) {
                            a[body[i][j]].push({
                                'ประเภทรางวัล': 'ไม่ถูกรางวัลจ้า'
                            })
                        }
                    }

                }
            }
            res.send(a);
        }, 3000);
    });
}

function savePrize(db, i, full, f, b, l) {
    var tmpDate = i.split('/');
    db.collection("lottery").find({
        "shortYear": parseInt(tmpDate[0]),
        "month": parseInt(tmpDate[1]),
        "date": parseInt(tmpDate[2])
    }, { "_id": 0 }).toArray(function (err, result) {
        if (err) throw err;
        for (var j in result) {
            for (var k in result[j]) {
                // console.log("k = ", k);
                if (k === 'firstPrize') {
                    if (full === result[j][k]['1']) {
                        aSave('รางวัลที่ 1', full, result[j][k]['prize']);
                    }
                }
                if (k === 'front3') {
                    for (var m in result[j][k]) {
                        if (f === result[j][k][m]) {
                            aSave('เลขหน้า 3 ตัว', f, result[j][k]['prize']);
                        }
                    }
                }
                if (k === 'back3') {
                    for (var m in result[j][k]) {
                        if (b === result[j][k][m]) {
                            aSave('เลขท้าย 3 ตัว', b, result[j][k]['prize']);
                        }
                    }
                }
                if (k === 'back2') {
                    if (l === result[j][k]['1']) {
                        aSave('เลขท้าย 2 ตัว', l, result[j][k]['prize']);
                    }
                }
                if (k === 'nearby') {
                    for (var m in result[j][k]) {
                        if (full === result[j][k][m]) {
                            aSave('รางวัลข้างเคียงรางวัลที่ 1', full, result[j][k]['prize']);
                        }
                    }
                }
                if (k === 'second-prize') {
                    for (var m in result[j][k]) {
                        if (full === result[j][k][m]) {
                            aSave('รางวัลที่ 2', full, result[j][k]['prize']);
                        }
                    }
                }
                if (k === 'third-prize') {
                    for (var m in result[j][k]) {
                        if (full === result[j][k][m]) {
                            aSave('รางวัลที่ 3', full, result[j][k]['prize']);
                        }
                    }
                }
                if (k === 'four-prize') {
                    for (var m in result[j][k]) {
                        if (full === result[j][k][m]) {
                            aSave('รางวัลที่ 4', full, result[j][k]['prize']);
                        }
                    }
                } if (k === 'five-prize') {
                    for (var m in result[j][k]) {
                        if (full === result[j][k][m]) {
                            aSave('รางวัลที่ 5', full, result[j][k]['prize']);
                        }
                    }
                }
            }
        }
        db.close();
    });
}

function aSave(prize, number, numprize) {
    a[number].push({
        'ประเภทรางวัล': prize,
        'หมายเลข': number,
        'รางวัลละ': numprize
    });
}


exports.all = all;
exports.year = year;
exports.month = month;
exports.fullDate = fullDate;
exports.findPrize = findPrize;