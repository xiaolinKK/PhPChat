var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();

//var onlineAdminUsers = []; //存储在线管理员用户
var socketSet = []; //存储所有客户端集合
var userRoleID = 100; //巡官ID
//redis
var Redis = require('ioredis');
var redis = Redis(6379, '127.0.0.1');
var onLineUsers = 0;

//set socket.io server
var debug = require('debug')('Runtor.Chat:server');
var port = normalizePort(process.env.PORT || '1233');
app.set('port', port);

var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

//服务端参数配置
var io = require('socket.io').listen(server);
//设置socket io日志级别
//io.set('log level', 2);
//设置服务器端每隔多上时间应该发一个心跳信号,单位 s
//io.set('heartbeat interval', 15);
io.set('transports', [
  'websocket',
  'polling',
]);
io.on('connection', function(socket) {
  onLineUsers++;
  //连线，缓存当前连接客户端
  var tmpSocket = new Object();
  tmpSocket.roomid = 0;
  tmpSocket.from = '';
  tmpSocket.uid = 0;
  tmpSocket.roleid = 0;
  tmpSocket.socketid = socket.id;
  tmpSocket.sesstionid = ParseCookie(socket);
  var hasSocketFlag = 0;
  if (socketSet.length > 0) {
    for (var j = 0; j < socketSet.length; j++) {
      if (socketSet[j].id == socket.id || socketSet[j].sesstionid == tmpSocket.sesstionid) {
        hasSocketFlag++;
      }
      if (!socketSet[j].from || socketSet[j].from == '') {
        socketSet.splice(j, 1);
      }
    }
  }

  if (hasSocketFlag == 0) {
    socketSet.push(tmpSocket);
  }
  socket.emit('connection', {
    msgtype: 1,
    socketid: socket.id,
    totalnum: onLineUsers, //socketSet.length,
  });
  //console.log("connection socketid is " + socket.id);
  //上线  data:{roomid:18,uid:2,from:'test',rid:1,socketid:''}
  socket.on('onlineEvent', function(data) {
    if (!!data && data != "undefined") {
      if (data.from && data.roomid) {
        try {
          //不同客户端进入不同房间
          socket.join(data.roomid.toString());
          //users 客户端上线后无论是游客或是会员存入缓存
          var existsFlag = 0;
          /*用户重复登录*/
          if (socketSet.length > 0) {
            for (var j = 0; j < socketSet.length; j++) {
              //是同一用户，不同socket实例，T掉原来的
              if (!!socketSet[j] && !!socketSet[j].from && (socketSet[j].from == data.from) && (socketSet[j].socketid != socket.id)) {
                //console.log("forceLogOutEvent" + JSON.stringify(data) + " socket id is " + socket.id + " forceLogOut socket id is " + socketSet[j].socketid);
                /*if (parseInt(data.uid) > 0) {*/
                var forceData = {
                  eventTyp: 1
                };
                if (ParseCookie(socket) == socketSet[j].sesstionid) {
                  forceData = {
                    eventTyp: 2
                  };
                }
                var ioSocket = io.sockets.connected[socketSet[j].socketid];
                if (!!ioSocket) {
                  ioSocket.emit('forceLogOutEvent', forceData);
                }
                /*}*/
                //existsFlag++;
                socketSet.splice(j, 1);
              } else if (!!socketSet[j] && !!socketSet[j].socketid && socketSet[j].socketid == socket.id) {
                socketSet[j].from = data.from;
                socketSet[j].roomid = data.roomid;
                socketSet[j].roleid = data.rid;
                socketSet[j].uid = data.uid;
                existsFlag++;
              }
              //清除socketset中未赋值的连接
              if (!socketSet[j].from || socketSet[j].from === "" || socketSet[j].from === '') {
                try {
                  if (!!socketSet[j].roomid && socketSet[j].roomid != undefined) {
                    socket.leave(socketSet[j].roomid.toString()); //离开房间
                  }
                  socketSet.splice(j, 1); //从缓存中清除

                } catch (e) {
                  console.log("清除socketset中未赋值的连接 " + e);
                }
              }

              if (!!socketSet[j].roleid && socketSet[j].roleid >= 85) {
                var adminSocket = io.sockets.connected[socketSet[j].socketid];
                if (!!adminSocket)
                  adminSocket.emit('onlineEvent', {
                    roomid: data.roomid,
                    from: data.from,
                    uid: data.uid,
                    msgtype: 1,
                    socketid: socket.id,
                    totalnum: onLineUsers, //socketSet.length
                  });
              }

            }
          }
          data.sesstionid = ParseCookie(socket);
          data.socketid = socket.id;
          //data.roleid = data.roleid;
          if (existsFlag == 0) {
            socketSet.push(data);
          }
          //if (socketSet[j].roleid >= 85)
          //    io.sockets.in(data.roomid).emit('onlineEvent', {
          //        roomid: data.roomid,
          //        from: data.from,
          //        uid: data.uid,
          //        msgtype: 1,
          //        socketid: socket.id,
          //        totalnum: onLineUsers,//socketSet.length
          //    });
        } catch (ex) {
          console.log("FUNC[onlineEvent]-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
        } finally {

        }
      }
    }
  });

  //审核消息  data:{roomid:18,uid:'23',from:'fn',touid:'',to:'tn',roleid:1,rolename:'管理员',msg:'this is a  test',postfile:'',sendtime:'',createTime:'2015-7-27 10:58:33',msgtype:1,ischeck:1,isOVerMaxMsgCount:true}
  socket.on('adminCheckMsgEvent', function(data) {
    //如果是管理员发的消息直接广播到相应的房间用户，不需要审核
    if (!!data && !!data.roomid) {
      data.socketid = socket.id;
      if (!!data.roleid && parseInt(data.roleid) >= userRoleID) {
        //超管全房间推消息
        if (parseInt(data.roleid) == 120) {
          socket.broadcast.to(data.roomid.toString()).emit('toSayEvent', data);
          //io.sockets.emit('toSayEvent', data);//所有房间发送通知
        } else {
          socket.broadcast.to(data.roomid.toString()).emit('toSayEvent', data);
        }
      } else {
        //取管理员列表
        try {
          if (socketSet.length > 0) {
            for (var i = 0; i < socketSet.length; i++) {
              if (!!socketSet[i].socketid && !!socketSet[i].roleid && parseInt(socketSet[i].roleid) >= userRoleID) {
                var sid = socketSet[i].socketid;
                var adminClient = io.sockets.connected[sid];
                if (!!adminClient) {
                  adminClient.emit('adminCheckMsgEvent', data);
                  //socket.broadcast.to(data.roomid.toString()).emit('adminCheckMsgEvent', data);
                }
              }
            }
          }
          // redis.hvals("ONLINE_Admin_USERS_" + data.roomid, function (err, result) {
          //     if (!!err) {
          //         console.log("error:" + err);
          //     }
          //     else {
          //         if (!!result && result != "undefined") {
          //             result.forEach(function (item, i) {
          //                 if (!!item) {
          //                     var itemObj = JSON.parse(item);
          //                     if (socketSet.length > 0) {
          //                         for (var i = 0; i < socketSet.length; i++) {
          //                             if (socketSet[i].from == itemObj.from) {
          //                                 var sid = socketSet[i].socketid;
          //                                 var adminClient = io.sockets.connected[sid];
          //                                 if (!!adminClient) {
          //                                     adminClient.emit('adminCheckMsgEvent', data);
          //                                     //socket.broadcast.to(data.roomid.toString()).emit('adminCheckMsgEvent', data);
          //                                 }
          //                             }
          //                         }
          //                     }
          //                 }
          //             });
          //         }
          //     }
          // });
        } catch (ex) {
          console.log("FUNC[redis.hvals-GetAdminUsers]-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
        }
      }
    }
  });

  //发消息 data:{roomid:18,uid:'23',from:'fn',touid:'',to:'tn',roleid:1,rolename:'管理员',msg:'this is a  test',postfile:'',sendtime:'',createTime:'2015-7-27 10:58:33',msgtype:1,ischeck:1,isOVerMaxMsgCount:true}
  socket.on('toSayEvent', function(data) {
    if (!!data && !!data.roomid) {
      data.socketid = socket.id;
      if (data.ischeck == "1") {
        socket.broadcast.to(data.roomid).emit("toSayEvent", data);
      }
    }

  });

  //禁言
  socket.on('kickRoomEvent', function(data) {
    try {
      if (socketSet.length > 0 && !!data && !!data.from) {
        for (var i = 0; i < socketSet.length; i++) {
          if (socketSet[i].from == data.from) {
            var sid = socketSet[i].socketid;
            var client = io.sockets.connected[sid];
            if (!!client) {
              client.emit('kickRoomEvent', data);
            }
          }
        }
      }
    } catch (e) {
      console.log("kickRoomEvent exception:" + ex.name + ",msg:" + ex.message + "}");
    }

  });

  //解禁
  socket.on('recoveryPostEvent', function(data) {
    if (socketSet.length > 0 && !!data && !!data.from) {
      for (var i = 0; i < socketSet.length; i++) {
        if (socketSet[i].from == data.from) {
          var sid = socketSet[i].socketid;
          var client = io.sockets.connected[sid];
          if (!!client) {
            client.emit('recoveryPostEvent', data);
          }
        }
      }
    }
  });

  socket.on("sendDanmuEvent", function(data) {
    if (!!data && !!data.roomid) {
      socket.broadcast.to(data.roomid).emit("sendDanmuEvent", data);
    }
  });

  //下线
  socket.on('disconnect', function() {
    try {
      onLineUsers--;
      if (socketSet.length > 0) {
        //var sids = '';
        //for (var i = 0; i < socketSet.length; i++) {
        //    sids += socketSet[i].socketid + "[first_separator]";
        //}
        for (var i = 0; i < socketSet.length; i++) {
          if (socketSet[i].from && socketSet[i].socketid == socket.id) {

            //向其他房间用户广播该用户下线信息
            socket.broadcast.in(socketSet[i].roomid).emit('offlineEvent', {
              from: socketSet[i].from,
              msgtype: 2,
              totalnum: onLineUsers, // socketSet.length,
              sockets: socket.id,
            });
            socket.leave(socketSet[i].roomid.toString()); //离开房间
            socketSet.splice(i, 1); //从缓存中清除
          }
          if (socketSet[i].from === "") {
            socketSet.splice(i, 1); //从缓存中清除
            socket.leave(socketSet[i].roomid.toString()); //离开房间
          }
        }
      }
    } catch (ex) {
      console.log("FUNC[redis.hdel]-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
    } finally {

    }
  });
  //T人
  socket.on('forceLogOutEvent', function(data) {
    console.log("forceLogOutEvent" + JSON.stringify(data));
    if (data && data != "undefined") {
      if (socketSet.length > 0) {
        for (var j = 0; j < socketSet.length; j++) {
          try {
            if (socketSet[j].uid == data.uid && socketSet[j].from == data.from && socketSet[j].roomid == data.roomid) {
              var forceData = {
                eventTyp: 3
              };
              var ioSocket = io.sockets.connected[socketSet[j].socketid];
              if (ioSocket)
                ioSocket.emit('forceLogOutEvent', forceData);

              socketSet.splice(j, 1);
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
  });
  //删除消息
  socket.on('RemoveMessageEvent', function(data) {
    try {
      if (IsDDosAttack(socket)) {
        return false;
      }
      //取管理员列表
      if (socketSet.length > 0) {
        for (var i = 0; i < socketSet.length; i++) {
          if (!!socketSet[i].socketid && !!socketSet[i].roleid && parseInt(socketSet[i].roleid) >= userRoleID) {
            var sid = socketSet[i].socketid;
            var adminClient = io.sockets.connected[sid];
            if (!!adminClient) {
              adminClient.emit('RemoveMessageEvent', data);
            }
          }
        }
      }
      // redis.hvals("ONLINE_Admin_USERS_" + data.roomid, function (err, result) {
      //     if (!!err) {
      //         console.log("error:" + err);
      //     }
      //     else {
      //         if (!!result && result != "undefined") {
      //             result.forEach(function (item, i) {
      //                 if (!!item) {
      //                     var itemObj = JSON.parse(item);
      //                     if (socketSet.length > 0) {
      //                         for (var i = 0; i < socketSet.length; i++) {
      //                             if (socketSet[i].from == itemObj.from) {
      //                                 var sid = socketSet[i].socketid;
      //                                 var adminClient = io.sockets.connected[sid];
      //                                 if (!!adminClient) {
      //                                     adminClient.emit('RemoveMessageEvent', data);
      //                                 }
      //                             }
      //                         }
      //                     }
      //                 }
      //             });
      //         }
      //     }
      // });
    } catch (ex) {
      console.log("FUNC[redis.hvals-GetAdminUsers]-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
    }
  });
  //删除所有消息
  socket.on('RemoveAllMessageEvent', function(data) {
    try {
      if (!!data && !!data.roomid) {
        socket.broadcast.to(data.roomid).emit("RemoveMessageEvent", data);
      }
    } catch (ex) {
      console.log("FUNC[redis.hvals-GetAdminUsers]-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
    }
  });
  //审核消息
  socket.on('CheckedMessageEvent', function(data) {
    try {
      if (IsDDosAttack(socket)) {
        return false;
      }
      //取管理员列表
      if (socketSet.length > 0) {
        for (var i = 0; i < socketSet.length; i++) {
          if (!!socketSet[i].socketid && !!socketSet[i].roleid && parseInt(socketSet[i].roleid) >= userRoleID) {
            var sid = socketSet[i].socketid;
            var adminClient = io.sockets.connected[sid];
            if (!!adminClient) {
              adminClient.emit('CheckedMessageEvent', data);
            }
          }
        }
      }
      // redis.hvals("ONLINE_Admin_USERS_" + data.roomid, function (err, result) {
      //     if (!!err) {
      //         console.log("error:" + err);
      //     }
      //     else {
      //         if (!!result && result != "undefined") {
      //             result.forEach(function (item, i) {
      //                 if (!!item) {
      //                     var itemObj = JSON.parse(item);
      //                     if (socketSet.length > 0) {
      //                         for (var i = 0; i < socketSet.length; i++) {
      //                             if (socketSet[i].from == itemObj.from) {
      //                                 var sid = socketSet[i].socketid;
      //                                 var adminClient = io.sockets.connected[sid];
      //                                 if (!!adminClient) {
      //                                     adminClient.emit('CheckedMessageEvent', data);
      //                                 }
      //                             }
      //                         }
      //                     }
      //                 }
      //             });
      //         }
      //     }
      // });
    } catch (ex) {
      console.log("FUNC[redis.hvals-GetAdminUsers]-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
    }
  });

  //私聊
  socket.on('ServerChatSendMessageEvent', function(data) {
    try {
      if (socketSet.length > 0) {
        for (var i = 0; i < socketSet.length; i++) {
          if (socketSet[i].from == data.to) {
            var sid = socketSet[i].socketid;
            var client = io.sockets.connected[sid];
            if (client) {
              client.emit('ClientChatSendMessageEvent', data);
            }
          }
        }
      }
    } catch (ex) {
      console.log("ServerChatSendMessageEvent-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
    }
  });
  socket.on('ServerShowVoteEvent', function(data) {
    //if (IsDDosAttack(socket)) { return false; }
    try {
      socket.broadcast.to(data.roomid.toString()).emit('ClientShowVoteEvent', data);
      //if (socketSet.length > 0) {
      //    for (var i = 0; i < socketSet.length; i++) {
      //        if (socketSet[i].from != data.from) {
      //            var sid = socketSet[i].socketid;
      //            var client = io.sockets.connected[sid];
      //            if (client) {
      //                client.emit('ClientShowVoteEvent', data);
      //            }
      //        }
      //    }
      //}
    } catch (ex) {
      console.log("ServerShowVoteEvent-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
    }
  });
  socket.on('ServerRefrshVoteEvent', function(data) {
    //if (IsDDosAttack(socket)) { return false; }
    try {
      if (socketSet.length > 0) {
        for (var i = 0; i < socketSet.length; i++) {
          if (socketSet[i].from != data.from) {
            var sid = socketSet[i].socketid;
            var client = io.sockets.connected[sid];
            if (client) {
              client.emit('ClientRefrshVoteEvent', data);
            }
          }
        }
      }
    } catch (ex) {
      console.log("ServerShowVoteEvent-exception:{type:" + ex.name + ",msg:" + ex.message + "}");
    }
  });
  //游客登陆之后助理的聊天窗更新
  socket.on('RefreshUserList', function(data) {
    if (socketSet.length > 0) {
      for (var j = 0; j < socketSet.length; j++) {
        if (!!socketSet[j].roleid && socketSet[j].roleid === 85) {
          var adminSocket = io.sockets.connected[socketSet[j].socketid];
          if (!!adminSocket)
            adminSocket.emit('RefreshUserList', {
              roomid: data.roomid,
              from: data.from,
              uid: data.uid,
              socketid: socket.id,
            });
        }
      }
    }
  });
});

//app configure start
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
//app.engine('html',require('jade')._express);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);
app.get('/', function(req, res) {
  res.sendfile('views/chat.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
//app configure end

function ParseCookie(socket) {
  try {
    var data = socket.handshake.headers.cookie;
    //console.log("ParseCookieinfo " + data);
    var array = data.split('; ');
    for (var i = 0; i < array.length; i++) {
      var ss = array[i].split('=');
      if (ss.length >= 1) {
        return decodeURIComponent(ss[1]);
      }
    }
  } catch (ex) {
    console.log("ParseCookieError：{type:" + ex.name + ",msg:" + ex.message + "}");
    return null;
  }
}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

var getTime = function() {
  var date = new Date();
  return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

var getColor = function() {
  var colors = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'pink', 'red', 'green',
    'orange', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue'
  ];
  return colors[Math.round(Math.random() * 10000 % colors.length)];
}
module.exports = app;