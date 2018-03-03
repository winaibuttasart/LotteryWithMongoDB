
var express = require('express');
var url = require('url');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var HashMap = require('hashmap');
var map = new HashMap();

var find = require('./findAndQuery.js');

var map = new Map();
var map2 = new Map();
var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

var cert = fs.readFileSync('./private.pem');  // get private key

app.post('/gettoken', function (req, res) {       //สำหรับ get token
    var body = req.body;
    var dataForGenToken = {
        exp: Math.floor(Date.now() / 1000) + (60 * 2),        //กำหนดเวลาหมดอายุของ token 2 นาที
        data: body
    }

    jwt.sign(dataForGenToken, cert, { algorithm: 'RS256' }, function (err, token) {
        //console.log(token);
        map.set(body.email, token);
        // console.log(map);
        res.send({ 'token': token });
    });
});


function checkExp(token, email) {
    if (token === map.get(email)) {
        var cert1 = fs.readFileSync('./public.pem');  // get public key
        return jwt.verify(token, cert1, function (err, decoded) {
            if (err) return -1;
            // console.log('datenow = ', Math.floor(Date.now() / 1000));
            // console.log('exp = ', decoded.exp);
            if (Math.floor(Date.now() / 1000) <= decoded.exp) {
                //1. check ว่า email นี้เคยเชื่อมต่อมาหรือยัง ผ่าน map2 ถ้ายังให้สร้าง map2(email,Datenow.1) (.1 = นับค่าการเชื่อมต่อครั้งแรก 1 ครั้ง)
                if (typeof (map2.get(email)) === 'undefined') {
                    map2.set(email, Math.floor(Date.now() / 1000) + '.' + 1);
                }
                var tmp = map2.get(email).split('.');   // { [Datenow], [value] }
                if (parseInt(tmp[1]) <= 300 && parseInt(Math.floor(Date.now() / 1000)) - parseInt(tmp[0]) > 60) {           //value <= 300 && time > 60 sec
                    map2.set(email, Math.floor(Date.now() / 1000) + '.' + 1);
                    return 1;
                } else if (parseInt(tmp[1]) <= 300 && parseInt(Math.floor(Date.now() / 1000)) - parseInt(tmp[0]) <= 60) {   //value <= 3000 && time <= 60 sec
                    map2.set(email, Math.floor(Date.now() / 1000) + '.' + (parseInt(tmp[1]) + 1));
                    return 1;
                } else {
                    return 2;
                }
            } else {
                return -1;
            }
        });
    } else {
        return 0;
    }
}


app.post('/', function (req, res) {
    var body = req.body;

    var check = checkExp(body.token, body.email);
    console.log('check = ', check);
    if (check === -1) {
        res.send('รหัสในการยืนยันตัวตนหมดอายุ\nกรุณาร้องขอรหัสยืนยันอีกครั้ง');
    } else if (check === 0) {
        res.send('รหัสในการยืนยันตัวตนไม่ถูกต้อง');
    } else if (check === 1) {
        find.all(res);
    } else if (check === 2) {
        res.send('คุณร้องขอเกิน 300 ครั้งต่อนาที');
    } else {
        res.send('Error ไม่สามรถยืนยันตัวตน');
    }
});


app.post('/checklotto', function (req, res) {
    var body = req.body;
    var check = true;

    var check1 = checkExp(body.token, body.email);
    // console.log('check1 = ', check1);
    if (check1 === -1) {
        res.send('รหัสในการยืนยันตัวตนหมดอายุ\nกรุณาร้องขอรหัสยืนยันอีกครั้ง');
    } else if (check1 === 0) {
        res.send('รหัสในการยืนยันตัวตนไม่ถูกต้อง');
    } else if (check1 === 1) {
        var bodyr = '{';
        for (var i in body) {
            var tmp = i.split('/');
            if (tmp.length === 3) {
                try {
                    var year = parseInt(tmp[0]);
                    var month = parseInt(tmp[1]);
                    var day = parseInt(tmp[2]);
                    if ((year < 2555 || year > 2560) && (month < 0 || month > 12) && (day < 0 || day > 32)) {
                        if (year < 2555 || year > 2560) {
                            check = false;
                            console.log('worng year : ', year);
                        }
                        if (month < 0 || month > 12) {
                            check = false;
                            console.log('worng month : ', month);
                        }
                        if (day < 0 || day > 32) {
                            check = false;
                            console.log('wrong date : ', day);
                        }
                    } else {
                        bodyr += "\"" + i + "\"" + ':\"' + body[i] + '\",';
                    }
                } catch (e) {
                    check = false;
                    console.log('wrong format input : ', tmp);
                }
            } else if (i === 'token' || i === 'email') {
                check = true;
            } else {
                check = false;
                console.log('wrong format input : ', tmp);
            }
        }
        if (check) {
            bodyr = bodyr.substring(0, bodyr.length - 1);
            bodyr += '}';
            find.findPrize(JSON.parse(bodyr), res);
        } else {
            res.send('ข้อมูล input บางช่องไม่ถูกต้อง\nกรุณากรอกข้อมูลให้ถูกต้อง');
        }

    } else if (check1 === 2) {
        res.send('คุณร้องขอเกิน 300 ครั้งต่อนาที');
    } else {
        res.send('Error ไม่สามรถยืนยันตัวตน');
    }
});


app.post('/:year', function (req, res) {
    var path = req.path;
    path = path.substring(1, path.length);
    var body = req.body;

    var check = checkExp(body.token, body.email);
    console.log('check = ', check);
    if (check === -1) {
        res.send('รหัสในการยืนยันตัวตนหมดอายุ\nกรุณาร้องขอรหัสยืนยันอีกครั้ง');
    } else if (check === 0) {
        res.send('รหัสในการยืนยันตัวตนไม่ถูกต้อง');
    } else if (check === 1) {
        find.year(res, path);
    } else if (check === 2) {
        res.send('คุณร้องขอเกิน 300 ครั้งต่อนาที');
    } else {
        res.send('Error ไม่สามรถยืนยันตัวตน');
    }
});

app.post('/:year/:month', function (req, res) {
    var path = req.path;
    path = path.substring(1, path.length);
    var body = req.body;

    var check = checkExp(body.token, body.email);
    console.log('check = ', check);
    if (check === -1) {
        res.send('รหัสในการยืนยันตัวตนหมดอายุ\nกรุณาร้องขอรหัสยืนยันอีกครั้ง');
    } else if (check === 0) {
        res.send('รหัสในการยืนยันตัวตนไม่ถูกต้อง');
    } else if (check === 1) {
        find.month(res, path);
    } else if (check === 2) {
        res.send('คุณร้องขอเกิน 300 ครั้งต่อนาที');
    } else {
        res.send('Error ไม่สามรถยืนยันตัวตน');
    }
});

app.post('/:year/:month/:day', function (req, res) {
    var path = req.path;
    path = path.substring(1, path.length);
    var body = req.body;

    var check = checkExp(body.token, body.email);
    console.log('check = ', check);
    if (check === -1) {
        res.send('รหัสในการยืนยันตัวตนหมดอายุ\nกรุณาร้องขอรหัสยืนยันอีกครั้ง');
    } else if (check === 0) {
        res.send('รหัสในการยืนยันตัวตนไม่ถูกต้อง');
    } else if (check === 1) {
        find.fullDate(res, path);
    } else if (check === 2) {
        res.send('คุณร้องขอเกิน 300 ครั้งต่อนาที');
    } else {
        res.send('Error ไม่สามรถยืนยันตัวตน');
    }
});






//  //function get url แบบเต็ม
// function fullUrl(req) {
//     return url.format({
//         protocol: req.protocol,
//         host: req.get('host'),
//         pathname: req.originalUrl
//     });
// }


app.listen(8080);
console.log('node run at http://localhost:8080');
