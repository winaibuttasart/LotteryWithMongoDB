# API ตรวจหวยด้วย NodeJS +  MongoDB

ทำ WebScarab จากเว็บไซต์ [กระปุกดอทคอม](http://lottery.kapook.com/history.html) แล้วทำการบันทึกข้อมูลลงฐานข้อมูล (MongoDB) ด้วย NodeJS
สรุปรวม demo code
  - ทำการร้องขอการเชื่อมต่อ HTTP (HTTP requests) ผ่านโมดูล [request](https://www.npmjs.com/package/request)
  - ทำการแปลง tag html โดยใช้ [cheerio](https://github.com/cheeriojs/cheerio)
  - บันทึกข้อมูลที่ได้ลงฐานข้อมูลของ [MongoDB](https://www.mongodb.com/)
  - เปิดเว็บเซิฟเวอร์และทำการ Routing ผ่าน [express](https://www.npmjs.com/package/express) โมดูล
  - เพิ่มความปลอดภัยในการเข้าถึงข้อมูลผ่าน [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

### เริ่มต้นใช้งาน
1. ติดตั้ง [NodeJS](https://nodejs.org/en/) จากนั้นทำการตรวจสอบว่า Node สามารถใช้งานได้และมี npm สำหรับลงโมดูลเสริมต่างๆหรือไม่โดยใช้คำสั่ง
```sh
$> node --version
 v8.9.1
$> npm --version
 v3.10.10
```
2. ติดตั้ง [MongoDB](https://www.mongodb.com/) จากนั้น set path แล้วตรวจสอบว่า MongoDB ที่ติดตั้งสามารถใช้งานได้หรือยัง โดยใช้คำสั่ง
```sh
$> mongod
```
3. ลองเชื่อมต่อฐานข้อมูลโดยใช้คำสั่ง 
```sh
$> mongo
```
4. clone project (https://github.com/winaibuttasart/LotteryWithMongoDB) จากนั้น run ไฟล์ scrap.js ข้อมูลจะถูกเก็บไว้ที่ document lottery
```sh
$> git clone https://github.com/winaibuttasart/LotteryWithMongoDB.git
$> cd LotteryWithMongoDB
LotteryWithMongoDB/ $> node scrap.js
```

5. run ไฟล์ server.js เพื่อดู API จากการดึงข้อมูลจาก MongoDB มาแสดง
```sh
LotteryWithMongoDB/ $> node server.js
 node run at http://localhost:8080
```
- Get method  http://localhost:8080/{year}/{month}/{date}
- Post method http://localhost:8080/

** แนะนำการตรวจสอบการทำงานของ Post method ผ่าน [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=th)
<br>
<br>
# วิธีสร้าง Public key และ Private key บนวินโดว์
1. ดาวน์โหลดโปรแกรม  [OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)
2. ติดตั้งโปรแกรม
3. ตรวจสอบไดว์ C ว่ามีโฟลเดอร์ OpenSSL-Win64 อยู่หรือไหม
4. ทำการ set path บน command line
    ```sh
    $> set RANDFILE=<you project folder>\.rnd
	$> set OPENSSL_CONF=C:\OpenSSL-Win64\bin\openssl.cfg
    ```
5. ทดสอบว่าโปรแกรมที่ลงและ path ที่ตั้งค่าสามรถทำงานได้ไหม
    ```sh
    $> c:\OpenSSL-Win64\bin\openssl.exe   
	    ->OpenSSL> _
    ```
6. เปิด command line แล้วเปลี่ยน path ที่อยู่ไปยังโฟล์เดอร์โปรเจคของคุณ แล้วใช้คำสั่ง
    ```sh
    $> cd LotteryWithMongoDB
    LotteryWithMongoDB/ $> openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem
    ```
    เพื่อสร้าง Public key และ Private key
<br>

----
Code by NIZE
----
**More on github** <br>
github https://github.com/winaibuttasart