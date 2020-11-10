//调用一个shell脚本(注意：根据代码，test.sh脚本文件需要保存在与nodejs同目录下)
var exec = require('child_process').execFile;

exec('./stm32fxx_telnet_start.sh',{encoding:'utf8'},function (err,stdout,stderr){
  if (err){
    console.log(err);
    return;
  }
  console.log(stdout)
});

