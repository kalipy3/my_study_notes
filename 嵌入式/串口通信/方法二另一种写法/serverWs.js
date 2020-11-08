
/*
 * serverWs.js
 * Copyright (C) 2020 2020-11-08 22:44 kalipy <kalipy@debian>
 *
 * Distributed under terms of the MIT license.
 */
const WebSocket = require('ws');
var SerialPort = require('serialport');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    eachWrite(message);
    ws.send(message, (err) => { // send 方法的第二个参数是一个错误回调函数
      if (err) {
        console.log(`[SERVER] error: ${err}`);
      }
    })
  });
});

//Opening a Port
var serialPort = new SerialPort('/dev/ttyACM0', {
  baudRate: 9600,
  autoOpen: false
})

//连接串口后进行写入指令操作
serialPort.open(function(err) {
  console.log('IsOpen:', serialPort.isOpen)
  console.log('err:', err)
  if (!err) {
    // const bufs = [buf11,buf21,buf31]
    //eachWrite("H")
  }
})

// 写进arduin
function eachWrite(H) {
  //console.log(H)
  serialPort.write(H, function(error, result) {})
}

//指令监听
serialPort.on('data', function(data) {
  var comdata = ""
  console.log('data received: ' + data)
  comdata += data;
  console.log(comdata);
})

//错误监听
serialPort.on('error', function(error) {
  console.log('error: ' + error)
})

////获取端口列表
//SerialPort.list(function(error, ports) {
//  ports.forEach(function(port) {
//    console.log(port.comName);
//    console.log(port.pnpId);
//    console.log(port.manufacturer);
//  });
//})

