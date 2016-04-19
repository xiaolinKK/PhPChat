var connected = false;
var RETRY_INTERVAL = 10000;
var timeout;
var client = {
    config: {
        content: function () {
            return $("#MsgListWrapper #Msg");
        },
        uid: function () {
            return homeMain.OnlineData.UserId();
        },
        fromUN: function () {
            return homeMain.OnlineData.randUN() || '';
        },
        userRole: function () {
            return homeMain.OnlineData.UserRoleName();
        },
        roleID: function () {
            if (homeMain.OnlineData.UserRoleID())
                return homeMain.OnlineData.UserRoleID();
            return 0;
        },
        dataTemplate: {
            'MYMSG_TEMP': '<div class="mymsg"  uid="#USERID#"><span class="msgcontent">#MSG#</span><span class="i-sendTime">#SENDTIME#</span></div>',
            'MSGINFO_TEMP': '<div class="msgInfo" ChartId="#ChartId#" ><span class="sendTime">#SENDTIME#</span><span class="userRole" roleid="#ROLEID#">#ROLENAME#</span><span class="sayingMan tooltipstered"  uid="#USERID#">#USERNAME# :</span><span id="sayingInfo">#MSG#</span>#CHECKEDSTR#</div>',
            'MSGINFO_TEMP_to': '<div class="msgInfo" ChartId="#ChartId#" ><span class="sendTime">#SENDTIME#</span><span class="userRole" roleid="#ROLEID#">#ROLENAME#</span><span class="sayingMan tooltipstered" style="color:#fff;"  uid="#USERID#">#USERNAME#</span><span style=\"background: none repeat scroll 0 0 #eee;border-radius: 3px 3px 3px 3px;color: #333;line-height: 24px;padding:4px 6px; margin-right:5px;\">对</span><span class="toSayingMan tooltipstered" style="color:#fff;"  uid="#TOUSERID#">#TOUSERNAME#</span><span id="sayingInfo">#MSG#</span>#CHECKEDSTR#</div>',
            'ADMINMSG_TEMP_to': '<div class="msgInfo"   ><span class="sendTime">#SENDTIME#</span><span class="userRole" roleid="#ROLEID#">#ROLENAME#</span><span class="sayingMan tooltipstered" style="color:#fff;"  uid="#USERID#">#USERNAME#</span><span style=\"margin-right:5px;background: none repeat scroll 0 0 #eee;border-radius: 3px 3px 3px 3px;color: #333;line-height: 24px;padding:4px 6px; margin-right:5px;\">对</span><span class="toSayingMan tooltipstered" style="color:#fff;"  uid="#TOUSERID#">#TOUSERNAME#</span><div></div><span id="sayingInfo" style="margin: 5px 0;display: inline-block;color:#ff0000;font-size:18px  !important;font-weight:bold !important;line-height: 21px;padding:6px;">#MSG#</span></div>',
            'ADMINMSG_TEMP': '<div class="msgInfo"   ><span class="sendTime">#SENDTIME#</span><span style="color:red;font-weight:bold;margin-right:10px;margin-left:8px;display: inline-block;vertical-align: middle;">#ROLENAME#</span><span class="sayingMan tooltipstered"  uid="#USERID#">#USERNAME# :</span><div></div><span id="sayingInfo" style="margin: 5px 0;display: inline-block;color:#ff0000;font-size:18px  !important;font-weight:bold !important;line-height:21px;padding:6px;">#MSG#</span></div>',
            'ADMINMSGOnLine_TEMP_to': '<div class="msgInfo"   ><span class="sendTime">#SENDTIME#</span><span class="userRole" roleid="#ROLEID#">#ROLENAME#</span><span class="sayingMan tooltipstered" style="color:#fff;"  uid="#USERID#">#USERNAME#</span><span style=\"margin-right:5px;background: none repeat scroll 0 0 #eee;border-radius: 3px 3px 3px 3px;color: #333;line-height: 24px;padding:4px 6px;margin-right:5px; \">对</span><span class="toSayingMan tooltipstered" style="color:#fff;"  uid="#TOUSERID#">#TOUSERNAME#</span><span id="sayingInfo" style="margin: 5px 0;display: inline-block;color:#ff0000;font-size:18px  !important;font-weight:bold !important;line-height:inherit;padding:6px;">#MSG#</span></div>',
            'ADMINMSGOnLine_TEMP': '<div class="msgInfo"   ><span class="sendTime">#SENDTIME#</span><span style="color:red;font-weight:bold;margin-right:10px;margin-left:8px;display: inline-block;vertical-align: middle;">#ROLENAME#</span><span class="sayingMan tooltipstered"  uid="#USERID#">#USERNAME# :</span><span id="sayingInfo" style="margin: 5px 0;display: inline-block;color:#ff0000;font-size:18px  !important;font-weight:bold !important;line-height:inherit;padding:6px;">#MSG#</span></div>',
            'ONLINE_TEMP': '<div class="systemInfo" ><span class="sendTime">#SENDTIME#</span>系统消息：<span class="sayingMan">#USERNAME#</span>上线了！</div>',
            'OFFLINE_TEMP': '<div class="systemInfo" ><span class="sendTime">#SENDTIME#</span>系统消息：<span class="sayingMan">#USERNAME#</span>下线了！</div>',
            'SYSTEMINFO_TEMP': '<div class="systemInfo">系统消息：#MSG#！</div>',
            'CHECKEDSTR_TEMP': '<a href="javascript:void(0);" dataval=\'#CHECKEDPARAMS#\' onclick="client.events.checkMsgClick(this);" class="checkmsg">审核通过</a><a href="javascript:void(0);" dataval=\'#CHECKEDPARAMS#\' onclick="client.methods.RemoveMessage(this);" class="RemoveMsg">删</a>'
        },
    },
    socket: null,
    methods: {
        online: function (jobj) {
            //var p = client.methods.initMsgHtml("1", jobj);
            //client.config.content().append(p);
            //if (homeMain.isscroll) {
            //    $(".nano").nanoScroller();
            //    $(".nano").nanoScroller({ scroll: 'bottom' });
            //}
            //在线人数
            if (!jobj.totalnum || jobj.totalnum == "undefined") {
                jobj.totalnum = 0;
            }
            homeMain.OnlineData.Count(jobj.totalnum);
            //if ( homeMain.OnlineData.UserRoleID() == homeMain.ChatData.ChatRole())
            homeMain.AddNewUser(jobj.uid, jobj.from, 0);
            //显示对谁说话
        },
        offline: function (jobj) {//登出时断开socket连接
            homeMain.OnlineData.Count(jobj.totalnum);
            if (jobj.user == homeMain.OnlineData.ToSay()) {
                homeMain.OnlineData.ToSay("所有人");
            }
            connected = false;
            client.methods.retryConnectOnFailure(RETRY_INTERVAL);
            //下线后校正在线人数
            client.methods.RomveOnlineUser(jobj.from);
            if ( homeMain.OnlineData.UserRoleID() == homeMain.ChatData.ChatRole())
                homeMain.RemoveUser(jobj.from);
        },
        RomveOnlineUser: function (userName) {
            if (userName) {
                $.ajax({ url: '/Home/RomveOnlineUser', data: { userName: userName } }).done(function (result) {
                });
            }
        },
        disconnect: function () {//登出时断开socket连接
            //var p = '';
            //p = client.config.dataTemplate.SYSTEMINFO_TEMP;
            //p = p.replace(/#MSG#/g, '连接服务器失败');
            //client.config.content().append(p);
            if (homeMain.isscroll) {
                $("#MsgListWrapper").nanoScroller();
                $("#MsgListWrapper").nanoScroller({ scroll: 'bottom' });
            }
            connected = false;
            client.methods.retryConnectOnFailure(RETRY_INTERVAL);
        },
        reconnect: function () {
            //var p = '';
            //p = client.config.dataTemplate.SYSTEMINFO_TEMP;
            //p = p.replace(/#MSG#/g, '重新连接服务器');
            //client.config.content().append(p);
            if (homeMain.isscroll) {
                $("#MsgListWrapper").nanoScroller();
                $("#MsgListWrapper").nanoScroller({ scroll: 'bottom' });
            }
            connected = true;
            clearTimeout(timeout);
            client.socket.emit('onlineEvent', {
                roomid: homeMain.OnlineData.RoomId(),
                uid: client.config.uid(),
                from: client.config.fromUN(),
                rid: client.config.roleID(),
                socketid: "",
            });
        },
        initMsgHtml: function (mtype, jobj) {
            //data:{roomid:18,uid:23,from:'fn',to:'tn',roleid:1,rolename:'管理员',msg:'this is a test',ischeck:0,isOVerMaxMsgCount:false}
            if (!!mtype && !!jobj) {
                //LOV：0：其他；1表示上线；2表示下线；3表示管理员发送的消息；4.普通消息；5.我的消息
                var p = '';
                var ctime = (jobj.sendtime || client.methods.now());
                switch (mtype.toString()) {
                    case "1":
                        p = client.config.dataTemplate.ONLINE_TEMP;
                        p = p.replace(/#USERNAME#/g, jobj.from);
                        p = p.replace(/#SENDTIME#/g, ctime);
                        break;
                    case "2":
                        p = client.config.dataTemplate.OFFLINE_TEMP;
                        p = p.replace(/#USERNAME#/g, jobj.from);
                        p = p.replace(/#SENDTIME#/g, ctime);
                        break;
                    case "3":
                        if (jobj.to == "所有人") {
                            if (jobj.msg.length > 30)
                                p = client.config.dataTemplate.ADMINMSG_TEMP;
                            else {
                                p = client.config.dataTemplate.ADMINMSGOnLine_TEMP;
                            }
                        }
                        else {
                            if (jobj.msg.length > 30)
                                p = client.config.dataTemplate.ADMINMSG_TEMP_to;
                            else {
                                p = client.config.dataTemplate.ADMINMSGOnLine_TEMP_to;
                            }
                        }
                        p = p.replace(/#USERNAME#/g, jobj.from);
                        p = p.replace(/#TOUSERNAME#/g, jobj.to);
                        p = p.replace(/#TOUSERID#/g, jobj.touid);
                        if (!jobj.rolename || jobj.rolename == "undefined") {
                            p = p.replace(/#ROLENAME#/g, "<span style='background: none repeat scroll 0 0 #66CC66;'  class=\"userRole\">游客</span>");
                        } else {
                            p = p.replace(/#ROLENAME#/g, client.methods.replaceRoleImg(jobj.roleid));
                        }
                        p = p.replace(/#SENDTIME#/g, ctime);
                        p = p.replace(/#MSG#/g, client.methods.displayMessage(jobj.msg, jobj.postfile));
                        p = p.replace(/#USERID#/g, jobj.uid);
                        p = p.replace(/#CHECKEDSTR#/g, '');
                        break;
                    case "4":
                        if (jobj.to == "所有人") {
                            p = client.config.dataTemplate.MSGINFO_TEMP;
                        }
                        else {
                            p = client.config.dataTemplate.MSGINFO_TEMP_to;
                        }
                        if (jobj.roleid == 0 || !jobj.rolename || jobj.rolename == "undefined") {
                            p = p.replace(/#ROLENAME#/g, "<span  style='background: none repeat scroll 0 0 #66CC66;' class=\"userRole\">游客</span>");
                            p = p.replace(/#ROLEID#/g, "0");
                        } else {
                            p = p.replace(/#ROLENAME#/g, client.methods.replaceRoleImg(jobj.roleid));
                            p = p.replace(/#ROLEID#/g, jobj.roleid);
                        }
                        p = p.replace(/#USERNAME#/g, jobj.from);
                        p = p.replace(/#USERID#/g, jobj.uid);
                        p = p.replace(/#TOUSERNAME#/g, jobj.to);
                        p = p.replace(/#TOUSERID#/g, jobj.touid);
                        p = p.replace(/#SENDTIME#/g, ctime);
                        p = p.replace(/#MSG#/g, client.methods.displayMessage(jobj.msg, jobj.postfile));
                        p = p.replace(/#ChartId#/g, jobj.ChatID);
                        //管理员角色，未审核的消息可以审核
                        if (client.config.roleID() && parseInt(client.config.roleID()) >= 100 && parseInt(jobj.ischeck) == 0) {
                            p = p.replace(/#CHECKEDSTR#/g, client.config.dataTemplate.CHECKEDSTR_TEMP);
                            p = p.replace(/#CHECKEDPARAMS#/g, jobj.ChatID);
                        } else {
                            p = p.replace(/#CHECKEDSTR#/g, '');
                        }
                        break;
                    case "5":
                        var p = '';
                        p = client.config.dataTemplate.MYMSG_TEMP;
                        p = p.replace(/#SENDTIME#/g, ctime);
                        p = p.replace(/#USERID#/g, client.config.uid());
                        p = p.replace(/#MSG#/g, client.methods.displayMessage(jobj.msg, jobj.postfile));
                        break;
                }
                return p;
            }
        },
        toSay: function (jobj) {
            var adminrole = 100;
            var p = client.methods.initMsgHtml(jobj.msgtype, jobj);
            if (!!jobj.from && jobj.from !== client.config.fromUN()) {
                var already = $("#Msg .msgInfo[chartid='" + jobj.ChatID + "']");
                if (!!already && already.length === 0) {
                    client.config.content().append(p);
                } else {
                    if (client.config.roleID < adminrole) return false;
                    $("#Msg .checkmsg[dataval='" + jobj.ChatID + "']").hide();
                    $("#Msg .RemoveMsg[dataval='" + jobj.ChatID + "']").hide();
                }

            }
            if (homeMain.isscroll) {
                $("#MsgListWrapper").nanoScroller();
                $("#MsgListWrapper").nanoScroller({ scroll: 'bottom' });
            }
            homeMain.ShowChatPopup();
        },
        showUnCheckMsg: function (jobj) {
            var p = client.methods.initMsgHtml("4", jobj);
            if (!!jobj.from && jobj.from !== client.config.fromUN()) {
                client.config.content().append(p);
            }
            if (homeMain.isscroll) {
                $("#MsgListWrapper").nanoScroller();
                $("#MsgListWrapper").nanoScroller({ scroll: 'bottom' });
            }
            homeMain.ShowChatPopup();
        },
        checkedMsg: function (jsParams) {
            $.ajax({ url: '/Home/CheckMsgitem', data: { chartId: jsParams } }).done(function (result) {
                var data = {};
                data.chartId = jsParams;
                data.roomid = homeMain.OnlineData.RoomId();
                //client.socket.emit('CheckedMessageEvent', data);
                client.socket.emit('toSayEvent', result);
            }).fail(function (data) {
                // var htmlDoc = data.responseText;
                // var doms = $.parseHTML(htmlDoc);
                //var msg = doms[1].innerHTML;
                alert('此消息己被审核！');
            });
        },
        sendMsg: function () {
            var msg = $("#SayingInputVal").val();
            if (!msg) return false;
            if (msg.trim().length ===0) {
                return false;
            }
            var re = /\[pf_url\]/gm;
            var arr = msg.match(re);
            if (arr != null && arr.length > 1) {
                alert("一次只能上传一张图片，请删除多余图片");
                return;
            }
            if ($("#btnSayingTo").attr("enble") != undefined) {
                return;
            }
            $("#btnSayingTo").attr("enble", "no");
            $("#btnSayingTo").addClass("BtnBgEnbled");
            setTimeout(function () {
                $("#btnSayingTo").removeAttr("enble");
                $("#btnSayingTo").removeClass("BtnBgEnbled");
            }, 3000);

            //LOV：0：其他；1表示上线；2表示下线；3表示管理员发送的消息；4.普通消息；5.我的消息
            var mtype = 0;
            if (parseInt(client.config.roleID()) >= 100) {
                mtype = 3;
            } else {
                mtype = 4;
            }
            var istomsg = 0;
            //管理员角色“对别人说”不用审核
            if (client.config.roleID() && parseInt(client.config.roleID()) >= 100) {
                istomsg = 1;
            }
            //data:{roomid:18,uid:'23',from:'fn',touid:'',to:'tn',roleid:1,rolename:'管理员',msg:'this is a  test',postfile:'',sendtime:'',createTime:'2015-7-27 10:58:33',msgtype:1,ischeck:1,isOVerMaxMsgCount:true}
            var msgdata = {
                ChatID: 0,
                roomid: homeMain.OnlineData.RoomId(),
                uid: client.config.uid(),
                from: client.config.fromUN(),
                to: homeMain.OnlineData.ToSay(),
                touid: homeMain.OnlineData.UserId(),
                roleid: client.config.roleID(),
                rolename: client.config.userRole(),
                msg: msg,
                postfile: homeMain.OnlineData.PostedFilePath(),
                sendtime: client.methods.now(),
                createTime: client.methods.getTime(),
                msgtype: mtype,
                ischeck: istomsg,
                isOVerMaxMsgCount: false
            };
            //是否过滤
            if (homeMain.OnlineData.isFilterMsg()) {
                if (homeMain.wordFilterStr().length > 0) {
                    var flag = 0;
                    for (var i = 0; i < homeMain.wordFilterStr().length; i++) {
                        if (msg.indexOf(homeMain.wordFilterStr()[i]) != -1) flag++;
                    }
                    if (flag > 0) {
                        alert("您发的消息含不友好或敏感内容，请调整好再发！");
                        homeMain.OnlineData.SayWord("");
                        return false;
                    }
                }
            }
            var p = client.methods.initMsgHtml(mtype, msgdata);
            client.config.content().append(p);
            if (homeMain.isscroll) {
                $("#MsgListWrapper").nanoScroller();
                $("#MsgListWrapper").nanoScroller({ scroll: 'bottom' });
            }
            eval("var sendMsg = '" + JSON.stringify(msgdata) + "';");
            //  var sendMsg= ko.toJSON(msgdata);
            $.ajax({ url: '/Home/CachingMsgList', data: { input: sendMsg } }).done(function (result) {
                if (result) {
                    msgdata.ChatID = result;
                    if (parseInt(client.config.roleID()) < 100 && homeMain.OnlineData.isCheckMsg()) {
                        client.socket.emit('adminCheckMsgEvent', msgdata);
                    }
                    else {
                        msgdata.ischeck = 1;
                        client.socket.emit('toSayEvent', msgdata);
                    }
                }
            });
            homeMain.OnlineData.SayWord('');
            $("#SayingInputVal").val('').focus();
        },
        //获取当前时间
        now: function () {
            var date = new Date();
            var time = date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes());
            return time;
        }
        //获取当前时间
        , getTime: function () {
            var date = new Date();
            var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
            return time;
        }
        , retryConnectOnFailure: function (retryInMilliseconds) {
            if (!client.socket.connected) {
                timeout = setTimeout(function () {
                    if (!connected) {
                        if (!client.socket.connected) {
                            client.socket.connect();
                            client.methods.retryConnectOnFailure(retryInMilliseconds);
                        }
                    }
                }, retryInMilliseconds);
            }
        }
        , sendDanmu: function (text) {
            if (!!text && parseInt(client.config.roleID()) >= homeMain.OnlineData.UserRoleID()) {
                var data = {};
                data.text = text;
                data.roomid = homeMain.OnlineData.RoomId();
                client.socket.emit("sendDanmuEvent", data);
            }
        }
        , refresh: function () {
            client.socket.disconnect();
        }
        , RemoveMessage: function (jobj) {//删除消息
            var jsParams = $(jobj).attr("dataval");
            $.ajax({ url: '/Home/RemoveMessage', data: { chartId: jsParams } }).done(function (result) {
                $(".msgInfo[ChartId='" + jsParams + "']").remove();
                var data = {};
                data.chartId = jsParams;
                data.roomid = homeMain.OnlineData.RoomId();
                if (result)
                    client.socket.emit('RemoveAllMessageEvent', data);
                else
                    client.socket.emit('RemoveMessageEvent', data);
            }).fail(function (data) {
                alert('此消息己被删除！');
            });
            $(jobj).parents(".msgInfo").remove();
        },
        RemoveMessageContent: function (jsParams) {//删除消息
            $(".msgInfo[chartid='" + jsParams + "']").remove();
        },
        NotifyServerShowVote: function () {
            client.socket.emit('ServerShowVoteEvent', {
                from: client.config.fromUN(),
                roomid: homeMain.OnlineData.RoomId()
            });
        },
        NotifyRefrshShowVote: function () {
            client.socket.emit('ServerRefrshVoteEvent', {
                from: client.config.fromUN()
            });
        },
        replaceRoleImg: function (rid) {
            //1 会员 10 子爵 20 伯爵 30 白银VIP 40 黄巾VIP 60 钻石VIP 70 至尊VIP 80 大亨VIP 100 巡管 110 频道管理 120 超管  90 讲师 50  铂金 
            if (rid == 1 || rid == 10) {
                return "<img class='LevelImg' src='../Image/images/Level/User1.gif' class=''/>";
            } else if (rid == 20) {
                return "<img class='LevelImg' src='../Image/images/Level/User3.gif' class=''/>";
            } else if (rid == 30) {
                return "<img class='LevelImg' src='../Image/images/Level/Vip1.gif' class=''/>";
            } else if (rid == 40) {
                return "<img class='LevelImg' src='../Image/images/Level/Vip2.gif' class=''/>";
            } else if (rid == 60) {
                return "<img class='LevelImg' src='../Image/images/Level/Vip4.gif' class=''/>";
            } else if (rid == 70) {
                return "<img class='LevelImg' src='../Image/images/Level/Vip5.gif' class=''/>";
            } else if (rid == 80) {
                return "<img class='LevelImg' src='../Image/images/Level/Vip6.gif' class=''/>";
            }
            else if (rid == 85) {
                return "<img class='LevelImg' src='../Image/images/Level/Assistant.gif' class=''/>";
            } else if (rid == 100) {
                return "<img class='LevelImg' src='../Image/images/Level/Manager1.png' class=''/><span style='margin-left:5px'></span><img class='LevelImg' src='../Image/images/Level/RoomManager.png' class=''/>";
            } else if (rid == 110) {
                return "<img class='LevelImg' src='../Image/images/Level/Manager2.png' class=''/><span style='margin-left:5px'></span><img class='LevelImg' src='../Image/images/Level/RoomManager.png' class=''/>";
            } else if (rid == 120) {
                return "<img class='LevelImg' src='../Image/images/Level/Manager3.png' class=''/><span style='margin-left:5px'></span><img class='LevelImg' src='../Image/images/Level/RoomManager.png' class=''/>";
            } else if (rid == 90) {
                return "<img class='LevelImg' src='../Image/images/Level/Manager1.png' class=''/><span style='margin-left:5px'></span><img class='LevelImg' src='../Image/images/Level/RoomManager.png' class=''/>";
            } else if (rid == 50) {
                return "<img class='LevelImg' src='../Image/images/Level/Vip3.gif' class=''/>";
            }
        },
        displayMessage: function (message, imgurl) {
            try {
                if (!!message && message != "undefined") {
                    var emojiStr = message;
                    emojiStr = emojiStr.replace(/\</g, '&lt;');
                    emojiStr = emojiStr.replace(/\>/g, '&gt;');
                    emojiStr = emojiStr.replace(/\n/g, '<br/>');
                    emojiStr = emojiStr.replace(/\[em_([0-9]*)\]/g, '<img src="../../Scripts/qqface/emoji/$1.gif" border="0" />');
                    if (message.indexOf("[pf_url]") >= 0) {
                        var theImage = new Image();
                        theImage.src = imgurl;
                        emojiStr = emojiStr.replace(/\[pf_url\]/g, '<a href="' + imgurl + '"  onclick="homeMain.ShowImage(this.href); return false;"><img src="' + imgurl + '" border="0" style="max-height:80px" /></a>');
                        theImage.src = "";
                        theImage = null;
                    }
                    return emojiStr;
                }
            } catch (e) {
            }
            return "";
        },
    },
    events: {
        connectionEvent: function () {
            //连线成功
            client.socket.on('connection', function (data) {
                //connected = true;
                //clearTimeout(timeout);
                //在线人数
                if (!data.totalnum || data.totalnum == "undefined") {
                    data.totalnum = 0;
                }
                homeMain.OnlineData.Count(data.totalnum);
                homeMain.UserOnLine();
                client.socket.emit('onlineEvent', {
                    roomid: homeMain.OnlineData.RoomId(),
                    uid: client.config.uid(),
                    from: homeMain.OnlineData.randUN(),
                    rid: client.config.roleID(),
                    socketid: "",
                });
            });
        },
        onlineEvent: function () {
            client.socket.on('onlineEvent', function (data) {
                client.methods.online(data);
            });
        },
        offlineEvent: function () {
            client.socket.on('offlineEvent', function (data) {
                client.methods.offline(data);
            });
        },
        disconnectEvent: function () {
            client.socket.on('disconnect', function () {
                client.methods.disconnect();
            });
        },
        RemoveMessageEvent: function () {
            client.socket.on('RemoveMessageEvent', function (data) {
                client.methods.RemoveMessageContent(data.chartId);
            });
        },
        CheckedMessageEvent: function () {
            client.socket.on('CheckedMessageEvent', function (data) {
                client.methods.RemoveMessageContent(data.chartId);
            });
        },
        reconnectEvent: function () {
            client.socket.on('reconnect', function () {
                client.methods.reconnect();
            });
        },
        toSayEventEvent: function () {
            client.socket.on('toSayEvent', function (data) {
                client.methods.toSay(data);

            });
        },
        checkMsgEvent: function () {
            client.socket.on('adminCheckMsgEvent', function (data) {
                client.methods.showUnCheckMsg(data);
            });
        },
        kickRoomEvent: function () {
            client.socket.on('kickRoomEvent', function (data) {
                if (data.from === client.config.fromUN()) {
                    $("#SayingInfoWrapper").empty();
                    $("#SayingInfoWrapper").append(homeMain.dataTemplate.DISABLED_POST);
                    $("#SayingInfoWrapper .disabled-post").text("你已被禁言，请联系管理员");
                    homeMain.UserOneHourGag();
                    //homeMain.OnlineData.isKickRoom = setTimeout(function () {
                    //    $("#SayingInfoWrapper").empty();
                    //    $("#SayingInfoWrapper").append(homeMain.dataTemplate.SEND_MSG);
                    //    homeMain.OnlineData.isKickRoom = null;
                    //}, parseInt(data.time));
                }
            });
        },
        recoveryPostEvnet: function () {
            client.socket.on('recoveryPostEvent', function (data) {
                if (data.from === client.config.fromUN()) {
                    //clearTimeout(homeMain.OnlineData.isKickRoom);
                    //homeMain.OnlineData.isKickRoom = null;
                    //$("#SayingInfoWrapper").empty();
                    //$("#SayingInfoWrapper").append(homeMain.dataTemplate.SEND_MSG);
                    window.location.reload();
                }
            });
        },
        checkMsgClick: function (jobj) {
            var jsParams = $(jobj).attr("dataval");
            client.methods.checkedMsg(jsParams);
            $(jobj).hide();
            setTimeout(function () {
                $(".RemoveMsg[dataval='" + jsParams + "']").hide();
            }, 8000);
            $(".msgInfo[ChartId='" + jsParams + "']").attr("ChartId", "#ChartId#");
        },
        sendMsgClick: function () {
            client.methods.sendMsg();
        },
        sendDanmuClick: function (text) {
            client.methods.sendDanmu(text);
        },
        showDanmuEvent: function () {
            client.socket.on("sendDanmuEvent", function (data) {
                var curdanmu = { "text": data.text, "color": "#ff44aa", "size": "1", "position": "0", "time": $('#dofly').data("nowtime") };
                $('#dofly').danmu("add_danmu", curdanmu);
            });
        },
        forceLogOutEvent: function (forceData) {
            client.socket.on("forceLogOutEvent", function (data) {
                if (data.eventTyp != 1) {
                    if (data.eventTyp == 3) {
                        alert("您被直播室管理员加入黑名单了!");
                        window.location.href = window.location.href;
                    } else {
                        alert("该帐号在其他地方登陆!");
                        homeMain.userLogout();
                    }
                }
                else {
                    alert("该帐号在其他地方登陆!");
                    homeMain.userLogout();
                }
            });
        },
        ClientChatSendMessageEvent: function () {
            client.socket.on("ClientChatSendMessageEvent", function (data) {
                homeMain.ReceiveChatMessage(data);
            });
        },
        NotifyShowVote: function () {
            client.socket.on("ClientShowVoteEvent", function (data) {
                homeMain.QueryVotes(data);
            });
        },
        NotifyRefrshVote: function () {
            client.socket.on("ClientRefrshVoteEvent", function (data) {
                homeMain.RefrshVotes();
            });
        },
        RefreshUserList: function () {
            client.socket.on("RefreshUserList", function (data) {
                homeMain.RemoveUser(data.from);
            });
        }
    }
}

$(function () {
    //f5
    $(window).keydown(function (e) {
        if (e.ctrlKey && e.keyCode == 13) {
            client.events.sendMsgClick();
            e.preventDefault();
        }
    });
    //页面加载完3s后初始化socket事件
    setTimeout(function () {
        if (client.socket == null) {
            client.socket = io.connect(homeMain.socketuurl);
            //client.socket = io.connect('http://121.199.76.210:1233');
        }
        // start connection
        if (!client.socket.connected) {
            client.socket.connect();
        }
        client.methods.retryConnectOnFailure(RETRY_INTERVAL);
        client.events.connectionEvent();
        client.events.onlineEvent();
        client.events.offlineEvent();
        client.events.disconnectEvent();
        client.events.reconnectEvent();
        client.events.toSayEventEvent();
        client.events.checkMsgEvent();
        client.events.kickRoomEvent();
        client.events.recoveryPostEvnet();
        client.events.showDanmuEvent();
        client.events.forceLogOutEvent();
        client.events.RemoveMessageEvent();
        client.events.CheckedMessageEvent();
        client.events.ClientChatSendMessageEvent();
        client.events.NotifyShowVote();
        client.events.NotifyRefrshVote();
        client.events.RefreshUserList();
    }, 3000);
});