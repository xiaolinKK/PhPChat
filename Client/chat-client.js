/**
 * Created by 小林 on 2016/4/19.
 */
var client={

    socket:null,
    events:{
        connectionEvent:function () {
            client.socket.on('conn',function (data) {
                if (!data.totalnum || data.totalnum == "undefined") {
                    data.totalnum = 0;
                }
                $("#totalnum").text(data.totalnum);

                client.socket.emit('onlineEvent',{
                    roomid: 1,
                    uid: 0,
                    from: 'admin1',
                    rid: 0,
                    socketid: "",
                });
            })
        }

    }
};

$(function () {
    setTimeout(function () {
        if (client.socket == null) {
            client.socket = io('127.0.0.1:1233');
        }
        // start connection
        if (!client.socket.connected) {
            client.socket.connect();
        }
        client.events.connectionEvent();
    },3000)
})
