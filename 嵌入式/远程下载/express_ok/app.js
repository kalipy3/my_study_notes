
/*
 * app.js
 * Copyright (C) 2020 2020-11-11 15:20 kalipy <kalipy@debian>
 *
 * Distributed under terms of the MIT license.
 */

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var exec = require('child_process').execFile;
var exec_py = require('child_process').exec
var fs = require('fs')
//引入上传模块
let multer = require('multer')
//配置上传对象
let upload = multer({dest:"/home/kalipy/"})

server.listen(3000, () => {
  console.log('服务器启动成功')
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
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
  
  socket.on('watch', data => {
    console.log(data)
    socket.emit("watch", "此功能正在开发中..")
    //downloadImg(socket)
  })
})

//下载hex到开发板
function downloadHex(socket) {
  exec('./stm32fxx_telnet_start.sh',{encoding:'utf8'},function (err,stdout,stderr){
    if (err){
      console.log(err);
      //发送数据到客户端
      socket.emit('downloadfail','下载失败！')
      return;
    }
    console.log(stdout)
    //发送数据到客户端
    socket.emit('downloadok',"下载成功");
  });
}

//下载图片
function downloadImg() {
  //打开手机给开发板拍照
  exec_py('python3 adb.py',{encoding:'utf8'}, function (err,stdout,stderr){
    if (err){
      console.log("err:"+err);
      //发送数据到客户端
      //socket.emit('downloadfail','下载失败！')
      return;
    }
    console.log("ok:"+stdout)
    //拍照成功，把照片发给客户端


    //发送数据到客户端
    //socket.emit('downloadok',"下载成功");
  });
}

//上传文件
app.post('/imgUpload',upload.single('imgfile'),function(req,res){
  console.log(req.file)
  //因为直接上传的文件为随机字符名字，我们想要重新命名
  let oldPath = req.file.destination+"/"+req.file.filename
  let newPath = req.file.destination+"/"+"33.hex"
  fs.rename(oldPath, newPath, ()=>{
    console.log("改名成功")
  })
  res.json({
    state:'ok',
  })
})

//下载文件
app.get('/imgDownload', async function(req, res) {
  downloadImg()
  await sleepPromise(1000*15)//延时
  let localPath = "./1.jpg"
  res.download(localPath)
});

//延时
function sleepPromise(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
