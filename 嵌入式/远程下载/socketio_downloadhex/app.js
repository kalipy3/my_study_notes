
/*
 * app.js
 * Copyright (C) 2020 2020-11-10 23:18 kalipy <kalipy@debian>
 *
 * Distributed under terms of the MIT license.
 */
const http = require('http')
var fs = require('fs')
var exec = require('child_process').execFile;
const app = http.createServer()

app.on('request', (req, res) => {
  fs.readFile(__dirname + '/index.html', function(err, data) {
    if (err) {
      res.writeHead(500)
      return res.end('error loading index.html')
    }
    res.writeHead(200)
    res.end(data)
  })
})

const io = require('socket.io')(app)//这一行不能放在上面
app.listen(3000, ()=> {
  console.log('服务器启动成功')
})

io.on('connection', socket => {
  console.log('新用户连接了')
  socket.on('sendmsg', data => {
    console.log(data)
    //传递给串口的数据
  })

  socket.on('downloadhex', data => {
    console.log(data)
    downloadHex(socket)
  })
})

//下载hex到开发板
function downloadHex(socket) {
  exec('./stm32fxx_telnet_start.sh',{encoding:'utf8'},function (err,stdout,stderr){
    if (err){
      console.log(err);
      //发送数据到客户端
      socket.emit('下载失败！')
      return;
    }
    console.log(stdout)
    //发送数据到客户端
    socket.emit("下载成功");
  });
}
