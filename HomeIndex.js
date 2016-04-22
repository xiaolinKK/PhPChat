var homeMain = {
    isscroll: true,
    TeacherTimer: null,
    ChatNoticeTimer: null,
    socketuurl: "172.16.15.200:1235",
    ibrowser: {
        iPhone: navigator.userAgent.indexOf('iPhone') > -1,
        iPad: navigator.userAgent.indexOf('iPad') > -1,
        mobile: !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/)
    },
    OnlineData: {
        Title: ko.observable('邮币卡直播室'),
        Count: ko.observable(),
        SaveDesktopUrl: ko.observable(),
        RoomId: ko.observable(0),
        RoomName: ko.observable(),
        randomPoolStr: ko.observable('abcdefghigklmnopqrstuvwxyz1234567890'),
        randomStrLen: ko.observable(8),
        randUN: ko.observable(''),
        isShowAdminMsg: ko.observable(true),
        isKickRoom: null,
        isCheckMsg: ko.observable(true),
        isFilterMsg: ko.observable(true),
        UserId: ko.observable(0),
        //UserName: ko.observable(),
        UserRoleID: ko.observable(0),
        UserRoleName: ko.observable('游客'),
        Disclaimer: ko.observable(),
        ToSay: ko.observable('所有人'),
        ToSayUserId: ko.observable(0),
        SayWord: ko.observable(''),
        PostedFilePath: ko.observable(),
        HelpExplain: ko.observable(),
        PlatformDescription: ko.observable(),
        Token: ko.observable(),
    },
    LoginData: {
        UserName: ko.observable(),
        Password: ko.observable(),
        Code: ko.observable(),
        CodeError: ko.observable('请输入随机码'),
    },
    RegisterData: {
        Email: ko.observable(),
        UserName: ko.observable(),
        Phone: ko.observable(),
        Password: ko.observable(),
        ConfimPassword: ko.observable(),
        Code: ko.observable(),
        CodeError: ko.observable('请输入随机码'),
        RecommendCode: ko.observable(),
        QQ: ko.observable(),
    },
    dataTemplate: {
        'SEND_MSG': '<img src="../../Image/images/face.png" style="vertical-align: middle;width:25px;height:25px;" onclick="" class="face-set" /> <span class="to-user" touserid="0" data-bind="text:OnlineData.ToSay">所有人</span><input type="text" id="SayingInputVal"  data-bind="textInput: OnlineData.SayWord" /><a id="btnSayingTo" href="javascript:void(0);" onclick="client.events.sendMsgClick();">发送</a><div class="clear"></div>',
        'DISABLED_POST': '<div class="disabled-post">当前房间不允许任何人发言</div>'
        , 'PERMISSION_POPUP': '<div id="roomboxc" class="hidden permission-list roombox" > <ul style="color:#333;padding:0px;margin:0px;"> <li onclick="homeMain.toSaying(\'#UserName#\',\'#UserID#\')" class="Hand">对他说</li> <li onclick="homeMain.kickRoom(\'#UserName#\',\'#UserID#\',3600)" class="Hand">禁言1小时</li> <li onclick="homeMain.joinBalckList(\'#UserName#\',\'#UserID#\',1)" class="Hand">封它IP</li><li onclick="homeMain.joinBalckList(\'#UserName#\',\'#UserID#\',2)" class="Hand">加入黑名单</li>  <li onclick="homeMain.kickRoom(\'#UserName#\',\'#UserID#\',300)" class="Hand">禁言5分钟</li> <li onclick="homeMain.recoveryPost (\'#UserName#\',\'#UserID#\')" class="Hand">恢复发言</li><li onclick="homeMain.DelBalckList (\'#UserID#\',\'#UserName#\')" class="Hand">删除黑名单</li></ul></div>'
    },
    wordFilterStr: ko.observableArray(),
    LiveTvs: ko.observableArray(),
    LeftVotes: ko.observableArray(),
    TvFunctions: ko.observableArray(),
    Vips: ko.observableArray(),
    Activitys: ko.observableArray(),
    Messages: ko.observableArray(),
    NewUsers: ko.observableArray(),
    AllUsers: ko.observableArray(),
    ChatMessages: ko.observableArray(),
    NewVips: ko.observableArray(),
    Votes: ko.observableArray(),
    ChatData: {
        ToUserName: ko.observable(),
        ToUserId: ko.observable(0),
        Message: ko.observable(),
        ChatRole: ko.observable(85),
    },
    Query: function () {
        homeMain.OnlineData.SaveDesktopUrl('/Home/SaveDesktop?url=' + window.location.href + '&title=' + homeMain.OnlineData.Title());
    },
    QNewRzZhanFa:function(){
        $.ajax({ url: '/Home/QNewRzZhanFa' }).done(function (results) {
            if (!!results) {
                if (results.length > 0) {                    
                    $("#rzZhanFaSrc").attr("src", results[0].ItemImgUrl);
                    $("#rzZhanFaSrc").attr("title", results[0].ItemTitle);
                }
            }
        });
    },
    QueryNewVips: function () {
        $.ajax({ url: '/Home/QueryNewVips' }).done(function (results) {
            homeMain.NewVips.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.NewVips.push(results[i]);
            }
            //if (homeMain.NewVips().length > 0) {
                homeMain.MarqueePlugin("boxNewVip");
            //}
        });
    },
    QueryLiveTvs: function () {
        $.ajax({ url: '/Home/GetLiveTvList' }).done(function (results) {
            homeMain.LiveTvs.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.LiveTvs.push(results[i]);
            }
        });
    },
    QueryLeftVotes: function () {
        $.ajax({ url: '/Home/QueryLeftVotes' }).done(function (results) {
            homeMain.LeftVotes.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.LeftVotes.push(results[i]);
            }
        });
    },
    QueryTvFunctions: function () {
        $.ajax({ url: '/Home/QueryTvFunctions' }).done(function (results) {
            homeMain.TvFunctions.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.TvFunctions.push(results[i]);
            }
        });
    },
    QueryVips: function () {
        $.ajax({ url: '/Home/QueryVips' }).done(function (results) {
            homeMain.Vips.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.Vips.push(results[i]);
            }
        });
    },
    QueryActivitys: function () {
        $.ajax({ url: '/Home/QueryActivitys' }).done(function (results) {
            homeMain.Activitys.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.Activitys.push(results[i]);
            }
        });
    },
    QueryDisclaimer: function () {
        $.ajax({ url: '/Home/QueryDisclaimer' }).done(function (result) {
            homeMain.OnlineData.Disclaimer(result);
        });
    },
    QueryMessages: function () {
        $.ajaxSetup({ cache: false });
        $.ajax({ url: '/Home/QueryMsgs', async: false }).done(function (results) {
            if (results) {
                var msgHtml = new StringBuilder();
                for (var i = 0; i < results.length; i++) {
                    var item = results[i];
                    if (homeMain.OnlineData.UserRoleID() >= 100) {
                        msgHtml.Append(client.methods.initMsgHtml(item.msgtype, item));
                    } else {
                        if (item.ischeck == 1) {
                            msgHtml.Append(client.methods.initMsgHtml(item.msgtype, item));
                        }
                    }
                }
                $("#Msg").empty();
                $("#Msg").append(msgHtml.toString());
                homeMain.ShowChatPopup();
                $("#MsgListWrapper .msgInfo .sayingMan,.toSayingMan").tooltipster("show");
            }
        });
        $.ajaxSetup({ cache: true });
    },
    ShowChatPopup: function () {
        $("#MsgListWrapper .msgInfo .sayingMan,.toSayingMan").tooltipster({
            delay: 0,
            theme: 'tooltipster-light',
            touchDevices: true,
            trigger: 'hover',
            contentAsHTML: true,
            multiple: true,
            position: 'bottom',
            interactive: true,
            functionBefore: function (origin, continueTooltip) {
                continueTooltip();
                $(".roombox").empty();
                $(".roombox").remove();
                var $this = $(this);
                var uname = $.trim($this.text().replace(':', ''));
                var uid = $this.attr("uid");
                var phtml = homeMain.dataTemplate.PERMISSION_POPUP;
                phtml = phtml.replace(/#UserName#/g, uname);
                phtml = phtml.replace(/#UserID#/g, uid);
                $("body").append(phtml);
                if (parseInt(client.config.roleID()) < 100) {
                    $(".permission-list li").each(function () {
                        $(this).hide();
                    });
                    $(".permission-list li").eq(0).show();
                }
                origin.tooltipster('content', $(".permission-list").html());
            }
        });
    },
    initEmojiHtml: function () {
        $("#ToolBarWapper .face-set").qqFace({
            id: "Facebox",
            assign: 'SayingInputVal',
            path: 'scripts/qqface/emoji/',
        });
    },
    LoadSystemInfos: function () {
        $.ajax({ url: '/Home/LoadSystemInfos' }).done(function (results) {
            homeMain.initRoomPosts(results);
        });
    },
    loadRoomInfo: function () {
        $.ajax({ url: '/Home/LoadRoomInfo' }).done(function (result) {
            if (result) {
                var $data = result;
                homeMain.OnlineData.RoomId($data.Entity.RoomId);
                homeMain.OnlineData.RoomName($data.Entity.RoomName);
                if ($data.User) {
                    homeMain.initUserLoginedHtml($data.User);
                } else {

                    var un = $.cookie("UserName");
                    if (un != null && un != "undefined") {
                        if (un.length != 8) {
                            homeMain.OnlineData.randUN(homeMain.RandomWord(8));
                            $.cookie("UserName", homeMain.OnlineData.randUN(), { expires: 1 });
                            $.cookie("UserRoleID", 0, { expires: 1 });
                        } else {
                            homeMain.OnlineData.randUN(un);
                            $.cookie("UserRoleID", 0, { expires: 1 });
                        }
                    } else {
                        homeMain.OnlineData.randUN(homeMain.RandomWord(8));
                        $.cookie("UserName", homeMain.OnlineData.randUN(), { expires: 1 });
                        $.cookie("UserRoleID", 0, { expires: 1 });
                    }
                    homeMain.OnlineData.UserRoleID(0);
                    $("#RoleList ul").empty();
                    $("#TopbarWapper .topbar-userlogin").show();
                    $("#TopbarWapper .logout").hide();
                    $(".permission-list li").eq(2).hide();
                    if (homeMain.ibrowser.mobile) {
                        if (homeMain.OnlineData.UserRoleID() <= 0) {
                            $(".topbar-userinfo").hide();
                        }
                    }
                    homeMain.PromptAccount();
                    $.cookie("UserLoginId", 0, { expires: 365 });
                }
                if ($data.Entity && $data.Entity.IsDeleted == "0" && $data.Entity.BizStatus == 1) {
                    if (!$data.Entity.IsPrivateChat) {
                        //不允许私聊，权限浮层去掉“对谁说”
                        if (!!$(".permission-list")) {
                            $(".permission-list li").eq(0).hide();
                        }
                        homeMain.OnlineData.isShowAdminMsg($data.Entity.IsShowAdminMsg);
                    } else {
                        if (!!$(".permission-list")) {
                            $(".permission-list li").eq(0).show();
                        }
                    }
                    if ($data.Conf) {
                        if (!!$data.Conf.IsAllowPost || homeMain.OnlineData.isKickRoom != null) {
                            $("#SayingInfoWrapper").empty();
                            $("#SayingInfoWrapper .disabled-post").text("当前房间不允许任何人发言");
                            $("#SayingInfoWrapper").append(homeMain.dataTemplate.DISABLED_POST);
                        } else {
                            homeMain.OnlineData.SayWord('');
                        }
                        if (!$data.Conf.IsAllowTouristPost && (homeMain.OnlineData.UserId() > 0)) {
                            $("#SayingInfoWrapper").empty();
                            $("#SayingInfoWrapper").append(homeMain.dataTemplate.DISABLED_POST);
                            $("#SayingInfoWrapper .disabled-post").text("不允许游客发言，请登录/注册");
                        }
                        if (!$data.Conf.IsUploadFile) {
                            $("#ToolBarWapper .upload-img").hide();
                            $("#txtPostFile").hide();
                        } else {
                            $("#ToolBarWapper .upload-img").show();
                            if (!!$data.Conf && !!$data.Conf.UploadFileSize) {
                                //上传附件体积限制
                            }
                        }
                        if ($data.Conf.Token) {
                            homeMain.OnlineData.Token($data.Conf.Token);
                        }
                        if (!$data.Conf.IsOpenReg) {
                            $("#btnUserReg").attr("disabled", "disabled");
                        } else {
                            //$("#btnUserReg").removeAttr("disabled");
                            if (!!$data.Conf.IsVerifyPhone) {
                                //不显示验证码，显示文字发短信“获取验证码”
                            } else {
                                //显示验证码
                            }
                        }
                        if (!$data.Conf.IsCheckMsg) {
                            homeMain.OnlineData.isCheckMsg(false);
                        }
                        if ($data.Conf.IsFilterMsg) {
                            homeMain.OnlineData.isFilterMsg(true);
                            for (var i = 0; i < $data.Conf.FilterWords.length; i++) {
                                if ($data.Conf.FilterWords[i]) {
                                    homeMain.wordFilterStr.push($data.Conf.FilterWords[i]);
                                }
                            }
                        }
                        if ($data.Conf.ServiceQQs) {
                            var qqs = $data.Conf.ServiceQQs; //eg:4524878-张老师;4524878-张老师;
                            var qqhtml = '';
                            var qqArrary = qqs.split(';').sort(homeMain.RandomSort);
                            for (var i = 0; i < qqArrary.length; i++) {
                                if (qqArrary[i])
                                    if (homeMain.ibrowser.mobile) {
                                        qqhtml += '<a class="mRight10 mLeft10" target="_blank" href="mqq://im/chat?chat_type=wpa&uin=' + qqArrary[i].split('-')[0] + '&version=1&src_type=web"><div class="serverqqlist " qqnum=' + qqArrary[i].split('-')[0] + '><span style=\'padding-left:25px;\'>助理' + qqArrary[i].split('-')[1] + '</span></div></a>';
                                    } else {
                                        qqhtml += '<a class="mRight10 mLeft10" href="tencent://message/?uin=' + qqArrary[i].split('-')[0] + '&amp;Site=www.yyzhiboshi.com&amp;Menu=yes"><div class="serverqqlist " qqnum=' + qqArrary[i].split('-')[0] + '><span style=\'padding-left:25px;\'>助理' + qqArrary[i].split('-')[1] + '</span></div> </a>';
                                    }
                            }
                            $("#ServiceQQs .serviceqq-list").append(qqhtml);

                            var qqArr;
                            $(".serviceqq-list div").each(function () {
                                qqArr += $(this).attr("qqnum") + ",";
                            });
                            qqArr = qqArr.split(',');
                            var iNum = parseInt((qqArr.length - 1) * Math.random());
                            var qqtc = document.createElement('div');
                            qqtc.innerHTML = "<iframe src='tencent://message/?Menu=yes&uin=" + qqArr[iNum] + "&Site=&Service=201' frameborder='0'></iframe>";
                            document.body.appendChild(qqtc);
                            qqtc.style.display = "none";
                            if (homeMain.ibrowser.mobile != true) {
                                setting.methods.initFlyImage();
                            } else {
                                $(".qqmore").hide();
                                $("#ServiceQQs").css("width", "100%");
                                $(".serviceqq-list").css("width", "100%");
                                $("#SayingInputVal").css({ "width": "50%!important", "float": "left" });
                                $("#btnSayingTo").css("float", "left");
                                $("#SayingInfoWrapper").css("position", "relative");
                                $("#SayingInfoWrapper span:eq(1)").css({ "position": "absolute", "left": "100px", "top": "0" });
                                $("#UserLoginDiv,#UserRegDiv").addClass("width1");
                                $("#UserLoginDiv").find(".userlogin-title").next("div").hide();
                                $("#UserRegDiv").find(".userreg-title").next("div").hide();
                            }
                        }
                    }
                    if ($data.Conf && $data.Entity && $data.Conf.IsLock || $data.Entity.RType) {
                        //需要输入房间密码
                    }
                    //bind events
                    $('#SayingInputVal').keydown(function (e) {
                        if (e.keyCode == 13) {
                            client.events.sendMsgClick();
                        }
                    });

                } else {
                    alert("此房间不存在");
                    return false;
                }
            }
        });
    },
    RandomSort: function () {
        return Math.random() > .5 ? -1 : 1;
        //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1  
    },
    RefreshValidateCode: function () {
        $("#UserCodeimg").attr('src', '/Home/GetValidateCode?time=' + (new Date()).getTime());
        $("#UserCodeimg").show();
    },
    RefreshLoginValidateCode: function () {
        $("#LoginUserCodeimg").attr('src', '/Home/GetValidateCode?time=' + (new Date()).getTime());
        $("#LoginUserCodeimg").show();
    },
    ShowRegister: function () {
        $.fancybox.close();
        homeMain.clearForminfo("reg");
        homeMain.RefreshValidateCode();
        $("#UserRegDiv label").empty();
        $("#UserRegDiv img").hide();

        $.fancybox.open($("#UserRegDiv"), {
            //width: 525,
            //height: 550,
            width: '90%',
            height: '70%',
            maxWidth: 525,
            maxHeight: 400,
            minHeight: 550,
            fitToView: false,
            padding: 0,
            margin: 0,
            scrolling: 'no',
            autoSize: false,
            closeClick: false,
            closeBtn: true,
            openEffect: 'none',
            closeEffect: 'none',
            type: 'inline',
            modal: true,
            hideOnOverlayClick: true,
            hideOnContentClick: true,
            overlayShow: true,
            autoScale: true
        });
        if (homeMain.ibrowser.mobile) {
            //$(".fancybox-inner").addClass("heightw");
            $(".userreg-form").parent("div").removeAttr("style");
            $("#UserRegDiv").find("span:eq(2)").remove();
            $(".userreg-form").find("input[type='text'],input[type='password']").addClass("ipwidth mLeft10");
            $("#btnUserReg").addClass("mLeft10");
        }
        $("#UserCodeimg").show();
    },
    userRegister: function () {
        if (homeMain.validateRegInputError()) {
            $.ajax({
                url: '/Home/Register', data: {
                    email: homeMain.RegisterData.Email(), nickName: $.trim(homeMain.RegisterData.UserName()),
                    phone: homeMain.RegisterData.Phone(), password: homeMain.RegisterData.Password(),
                    verifyCode: homeMain.RegisterData.Code(), qq: homeMain.RegisterData.QQ()
                }
            }).done(function (result) {
                if (result) {
                    homeMain.initUserLoginedHtml(result);
                    $.fancybox.close();
                }
            }).fail(function (data) {
                //var htmlDoc = data.responseText;
                //var doms = $.parseHTML(htmlDoc);
                //var msg = doms[1].innerHTML;
                //alert(msg);
                alert("用户名或邮箱或手机号重复啦。");
                //$("#UserEmail").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
                //$("#UserEmail").parents().next().find("img").show();
                //$("#UserEmailError").show();
                //$("#UserTel").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
                //$("#UserTel").parents().next().find("img").show();
                //$("#UserTelError").show();
                //$("#UserNickname").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
                //$("#UserNickname").parents().next().find("img").show();
                //$("#UserNMError").show();
            });
        }
    },
    ShowLogin: function () {
        $("#UserLoginDiv input").val('');
        $("#UserLoginDiv label").empty();
        $("#UserLoginDiv img").hide();
        homeMain.RefreshLoginValidateCode();
        $.fancybox.open($("#UserLoginDiv"), {
            //width: 525,
            //height: 400,
            width: '90%',
            height: '70%',
            maxWidth: 525,
            maxHeight: 400,
            minHeight: 250,
            fitToView: false,
            padding: 0,
            margin: 0,
            scrolling: 'no',
            autoSize: false,
            closeClick: false,
            closeBtn: true,
            openEffect: 'none',
            closeEffect: 'none',
            type: 'inline',
            modal: true,
            hideOnOverlayClick: true,
            hideOnContentClick: true,
            overlayShow: true,
            autoScale: true
        });
        if (homeMain.ibrowser.mobile) {
            $(".fancybox-inner").addClass("heightw");
            $(".userlogin-form").find("input[type='text'],input[type='password']").addClass("ipwidth");
        }
    },
    ShowImage: function (href) {
        var wd = "";
        var hd = "";
        var theImage = new Image();
        theImage.src = href;
        if (theImage.width > 800) {
            wd = 800;
        }
        if (theImage.height > 600) {
            hd = 600;
        }
        if (homeMain.ibrowser.mobile) {
            if (theImage.width > 200 || theImage.height > 200) {
                wd = "200px";
                hd = "200px";
            }
        }
        var image = "<img src=" + href + " width=" + wd + " height=" + hd + " ><\img>";
        $.fancybox.open(image, {
            width: theImage.width,
            height: theImage.height,
            fitToView: false,
            padding: 0,
            margin: 0,
            minHeight: 0,
            minWidth: 0,
            maxWidth: 800,
            maxHeight: 600,
            scrolling: 'no',
            autoSize: true,
            closeClick: false,
            closeBtn: true,
            autoDimensions: true,
            autoScale: false,
            openEffect: 'none',
            closeEffect: 'none',
            type: 'inline'
        });
        theImage.src = "";
        theImage = null;
    },
    userLogin: function () {
        var username = $.trim(homeMain.LoginData.UserName());
        var upwd = homeMain.LoginData.Password();
        if (homeMain.validateLoginInputError()) {
            $.ajax({ url: '/Home/UserLogin', type: "POST", async: false, data: { userName: username, password: upwd } }).done(function (result) {
                if (result == 1) {
                    alert("用户名或密码不正确！");
                }
                else if (result == 2) {
                    window.location.href = '/Home/Invalid';
                } else if (result) {
                    var old = homeMain.OnlineData.randUN();
                    homeMain.OnlineData.randUN(username);
                    $.cookie("UserName", result.UserName, { expires: 30 });
                    for (var i = 0; i < result.RoleList.length; i++) {
                        if (result.RoleList[i].RoleID >= 100) {
                            setting.methods.initSettingVis();
                        }
                    }
                    if ($(window).width() <= 400) {
                        $(".topbar-userinfo").show();
                    }
                    setting.methods.initTheme();
                    homeMain.initUserLoginedHtml(result);
                    setting.methods.initVote();
                    if (client.socket) {
                        homeMain.UserOnLine();
                        client.socket.emit('onlineEvent', {
                            roomid: homeMain.OnlineData.RoomId(),
                            uid: homeMain.OnlineData.UserId(),
                            from: homeMain.OnlineData.randUN(),
                            rid: homeMain.OnlineData.UserRoleID(),
                        });

                        client.socket.emit('RefreshUserList', {
                            roomid: homeMain.OnlineData.RoomId(),
                            uid: 0,
                            from: old,
                            roleid: 0,
                            socketid: (client.socket.id || "")
                        });
                    }
                    homeMain.QueryMessages();

                    $.fancybox.close();
                    setting.methods.settingevent();
                    if (homeMain.isscroll) {
                        $(".nano").nanoScroller();
                        $(".nano").nanoScroller({ scroll: 'bottom' });
                    }
                    homeMain.QueryVotes();
                    homeMain.clearPrivateChatState();
                }
            }).fail(function (data) {
                // var htmlDoc = data.responseText;
                // var doms = $.parseHTML(htmlDoc);
                //var msg = doms[1].innerHTML;
                alert("用户名或密码不正确！");
            });
        }

    },
    userLogout: function () {
        $.ajax({ url: '/Home/Logout', type: "POST", async: false }).done(function (result) {
            homeMain.OnlineData.randUN(homeMain.RandomWord(homeMain.OnlineData.randomStrLen()));
            $.cookie("UserName", homeMain.OnlineData.randUN(), { expires: 1 });
            $.cookie("UserRoleID", 0, { expires: 1 });
            homeMain.OnlineData.UserRoleID(0);
            window.location.reload();
        });
        if (client.socket)
            client.socket.emit('disconnect');
    },
    RandomWord: function (num) {
        var str = "",
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        for (var i = 0; i < num; i++) {
            var pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    },
    InitStartUserItem: function () {
        var un = $.cookie("UserName");
        if (un != null && un != "undefined") {
            homeMain.OnlineData.randUN(un);
            homeMain.OnlineData.UserRoleID($.cookie("UserRoleID"));
        } else {
            homeMain.OnlineData.randUN(homeMain.RandomWord(homeMain.OnlineData.randomStrLen()));
            $.cookie("UserName", homeMain.OnlineData.randUN(), { expires: 1 });
            $.cookie("UserRoleID", 0, { expires: 1 });
            homeMain.OnlineData.UserRoleID(0);
        }
    },
    initUserLoginedHtml: function (useritem) {
        if (useritem) {
            $.cookie("UserLoginId", useritem.UserID, { expires: 365 });
            homeMain.OnlineData.UserId(useritem.UserID);
            homeMain.OnlineData.randUN(useritem.UserName);
            if (useritem.RoleList && useritem.RoleList.length > 0) {
                homeMain.OnlineData.UserRoleID(useritem.RoleList[0].RoleID);
                $.cookie("UserRoleID", useritem.RoleList[0].RoleID, { expires: 1 });
                homeMain.OnlineData.UserRoleName(useritem.RoleList[0].RoleName);
                if (useritem.RoleList.length > 1) {
                    var roleStr = '';
                    for (var i = 0; i < useritem.RoleList.length; i++) {
                        roleStr += '<li roleid="' + useritem.RoleList[i].RoleID + '" nickname="' + useritem.RoleList[i].NickName + '" onclick="homeMain.changeUserRole(this);">' + useritem.RoleList[i].RoleName + '</li>';
                    }
                    $("#RoleList ul").append(roleStr);
                }
                if (homeMain.OnlineData.UserRoleID() > 100) {
                    $(".onlineWrapper").removeClass("hidden");
                }
            }
            $("#usersextheme").show();
            if (homeMain.ibrowser.mobile) {
                $("#TopbarWapper .topbar-userlogin").hide();
                $(".topbar-userinfo").find(".roles-name").hide();
                $(".user-id").parent("b").hide();
                $(".user-name").css("width", "50px");
            } else {
                $("#TopbarWapper .topbar-userlogin").hide();
            }
            $("#TopbarWapper .logout").show();
            $(".permission-list li").eq(2).show();
            setting.methods.settingevent();
        } else {
            $("#RoleList ul").empty();
            $("#TopbarWapper .topbar-userlogin").show();
            $("#TopbarWapper .logout").hide();
            $(".permission-list li").eq(2).hide();
        }
    },
    showUserRole: function () {
        $("#TopbarWapper .roles-name,#RoleList").mouseover(function () {
            if ($("#RoleList li").length > 0) {
                $("#RoleList").show();
            } else {
                $("#RoleList").hide();
            }
        }).mouseout(function () {
            $("#RoleList").hide();
        });
    },
    changeUserRole: function (jobj) {
        if ($(jobj).attr("roleid") == homeMain.OnlineData.UserRoleID() || !$(jobj).attr("nickname")) return;
        client.socket.emit('disconnect');
        homeMain.OnlineData.randUN($(jobj).attr("nickname"));
        homeMain.OnlineData.UserRoleName($(jobj).text());
        homeMain.OnlineData.UserRoleID($(jobj).attr("roleid"));
        $.ajax({ url: '/Home/ChangeUserRole', data: { userName: $("#TopbarWapper .user-name").text(), roleId: $("#hidRoleID").val() } }).done(function (result) {
            client.socket.emit('onlineEvent', {
                roomid: homeMain.OnlineData.RoomId(),
                uid: homeMain.OnlineData.UserId(),
                from: homeMain.OnlineData.randUN(),
                rid: homeMain.OnlineData.UserRoleID()
            });
            homeMain.QueryMessages();
        });
    },
    isValExists: function (value, vType, content) {
        $.ajax({ url: '/Home/HasValExitsts', data: { value: value, type: vType } }).done(function (result) {
            if (result && !result.IsSuccess) {
                $(content).text(result.Message);
                $(content).show();
            } else {
                $(content).empty();
            }
        });
        return false;
    },
    clearForminfo: function (ftype) {
        switch (ftype) {
            case "reg":
                $("#UserRegDiv input").val('');
                break;
            case "login":
                $("#UserLoginDiv input").val('');
                break;
        }
    },
    isValidateCode: function (code) {
        if (code && code.length > 0) {
            $.ajax({ url: '/Home/ValidateCode', type: "POST", async: false, data: { code: code } }).done(function (result) {
                if (result && !result.IsSuccess) {
                    homeMain.RegisterData.CodeError(result.Message);
                    return false;
                } else {
                    homeMain.RegisterData.CodeError('');
                    return true;
                }
            });
        }
    },
    isLoginValidateCode: function (code) {
        if (code && code.length > 0) {
            $.ajax({ url: '/Home/ValidateCode', type: "POST", async: false, data: { code: code } }).done(function (result) {
                if (result && !result.IsSuccess) {
                    homeMain.LoginData.CodeError(result.Message);
                    return false;
                } else {
                    homeMain.LoginData.CodeError('');
                    return true;
                }
            }).fail(function (data) {
                return false;
            });
        } else {
            return false;
        }
    },
    validateRegInputError: function () {
        var errorNum = 0;
        var tmpVal = $("#UserEmail").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined') {
            alert("注册邮箱不能空");
            $("#UserEmailError").text('注册邮箱不能空');
            errorNum++;
        } else if (!RegExp.isEmail(tmpVal)) {
            alert("请输入有效邮箱");
            $("#UserEmailError").text('请输入有效邮箱');
            errorNum++;
        } else if (homeMain.isValExists(tmpVal, 'Email', '#UserEmailError')) {
            alert("此邮箱已经被占用");
            $("#UserEmailError").text('此邮箱已经被占用');
            errorNum++;
        } else {
            errorNum = 0;
        }
        if (errorNum > 0) {
            $("#UserEmail").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
            $("#UserEmail").parents().next().find("img").show();
            $("#UserEmailError").show();
            return false;
        } else {
            $("#UserEmail").parents().next().find("img").attr("src", "../../Image/images/icon_reg_right.png");
            $("#UserEmail").parents().next().find("img").show();
            $("#UserEmailError").empty();
        }
        var tmpVal = $("#UserNickname").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined') {
            $("#UserNMError").text('昵称不能空');
            alert("昵称不能空");
            errorNum++;
        } else if (RegExp.isContainSpecial(tmpVal)) {
            $("#UserNMError").text('昵称只支持数字，字母和_组合');
            alert("昵称只支持数字，字母和_组合");
            errorNum++;
        } else if (tmpVal.length > 64) {
            $("#UserNMError").text('昵称长度不允许超出64个字符');
            alert("昵称长度不允许超出64个字符");
            errorNum++;
        } else if (tmpVal.length < 4) {
            $("#UserNMError").text('昵称长度不允许少于4个字符');
            alert("昵称长度不允许少于4个字符");
            errorNum++;
        } else if (homeMain.isValExists(tmpVal, 'UserName', '#UserNMError')) {
            $("#UserNMError").text('此昵称太火，已被注册');
            alert("此昵称太火，已被注册");
            errorNum++;
        } else {
            errorNum = 0;
        }
        if (errorNum > 0) {
            $("#UserNickname").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
            $("#UserNickname").parents().next().find("img").show();
            $("#UserNMError").show();
            return false;
        } else {
            $("#UserNickname").parents().next().find("img").attr("src", "../../Image/images/icon_reg_right.png");
            $("#UserNickname").parents().next().find("img").show();
            $("#UserNMError").empty();
        }

        var tmpVal = $("#UserTel").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined') {
            $("#UserTelError").text('手机号不能空');
            alert("手机号不能空");
            errorNum++;
        } else if (!RegExp.isMobile(tmpVal)) {
            $("#UserTelError").text('请输入有效手机号');
            alert("请输入有效手机号");
            errorNum++;
        } else if (homeMain.isValExists(tmpVal, 'Telephone', '#UserTelError')) {
            $("#UserTelError").text('此手机号已经注册');
            alert("此手机号已经注册");
            errorNum++;
        } else {
            errorNum = 0;
        }
        if (errorNum > 0) {
            $("#UserTel").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
            $("#UserTel").parents().next().find("img").show();
            $("#UserTelError").show();
            return false;
        } else {
            $("#UserTel").parents().next().find("img").attr("src", "../../Image/images/icon_reg_right.png");
            $("#UserTel").parents().next().find("img").show();
            $("#UserTelError").empty();
        }
        var tmpVal = $("#UserPwd").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined') {
            alert("密码不能空");
            $("#UserPwdError").text('密码不能空');
            errorNum++;
        } else if (tmpVal.length < 6) {
            alert("密码长度不允许少于6位");
            $("#UserPwdError").text('密码长度不允许少于6位');
            errorNum++;
        } else if (tmpVal.length > 12) {
            alert("'密码长度不允许大于12位");
            $("#UserPwdError").text('密码长度不允许大于12位');
            errorNum++;
        } else {
            errorNum = 0;
        }
        if (errorNum > 0) {
            $("#UserPwd").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
            $("#UserPwd").parents().next().find("img").show();
            $("#UserPwdError").show();
            return false;
        } else {
            $("#UserPwd").parents().next().find("img").attr("src", "../../Image/images/icon_reg_right.png");
            $("#UserPwd").parents().next().find("img").show();
            $("#UserPwdError").empty();
        }

        var tmpVal = $("#UserRepwd").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined') {
            alert("密码不能空");
            $("#UserRePwdError").text('密码不能空');
            errorNum++;
        } else if (tmpVal.length < 6) {
            $("#UserRePwdError").text('密码长度不允许少于6位');
            alert("密码长度不允许少于6位");
            errorNum++;
        } else if (tmpVal.length > 12) {
            $("#UserRePwdError").text('密码长度不允许大于12位');
            alert("密码长度不允许大于12位");
            errorNum++;
        } else if (tmpVal != $("#UserPwd").val()) {
            $("#UserRePwdError").text('两次输入的密码不一致');
            alert("两次输入的密码不一致");
            errorNum++;
        } else {
            errorNum = 0;
        }
        if (errorNum > 0) {
            $("#UserRepwd").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
            $("#UserRepwd").parents().next().find("img").show();
            $("#UserRePwdError").show();
            return false;
        } else {
            $("#UserRepwd").parents().next().find("img").attr("src", "../../Image/images/icon_reg_right.png");
            $("#UserRepwd").parents().next().find("img").show();
            $("#UserRePwdError").empty();
        }
        var tmpVal = $("#UserRandcode").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined') {
            homeMain.RegisterData.CodeError('请输入短信验证码');
            alert("请输入短信验证码");
            return false;
        }
        if ($.cookie("RegisterCode") == null || $.cookie("RegisterCode") !== homeMain.RegisterData.Phone() + homeMain.RegisterData.Code()) {
            homeMain.RegisterData.CodeError('短信验证码不正确');
            alert("短信验证码不正确");
            return false;
        }

        if ($("#UserEmail").val() === "" || $("#UserNickname").val() === "" || $("#UserTel").val() === "" || $("#UserPwd").val() === "" || $("#UserRepwd").val() === "" || $("#UserRandcode").val() === "") {
            return false;
        } else {
            return true;
        }

    },
    validateLoginInputError: function () {
        var tmpVal = $("#UserName").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined' || tmpVal == '昵称/邮箱') {
            $("#lblUserName").text('请输入用户名');
            alert("请输入用户名");
            $("#UserName").parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
            $("#UserName").parents().next().find("img").show();
            $("#lblUserName").show();
            return false;
        } else {
            $("#UserName").parents().next().find("img").attr("src", "../../Image/images/icon_reg_right.png");
            $("#UserName").parents().next().find("img").show();
            $("#lblUserName").empty();
        }
        var tmpVal = $("#UserPassword").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined') {
            $("#lblUPwd").text('请输入密码');
            alert("请输入密码");
            $(this).parents().next().find("img").attr("src", "../../Image/images/icon_reg_error.png");
            $(this).parents().next().find("img").show();
            $("#lblUPwd").show();
            return false;
        } else {
            $(this).parents().next().find("img").attr("src", "../../Image/images/icon_reg_right.png");
            $(this).parents().next().find("img").show();
            $("#lblUPwd").empty();
        }

        var tmpVal = $("#LoginUserRandcode").val();
        if (!tmpVal || tmpVal == '' || tmpVal == 'undefined') {
            homeMain.LoginData.CodeError('请输入随机码');
            alert("请输入验证码");
            return false;
        }
        else {
            homeMain.isLoginValidateCode(tmpVal);
        }
        if (homeMain.LoginData.CodeError() || $("#UserName").val() === "" || $("#UserPassword").val() === "") {
            return false;
        } else {
            return true;
        }
    },
    toSaying: function (un, uid) {
        if (un && uid) {
            homeMain.OnlineData.ToSay(un);
            homeMain.OnlineData.ToSayUserId(uid);
        }
    },
    kickRoom: function (un, uid, sec) {
        if (un && !isNaN(sec) && sec > 0) {
            var data = {
                roomid: homeMain.OnlineData.RoomId(),
                uid: uid,
                from: un,
                time: sec * 1000
            };
            client.socket.emit('kickRoomEvent', data);
            var type = sec == 3600 ? 1 : 2;
            homeMain.UserOneHourGag(un, uid, type);
            //homeMain.OnlineData.isKickRoom = setTimeout(function () {
            //    homeMain.OnlineData.SayWord('');
            //    homeMain.OnlineData.isKickRoom = null;
            //}, (sec * 1000));
            //alert("禁言成功");
        }
    },
    joinBalckList: function (un, uid, type) {
        if (un && un !== "undefined" && uid && uid != "undefined") {
            //if (uid > 0 || userName) {
            $.ajax({ url: '/Home/JoinBlackList', data: { userId: uid, userName: un, type: type } }).done(function (result) {
                if (!result) {
                    alert("该用户已被加入黑名单，无需重复加入！");
                    return false;
                }
                var data = {
                    roomid: homeMain.OnlineData.RoomId(),
                    uid: uid,
                    from: un,
                };
                client.socket.emit('forceLogOutEvent', data);
                alert("添加成功");
                return true;
            });
            //}

        }
    },
    //加入临时黑名单方法
    joinLastBalckList: function (un, uid, type) {
        if (un && un !== "undefined" && uid && uid != "undefined") {
            //if (uid > 0 || userName) {
            $.ajax({ url: '/Home/JoinLastBlackList', data: { userId: uid, userName: un, type: type } }).done(function (result) {
                if (!result) {
                    return false;
                }
                var data = {
                    roomid: homeMain.OnlineData.RoomId(),
                    uid: uid,
                    from: un,
                };
            });
            //}

        }
    },
    DelBalckList: function (uid, username) {
        if (uid && uid != "undefined") {
            $.ajax({ url: '/Home/DelBlackList', data: { userId: uid, userName: username } }).done(function (result) {
                alert("删除成功！");
                return true;
            });
        } else {
            alert("删除失败");
            return false;
        }
    },
    recoveryPost: function (un, uid) {
        if (!!un && !!uid) {
            var data = {
                roomid: homeMain.OnlineData.RoomId(),
                uid: uid,
                from: un
            };
            homeMain.ClearUserGag(un, uid);
            client.socket.emit('recoveryPostEvent', data);
            //alert("恢复发言成功");
        }
    },
    clearScreen: function () {
        $("#MsgListWrapper #Msg").empty();
    },
    scrollScreen: function (e) {
        this.isscroll = !this.isscroll;
        if (!this.isscroll) $("#isscroll").addClass("noscroll");
        if (this.isscroll) $("#isscroll").removeClass("noscroll");
    },
    initRoomPosts: function (postDat) {
        if (postDat) {
            var col1Html = new StringBuilder();
            var col2Html = new StringBuilder();
            for (var i = 0; i < postDat.length; i++) {
                var item = postDat[i];
                //0：其他，1：房间公告，2：服务通知，3：飞屏，4：首屏弹图
                //var time = item.SendTime? new Date(item.SendTime):null;
                switch (item.InfoType) {
                    case 1:
                        //if (item.SendTime) {
                        //   time = time.getMonth() + "." + time.getDate();
                        //}
                        col1Html.Append('<div class="notice-info overflow_ellipsis" postid="' + item.SysInfoID + '">' + item.InfoContent + '</div>');
                        break;
                    case 2:
                        //if (!!item.SendTime) {
                        //    time = time.getMinutes() + ":" + time.getSeconds();
                        //}
                        //col2Html.Append('<span class="serviceTime">' + time + '</span>');
                        col2Html.Append('<span id="ServiceMsg">' + item.InfoContent + '</span>');
                        //col2Html.Append('<span class="service-infoMore" onclick="homeMain.showCompletePost();" actualheight="0"></span>');
                        break;
                }
            }
            $("#RoomPosts").append(col1Html.toString());
            $(".service-info").append(col2Html.toString());
            $(".service-infoMore").attr("actualheight", $("#ServiceMsg").height());
            //if ($("#ServiceMsg").height() > 32) {
            //    $("#ServiceMsg").height(32);
            //    $(".service-infoMore").show();
            //} else {
            //    $(".service-infoMore").hide();
            //}
            var roomScroll = new Marquee("RoomPosts");
            //roomScroll.Direction = "left";
            //roomScroll.Step = 2;
            roomScroll.Width = $("#RoomPosts").width() - 30;
            roomScroll.Height = 36;
            roomScroll.Timer = 30;
            roomScroll.DelayTime = 4000;
            roomScroll.WaitTime = 2000;
            roomScroll.Start();
        }
    },
    showCompletePost: function () {
        var heig = $(".service-infoMore").attr("actualheight");
        var hh = $("#ServiceMsg").height();
        if (heig <= hh) {
            $("#ServiceMsg").height("22");
            $("#ChatMsgWrapper .service-info").height("22");
            $("#ChatMsgWrapper .service-infoMore").css("background", "url('/Image/images/down_arrow_black.png')");
            $("#ChatMsgWrapper .service-infoMore").css("top", -12);
            //$("#ServiceQQs").css("margin-top", "30px"); 
        }
        else {
            $("#ServiceMsg").height(heig);
            $("#ChatMsgWrapper .service-info").height(heig);
            $("#ChatMsgWrapper .service-infoMore").css("background", "url('/Image/images/up_arrow_black.png')");
            $("#ChatMsgWrapper .service-infoMore").css("top", -22);
            $("#ServiceQQs").css("margin-top", "15px");
        }
    },
    showMoreServiceQQ: function () {
        var hei = $("#ServiceQQs .serviceqq-list").height();
        var actHei = $("#ServiceQQs .serviceqq-More").attr("actualheight");
        if (actHei <= hei) {
            $("#ServiceQQs").height("40");
            $("#ServiceQQs .serviceqq-list").height("32");
            //$("#ServiceQQs .serviceqq-More").css("background", "url('/Image/images/qq_more_plus.png')");
        } else {
            $("#ServiceQQs").height(actHei);
            $("#ServiceQQs .serviceqq-list").height(actHei);
            //$("#ServiceQQs .serviceqq-More").css("background", "url('/Image/images/qq_more_less.png')");
        }
    },
    UploadPostFile: function () {
        $("#txtPostFile").fileupload({
            url: '/Home/UploadFile',
            autoUpload: true,
            type: 'POST',
            dataType: 'json',
            acceptFileTypes: '/(\.|\/)(jpg|jpeg|png|bmp|gif)$/i',
            done: function (e, data) {
                if (data.result) {
                    homeMain.OnlineData.PostedFilePath(data.result);
                    var pattern = /\[pf_url\]/gm,
                        str = '[pf_url]';
                    if (!pattern.test($("#SayingInputVal").val())) {
                        homeMain.OnlineData.SayWord(homeMain.OnlineData.SayWord() + "[pf_url]");
                    }
                } else {
                    alert("你上传的图片不符合要求（图片最大2M）。");
                    homeMain.OnlineData.PostedFilePath("");
                }
            }
        });
    },
    clearToUser: function () {
        homeMain.OnlineData.ToSay("所有人");
        homeMain.OnlineData.ToSayUserId(0);
        $(".to-user").tooltipster("destroy");
    },
    Refresh: function () {
        var src = $("#MainLiveTVWapper .video-wrapper embed").attr("src");
        var embed = '<embed src=' + src + ' quality="high" bgcolor="#000000" wmode="transparent" width="100%" height="100%" name="_GS_FLASH_ID_videoComponent" align="middle" play="true" loop="false"  allowscriptaccess="always" allowfullscreen="true"  type="application/x-shockwave-flash" flashvars="sc=0&amp;entry=http%3A%2F%2Fguijinshuzhibo.gensee.com%2Fwebcast&amp;code=83688736907b49e582fd1b868b10fcbc__0b2104d1c7214d3aa4a45560e090256e&amp;lang=&amp;nickName=visitor_cDiP6B&amp;httpMode=false&amp;group=&amp;widgetid=videoComponent&amp;userdata=&amp;showCBar=&amp;backURI=&amp;ver=4.0&amp;publicChat=&amp;init=&amp;liveImprovedMode=false&amp;visible=true" > ';
        $("#MainLiveTVWapper .video-wrapper embed").remove();
        $("#MainLiveTVWapper .video-wrapper object").append(embed);
    },
    SendSmsByPhone: function () {
        if (!homeMain.RegisterData.Phone()) {
            alert("请输入手机号");
        }
        $.ajax({ url: '/Account/SendSmsByPhone', data: { phone: homeMain.RegisterData.Phone(), token: homeMain.OnlineData.Token() } }).done(function (result) {
            if (result) {
                $("#btnMoblie").html("己发送");
                $("#btnMoblie").attr("disabled", "disabled");
                setTimeout(function () {
                    $("#btnMoblie").removeAttr("disabled");
                    $("#btnMoblie").html("发送验证码");
                }, 60000);
            } else {

            }
        });
    },
    AddBookmark: function () {
        try {
            window.external.AddFavorite(window.location.href, homeMain.OnlineData.Title());
        } catch (e) {
            try {
                window.sidebar.addPanel(homeMain.OnlineData.Title(), window.location.href, "");
            } catch (e) {
                alert("浏览器收藏没有成功，请使用Ctrl+D进行添加!");
            }
        }
        return false;
    },
    ClearUserGag: function (un, uid) {
        $.ajax({
            url: "/Home/RemoveUserGag",
            data: { name: un, userid: uid }
        }).done(function (data) {
            if (data) {
                alert("恢复发言成功");
            }
        });
    },
    QueryUserGag: function () {
        $.ajax({
            url: "/Home/CheckUserGag",
            data: { name: homeMain.OnlineData.randUN(), userid: homeMain.OnlineData.UserId }
        }).done(function (data) {
            if (data) {
                homeMain.OnlineData.SayWord('');
                homeMain.OnlineData.isKickRoom = null;
                $("#SayingInfoWrapper").empty();
                $("#SayingInfoWrapper").append(homeMain.dataTemplate.DISABLED_POST);
                $("#SayingInfoWrapper .disabled-post").text("你已被禁言，请联系管理员");
            }
        });
    },
    UserOneHourGag: function (un, uid, type) {
        $.ajax({
            url: "/Home/UserOneHourGag",
            data: { name: un, userid: uid, type: type }
        }).done(function (data) {
            if (data) {
                alert("己禁言");
            }
        });
    },
    Init: function () {

        homeMain.InitStartUserItem();
        homeMain.Query();
        homeMain.QueryNewVips();
        homeMain.QNewRzZhanFa();
        //homeMain.QueryLiveTvs();
        //homeMain.QueryLeftVotes();
        //homeMain.QueryTvFunctions();
        //homeMain.QueryVips();
        homeMain.QueryActivitys();
        homeMain.loadRoomInfo();
        homeMain.showUserRole();
        homeMain.QueryMessages();
        homeMain.LoadSystemInfos();
        homeMain.QueryDisclaimer();
        homeMain.UploadPostFile();
        homeMain.QueryVotes();
        homeMain.QueryUserGag();
        homeMain.AddUserActionLog();     
    },
    InitContext: function () {
        $("#MsgListWrapper").nanoScroller({
            preventPageScrolling: true,
            alwaysVisible: true,
            sliderMinHeight: 200
        });
        $("#MsgListWrapper").nanoScroller({ scroll: 'bottom' });
        $("#SubColumnsMenu a").click(function () {
            var $this = $(this);
            var id = $this.attr("divid");
            var divs = $this.parent().children();
            $("#SubColumnsMenu").children().each(function (i, item) {
                $(item).removeClass("sbuColumn-active");
            });
            $this.addClass("sbuColumn-active");
            $(divs).each(function (i, item) {
                var old = $(item).attr("divid");
                if (old == id) {
                    $("#" + id).show();
                } else {
                    $("#" + old).hide();
                }
            });
        });
        $(".to-user").mouseover(function () {
            if (homeMain.OnlineData.ToSay() != "所有人") {
                $(".to-user").tooltipster({
                    delay: 0,
                    theme: 'tooltipster-light',
                    content: '<a href="javascript:void(0);" style="display:inline-block;text-decoration:none;cursor:pointer;" onclick="homeMain.clearToUser()">删除</a>',
                    touchDevices: true,
                    trigger: 'hover',
                    contentAsHTML: true,
                    multiple: true,
                    position: 'bottom',
                    interactive: true,
                });
                $(".to-user").tooltipster("show");
            }
        }).mouseout(function () {
            $("#ClearToName").hide();
        });
        $(".face-set").qqFace({
            id: "Facebox",
            assign: 'SayingInputVal',
            path: '../../Scripts/qqface/emoji/',
        });
        $('input').placeholder();
        var upcount = 0;
        var downcount = 0;
        var oldvalue = 0;
        var isdown = false;
        $("#dofly").bind('mousewheel', function (event, delta) {
            //console.log("event:" + event + "delta:" + delta);
            var height = $(".nano").height();
            if (delta > 0) { //往上滚动
                if (!oldvalue) upcount++;
                if (downcount > 1) downcount--; isdown = false;
                var upY = height - (upcount * 40);
                if (upY < 0) {
                    upY = 0;
                    downcount = 1;
                    oldvalue = true;
                } else {
                    oldvalue = false;
                }
                $(".nano").nanoScroller({ scrollTop: upY });
            } else { //
                if (!isdown) downcount++;
                if (upcount > 1) upcount--;
                var downY = height - (downcount * 40);
                if (downY < 0) {
                    downY = 0;
                    upcount = 1;
                    oldvalue = false;
                    isdown = true;
                } else {
                    isdown = false;
                }
                $(".nano").nanoScroller({ scrollBottom: downY });
            }
        });

        $(".tvcolumn").hover(function () {
            clearInterval(homeMain.TeacherTimer);
        }, function () {
            homeMain.SlideSwitch();
        });
    },
    SlideSwitch: function () {
        var iNow = 0;
        homeMain.TeacherTimer = setInterval(function () {
            iNow++;
            if (iNow > $(".tvcolumn dl").length - 1) {
                iNow = 0;
            };
            $(".tvcolumn dl").removeClass('current');
            $(".tvcolumn dl").eq(iNow).addClass('current');
        }, 3000);
    },
    IreSize: function () {
        $("#MainContent").height($(window).innerHeight() - 50);
        $("#ChatMsgWrapper").height($(window).innerHeight() - 100);
        $("#MsgListWrapper").height($("#ChatMsgWrapper").height() - $("#ServiceQQs").height() - $("#ToolBarWapper").height() - $("#ClearToName").height() - $("#SayingInfoWrapper").height() - 70);
        ///计算聊天区域宽度【加入第一列隐藏则用当前窗口宽度减去视频区域宽度】
        if ($("#SysColumnWapper").is(":hidden")) {
            $("#MainChatWapper").width($("#MainContent").width() - $("#MainLiveTVWapper").width() - 40);
        } else {
            $("#MainChatWapper").width($("#MainContent").width() - $("#SysColumnWapper").width() - $("#MainLiveTVWapper").width() - 40);
        }
        if (homeMain.ibrowser.mobile == true) {
            $("#MainChatWapper").height($("#MainContent").height() - $("#MainLiveTVWapper").height());
            $("#ChatMsgWrapper").height($("#MainChatWapper").height() - 42);
            $("#MsgListWrapper").height($("#ChatMsgWrapper").height() - 150);
        }
        if ($(".subcolumn-wrapper ").is(":hidden")) {
            $(".MainLiveTVWapper").height($(".video-content").height());
        }
        $("#RoomPosts").width($("#MainChatWapper").width() - 40 - $("#RoomNoticeWrapper img").width());
        $("#weixinCode").height($("#SysColumnWapper").height() - $("#SysColumnWapper .title").height() - $(".column-TVfnuctions:eq(0)").height() - $(".column-TVfnuctions:eq(1)").height());
        //alert($("#MsgListWrapper").height());
        $("#dofly").height($("#MsgListWrapper").height());
        $(".video-content").height($(".video-wrapper").height());
        $(".subcolumn-wrapper ").height($("#MainLiveTVWapper").height() - $(".video-content").height() - 10);
        $("#JoinUs,#PlatformDescription,#HelpExplain,#TeacherTeam,#JoinUs img").height($(".subcolumn-wrapper").height() - 36);
    },
    NoWinError: function () {
        var oldError = window.onerror;
        window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
            if (oldError)
                return oldError(errorMsg, url, lineNumber);
            return false;
        }
    },
    //Chat function
    IsMyUser: function (userId, userName, msgCount) {
        $.ajax({ url: '/Home/IsMyUser', data: { userName: userName } }).done(function (result) {
            if (result) {
                //new user     
                for (var i = 0; i < homeMain.NewUsers().length; i++) {
                    var mins = homeMain.MinDiff(homeMain.NewUsers()[i].Start, new Date());
                    if (mins > 1 || homeMain.NewUsers()[i].UserName == userName) {
                        homeMain.NewUsers.remove(homeMain.NewUsers()[i]);
                    }
                }
                //all user
                for (var i = 0; i < homeMain.AllUsers().length; i++) {
                    if (homeMain.AllUsers()[i].UserName == userName) {
                        msgCount = homeMain.AllUsers()[i].MsgCount + msgCount;
                        homeMain.AllUsers.remove(homeMain.AllUsers()[i]);
                    }
                }
                var user = { UserId: userId, UserName: userName, MsgCount: msgCount, Start: new Date() };
                homeMain.InitChatUser(user);
                homeMain.NewUsers.push(user);
                homeMain.AllUsers.push(user);
            }
        });
    },
    IsMyAssistant: function (userId, userName, msgCount) {
        $.ajax({ url: '/Home/IsMyAssistant', data: { userId: userId, myName: homeMain.OnlineData.randUN() } }).done(function (result) {
            if (result) {
                //all user
                for (var i = 0; i < homeMain.AllUsers().length; i++) {
                    if (homeMain.AllUsers()[i].UserName == userName) {
                        msgCount = homeMain.AllUsers()[i].MsgCount + msgCount;
                        homeMain.AllUsers.remove(homeMain.AllUsers()[i]);
                    }
                }
                var user = { UserId: userId, UserName: userName, MsgCount: msgCount, Start: new Date() };
                homeMain.InitChatUser(user);
                homeMain.AllUsers.push(user);
            }
        });
    },
    AddNewUser: function (userId, userName, msgCount) {
        if (userName == homeMain.OnlineData.randUN())
            return;
        if (homeMain.OnlineData.UserRoleID() != homeMain.ChatData.ChatRole()) {
            homeMain.IsMyAssistant(userId, userName, msgCount);
        }
        else
            homeMain.IsMyUser(userId, userName, msgCount);
    },
    MinDiff: function (start, end) {
        try {
            var diff = new Date(end - start);
            var mins = diff / 1000 / 60;
            return mins;
        } catch (e) {
            return 0;
        }
    },
    RemoveUser: function (userName) {
        //new user     
        for (var i = 0; i < homeMain.NewUsers().length; i++) {
            if (homeMain.NewUsers()[i].UserName == userName) {
                homeMain.NewUsers.remove(homeMain.NewUsers()[i]);
            }
        }
        //all user
        for (var i = 0; i < homeMain.AllUsers().length; i++) {
            if (homeMain.AllUsers()[i].UserName == userName) {
                homeMain.AllUsers.remove(homeMain.AllUsers()[i]);
            }
        }
    },
    QueryChatMessage: function (toUserName) {
        $.ajax({ url: '/Home/QueryChatMessage', data: { userName: homeMain.OnlineData.randUN(), toUserName: toUserName }, dataType: 'json' }).done(function (results) {
            homeMain.ChatMessages.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.ChatMessages.push(results[i]);
            }
            homeMain.SetChatTalkScroll();
        }).fail(function (result) {
            if (result) {

            }
        });
    },
    ChatToClick: function (entity) {
        homeMain.ChatData.ToUserName(entity.UserName);
        homeMain.ChatData.ToUserId(entity.UserId);
        homeMain.QueryChatMessage(entity.UserName);
        $("#imjs-selectuser-tip").hide();
        clearInterval(homeMain.ChatNoticeTimer);
        homeMain.ChatNoticeTimer = null;
        homeMain.SetMsgCountZero(entity);
    },
    SetMsgCountZero: function (entity) {
        for (var i = 0; i < homeMain.AllUsers().length; i++) {
            if (homeMain.AllUsers()[i].UserName == entity.UserName) {
                var user = { UserId: entity.UserId, UserName: entity.UserName, MsgCount: 0, Start: new Date() };
                homeMain.InitChatUser(user);
                homeMain.AllUsers.splice(i, 1, user);
            }
        }
    },
    SendChatMessage: function () {
        if (!homeMain.ChatData.ToUserName()) {
            $("#imjs-selectuser-tip").show();
            return;
        }
        if (homeMain.ChatData.Message().trim().length === 0) {
            return false;
        }
        if (!homeMain.ChatData.Message()) {
            $("#imjs-empty-tip").show();
            return;
        } else {
            $("#imjs-empty-tip").hide();
        }
        var msgdata = {
            ChatID: 0,
            roomid: homeMain.OnlineData.RoomId(),
            uid: homeMain.OnlineData.UserId(),
            from: homeMain.OnlineData.randUN(),
            to: homeMain.ChatData.ToUserName(),
            touid: homeMain.ChatData.ToUserId(),
            roleid: homeMain.OnlineData.UserRoleID(),
            rolename: homeMain.OnlineData.UserRoleName(),
            msg: homeMain.ChatData.Message(),
            postfile: '',
            sendtime: client.methods.now(),
            createTime: client.methods.getTime(),
            msgtype: 100,
            ischeck: 1,
            isOVerMaxMsgCount: false
        };
        eval("var sendMsg = '" + JSON.stringify(msgdata) + "';");
        $.ajax({ url: '/Home/SaveChatMessage', data: { input: sendMsg } }).done(function (result) {
            if (result) {
                msgdata.ChatID = result;
                homeMain.AddChatMessage(msgdata);
                client.socket.emit("ServerChatSendMessageEvent", msgdata);
                homeMain.ChatData.Message('');
                homeMain.SetChatTalkScroll();
            }
        });
    },
    AddChatMessage: function (msgdata) {
        homeMain.ChatMessages.push({
            SendTime: msgdata.sendtime, CreateTime: msgdata.createTime, From: homeMain.OnlineData.randUN(),
            DivClass: "textalign-right", MsgClass: "webim-body-comtent-msg-right imjs-msg-content", To: homeMain.ChatData.ToUserName(),
            Message: homeMain.ChatData.Message()
        });
    },
    ReceiveChatMessage: function (msgdata) {
        if (homeMain.ChatData.ToUserName() == msgdata.from || homeMain.OnlineData.UserRoleID() == 0) {
            homeMain.ChatMessages.push({
                SendTime: msgdata.sendtime,
                CreateTime: msgdata.createTime,
                From: msgdata.from,
                DivClass: "textalign-left",
                MsgClass: "webim-body-comtent-msg-left imjs-msg-content",
                To: msgdata.to,
                Message: msgdata.msg
            });
            homeMain.SetChatTalkScroll();
        }
        homeMain.AddUserMessage(msgdata.uid, msgdata.from, 1);
        if (homeMain.OnlineData.UserRoleID() == 0) {
            $(".webim-body-comtent-header,.webim-user-list,.webim-body-content").show();
            homeMain.ChatToClick(new { UserId: msgdata.uid, UserName: msgdata.from });
        } else {
            if ($(".webim-body-comtent-header").is(":hidden")) {
                homeMain.ChatNoticeClass();
            }
        }
    },
    AddUserMessage: function (userId, userName, msgCount) {
        if (userName == homeMain.OnlineData.randUN())
            return;
        //all user
        for (var i = 0; i < homeMain.AllUsers().length; i++) {
            if (homeMain.AllUsers()[i].UserName == userName) {
                msgCount = homeMain.AllUsers()[i].MsgCount + msgCount;
                homeMain.AllUsers.remove(homeMain.AllUsers()[i]);
            }
        }
        var user = { UserId: userId, UserName: userName, MsgCount: msgCount, Start: new Date() };
        homeMain.InitChatUser(user);
        homeMain.AllUsers.splice(0, 0, user);
    },
    InitChatUser: function (user) {
        user.Display = ko.computed(function () {
            if (user.MsgCount > 0)
                return "webim-msg-count";
            else {
                return "";
            }
        });
    },
    SetChatTalkScroll: function () {
        $("#imjs-body-content-talk")[0].scrollTop = $("#imjs-body-content-talk")[0].scrollHeight;
        homeMain.ResizeChatMarginLeft();
    },
    ChatNoticeClass: function () {
        if (homeMain.ChatNoticeTimer == null) {
            homeMain.ChatNoticeTimer = setInterval(function () {
                $("#imjs-lianxiren").toggleClass('webim-comming-msg');
                $(".webim-msg-count").toggle();
            }, 500);
        }
    },
    UserOnLine: function () {
        $.ajax({
            url: '/Home/UserOnLine', data: {
                userId: homeMain.OnlineData.UserId(), userName: homeMain.OnlineData.randUN(),
                roleId: homeMain.OnlineData.UserRoleID()
            }, async: false
        }).done(function (result) {
            if (result) {
                homeMain.GetAllUserOnline();
            }
        });
    },
    GetAllUserOnline: function () {
        homeMain.AllUsers.removeAll();
        $.ajax({ url: '/Home/GetMyUserOnline', data: { userName: homeMain.OnlineData.randUN() } }).done(function (results) {
            if (results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    var user = { UserId: results[i].UserId, UserName: results[i].UserName, MsgCount: 0, Start: results[i].CreateDateTime };
                    homeMain.InitChatUser(user);
                    homeMain.AllUsers.push(user);
                    if (homeMain.OnlineData.UserRoleID() == 0) {
                        homeMain.AddFirstChatMessage(results[i].UserId, results[i].UserName);
                    }
                }
            }
        });
    },
    AddFirstChatMessage: function (userId, userName) {
        homeMain.ChatData.ToUserId(userId);
        homeMain.ChatData.ToUserName(userName);
        $(".webim-body-comtent-header,.webim-user-list,.webim-body-content").show();
        homeMain.ChatMessages.push({
            SendTime: client.methods.now(),
            CreateTime: client.methods.getTime(),
            From: userName,
            DivClass: "textalign-left",
            MsgClass: "webim-body-comtent-msg-left imjs-msg-content",
            To: homeMain.OnlineData.randUN(),
            Message: "我是" + userName + ",很高兴为你服务。请问有什么需要帮助的？"
        });
        homeMain.SetChatTalkScroll();
    },
    clearPrivateChatState: function () {
        homeMain.ChatMessages.removeAll();
        homeMain.AllUsers.removeAll();
        homeMain.InitChatUser("");
        homeMain.ChatData.ToUserId(0);
        homeMain.ChatData.ToUserName("");
        homeMain.ChatData.Message(0);
        homeMain.ChatData.ChatRole(0);
        $(".webim-body-comtent-header,.webim-user-list,.webim-body-content").hide();
    },
    InitChat: function () {
        $("#webim").bind('click', function (e) {
            homeMain.stopPropagation(e);
            $(".webim-icon-setting-tips").hide();
            $(".webim-quick-submit").hide();
        });
        //$(document).click(function () {
        //    if (!$(".imjs-unfold").hasClass('active')) {
        //        $(".webim-body-comtent-header,.webim-user-list,.webim-body-content").hide();
        //    }
        //    $(".webim-icon-setting-tips").hide();
        //    $(".webim-quick-submit").hide();
        //});
        $("#imjs-lianxiren").click(function () {
            $(".webim-body-comtent-header,.webim-user-list,.webim-body-content").toggle();
        });
        $(".webim-friends").click(function () {
            $(this).toggleClass('webim-myfriends-close');
            $(this).next("ul").toggle();
        });
        $(".webim-icon-mini,.webim-icon-close").click(function () {
            $(".webim-body-comtent-header,.webim-user-list,.webim-body-content").hide();
        });
        $(".webim-icon-setting").bind('click', function (e) {
            homeMain.stopPropagation(e);
            $(".webim-icon-setting-tips").toggle();
        });
        $(".webim-icon-setting-tips a").click(function () {
            $(".webim-icon-setting-tips a").removeClass('active');
            $(this).addClass('active');
            $(".webim-icon-setting-tips").hide();
        });
        $(".icon-emotions").click(function () {
            $("#imjs-emotion").toggle();
        });
        $(".icon-quicktalk").bind('click', function (e) {
            homeMain.stopPropagation(e);
            $(".webim-quick-submit").toggle();
        });
        $(".webim-quick-submit a").click(function () {
            $("#imjs-textarea").text($(this).html());
            $(".webim-quick-submit").hide();
        });
        $('#imjs-textarea').keydown(function (e) {
            if (e.keyCode == 13) {
                homeMain.ChatData.Message($('#imjs-textarea').val());
                homeMain.SendChatMessage();
            }
        });
    },
    stopPropagation: function (e) {
        if (e.stopPropagation)
            e.stopPropagation();
        else
            e.cancelBubble = true;
    },
    PrivateChatResize: function () {
        if (document.body.clientWidth < 1400) {
            $(".webim-body-comtent-header").css({ "width": "430px", right: "0", left: "inherit", top: "-295px" });
            $("#imjs-textarea").css({ "width": "230px" });
            $(".webim-body-content").css({ width: "275px", left: "-275px", height: "354px", top: "-295px" });
            $(".webim-body-content-talk").css({ height: "170px", width: "230px", top: "30px", "margin-bottom": "10px" });
            $(".webim-user-list").css({ height: "270px", top: "-270px" });
            $(".webim-body-comtent-talk-tips").css({ top: "30px", position: "relative", "z-index": "1" });
        } else {
            $(".webim-body-comtent-header").css({ "width": "572px", left: "-415px", top: "-395px" });
            $("#imjs-textarea").css({ "width": "400px" });
            $(".webim-body-content-talk").css({ height: "248px", width: "410px" });
            $(".webim-body-content").css({ width: "413px", left: "-415px", height: "394px", top: "-365px" });
            $(".webim-user-list").css({ height: "364px", top: "-365px" });
            $(".webim-body-comtent-talk-tips").removeAttr("style");
        }
    },
    ResizeChatMarginLeft: function () {
        if (document.body.clientWidth < 1400) {
            $(".textalign-right").css({ "margin-left": "20px" });
        } else {
            $(".textalign-right").css({ "margin-left": "120px" });
        }
    },
    PromptAccount: function () {
        if (homeMain.OnlineData.UserRoleID() == 0) {
            var userLoginId = $.cookie("UserLoginId");
            if (userLoginId && userLoginId == 0) {
                homeMain.joinLastBalckList(homeMain.OnlineData.randUN, homeMain.OnlineData.UserId, 1);
                window.location.href = '/Home/PromptAccount';
            } else {
                homeMain.joinLastBalckList(homeMain.OnlineData.randUN, homeMain.OnlineData.UserId, 1);
                setTimeout("homeMain.PromptAccount()", 900000);//900000
            }
        }
    },
    QueryVotes: function (datas) {
        var isclick = datas === 'd';
        $.ajax({ url: '/Home/QueryVotes', data: { isClick: isclick } }).done(function (results) {
            if (datas === client.config.fromUN) return false;
            if (results.length === 0 && isclick) {
                alert("直播室尚未添加投票！");
                return false;
            }
            homeMain.Votes.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.Votes.push(results[i]);
            }
            if (homeMain.Votes().length > 0)
                homeMain.ShowVote();
        });
    },
    RefrshVotes: function () {
        $.ajax({ url: '/Home/RefrshVotes' }).done(function (results) {
            homeMain.Votes.removeAll();
            for (var i = 0; i < results.length; i++) {
                homeMain.Votes.push(results[i]);
            }
        });
    },
    AddUserVoteItem: function (data, event) {
        $.ajax({ url: '/Home/AddUserVoteItem', data: { votecolumid: data.ID } }).done(function (data) {
            if (data == "T") {
                alert("投票成功");
                homeMain.RefrshVotes();
                client.methods.NotifyRefrshShowVote();
            } else if (data == "C") {
                alert("已参与过该项投票，投票次数已达上线！");
            } else if (data == "F") {
                alert("投票出现异常，稍后重试！");
            } else if (data == "Q") {
                alert("该投票项不允许多项投！");
            } else {
                alert("游客禁止投票！");
            }
        });
    },
    ShowVote: function () {
        var wid = 400;
        if (homeMain.ibrowser.mobile) {
            wid = $(window).width() - 30;
        }
        $.fancybox.open($("#vote"), {
            width: wid,
            height: "auto",
            maxHeight: 600,
            fitToView: false,
            padding: 0,
            margin: 0,
            // scrolling: 'no',
            autoSize: false,
            closeClick: false,
            closeBtn: true,
            openEffect: 'none',
            closeEffect: 'none',
            type: 'inline',
            //modal: true,
            //hideOnOverlayClick: false,
            //hideOnContentClick: false,
            overlayShow: true
        });
    },
    AddUserActionLog: function () {
        $.ajax({ url: '/Home/AddUserActionLog', data: { userName: homeMain.OnlineData.randUN(), fromUrl: parent.location.href, currentUrl: window.location.href } }).done(function (result) {
        });
    },
    TimerCollectGarbage: function () {
        setInterval("CollectGarbage();", 60000);
    },
    openRzZhanfa: function () {
        $.fancybox.open($("#boxRzZhanfa"), {
            height: "auto",
            //maxHeight: 600,
            fitToView: false,
            padding: 0,
            margin: 0,
            // scrolling: 'no',
            autoSize: false,
            closeClick: false,
            closeBtn: true,
            openEffect: 'none',
            closeEffect: 'none',
            type: 'inline',
            //modal: true,
            //hideOnOverlayClick: false,
            //hideOnContentClick: false,
            overlayShow: true
        });
    },
    OpenFlyQQ: function () {
        var qLength = $('#ServiceQQs .serverqqlist span').length;
        $('#ServiceQQs .serverqqlist span:eq(' + parseInt(Math.random() * qLength) + ')').click();
    }, MarqueePlugin: function (obj) {
        if ($("#" + obj).find("table").length == 0) {
            var Marquee1 = new Marquee(obj);
            Marquee1.Step = 1;
            Marquee1.Timer = 50;
            Marquee1.DelayTime = 0;
            Marquee1.WaitTime = 0;
            Marquee1.ScrollStep = 52;
            Marquee1.Width = '100%';
            Marquee1.Height = 200;
            Marquee1.Start();
        }
    }
};
$(function () {
    homeMain.NoWinError();
    ko.applyBindings(homeMain);
    homeMain.Init();
    homeMain.SlideSwitch();
    homeMain.InitContext();
    homeMain.IreSize();
    $("#PlatformDescription").nanoScroller({
        preventPageScrolling: true,
        alwaysVisible: true,
        sliderMinHeight: 100
    });
    $("#TeacherTeam").nanoScroller({
        preventPageScrolling: true,
        alwaysVisible: true,
        sliderMinHeight: 100
    });
    $("#HelpExplain").nanoScroller({
        preventPageScrolling: true,
        alwaysVisible: true,
        sliderMinHeight: 100
    });
    $("#Sweep").nanoScroller({
        preventPageScrolling: true,
        alwaysVisible: true,
        sliderMinHeight: 100,
    });
    $(".weixinCode").nanoScroller({
        preventPageScrolling: true,
        alwaysVisible: true,
        sliderMinHeight: 100,
    });
    //$("#TeacherTeam .nano").nanoScroller({ scroll: 'top' });
    //$("#PlatformDescription .nano").nanoScroller({ scroll: 'top' });
    homeMain.InitChat();
    //homeMain.TimerCollectGarbage();
    if (homeMain.ibrowser.mobile) {
        $(".webim-body").hide();
    } else {
        homeMain.PrivateChatResize();
    }
});
$(window).resize(function () {
    homeMain.IreSize();
    if (!homeMain.ibrowser.mobile) {
        homeMain.PrivateChatResize();
    }
});