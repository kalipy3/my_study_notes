
/*
 * websocket.js
 * Copyright (C) 2020 2020-11-08 12:40 kalipy <kalipy@debian>
 *
 * Distributed under terms of the MIT license.
 */

var ws=require('nodejs-websocket');

var exec = require('child_process').execFile;


var server = ws.createServer(function (conn, res) {
  conn.on("text",function(str){
    broadcast(server,str.split(','));
    server.emit('my other event', { my: 'data' });
  });
  conn.on("close",function(code,reason){
    console.log('connection closed');
  })
  //处理错误事件信息
  conn.on('error',function(err){
    console.log('throw err',err);
  })
  console.log("服务器启动成功")
}).listen(5000);

//下载hex到开发板
function downloadHex() {
  exec('./stm32fxx_telnet_start.sh',{encoding:'utf8'},function (err,stdout,stderr){
    if (err){
      console.log(err);
      //发送数据到客户端
      server.connections.forEach(function (conn) {
        conn.sendText("下载失败");
      })
      return;
    }
    console.log(stdout)
    //发送数据到客户端
    server.connections.forEach(function (conn) {
      conn.sendText("下载成功");
    })
  });
}

function broadcast(server, msg) {
  var recData = [];
  msg.map(function (item, index) {
    //发送数据到客户端
    server.connections.forEach(function (conn) {
      conn.sendText(item);
    })
    //string形式
    recData.push(item)
  })
  downloadHex();
}

