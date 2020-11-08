/*
 * server.js
 * Copyright (C) 2020 kalipy <kalipy@debian>
 *
 * Distributed under terms of the MIT license.
 */

var SerialPort = require('serialport')
//Opening a Port
var serialPort = new SerialPort('/dev/ttyACM0', {
  //波特率，可在设备管理器中对应端口的属性中查看
  baudRate : 9600,
  autoOpen:false
})
//连接串口后进行写入指令操作
serialPort.open(async function (err) {
  console.log('IsOpen:',serialPort.isOpen)
  console.log('err:',err)
  if(!err){

    // 此方法写入到串口

    serialPort.write("SLight_led1E");
    await sleepPromise(1000)
    serialPort.write("SClose_led1E");
    await sleepPromise(1000)
    serialPort.write("SLight_led1E");
    await sleepPromise(1000)
    serialPort.write("SClose_led1E");
    await sleepPromise(1000)
    serialPort.write("SLight_led1E");
    await sleepPromise(1000)
    serialPort.write("SClose_led1E");
    await sleepPromise(1000)
  }
})
//指令监听
serialPort.on('data',function (data) {
  console.log('data received: '+data)
})
//错误监听
serialPort.on('error',function (error) {
  console.log('error: '+error)
})

function sleepPromise(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

////获取端口列表
//SerialPort.list(function (error, ports) {
//  ports.forEach(function(port) {
//    console.log(port.comName);
//    console.log(port.pnpId);
//    console.log(port.manufacturer);
//  });
//})
//
