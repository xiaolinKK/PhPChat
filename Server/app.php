<?php
use Workerman\Worker;
use Workerman\WebServer;
use Workerman\Autoloader;
use PHPSocketIO\SocketIO;

include_once './PHPSocketIO/autoload.php';

//在线人数
$onLineUsers=0;
//socket客户端集合
$socketSet=array();

//admin组
$adminGroup="admins";

//普通用户组
$userGroup="users";

$io=new SocketIO(1233);

$io->on('connection',function($connection)use($io){

    //echo var_dump($connection);

    global $onLineUsers,$socketSet;

    $onLineUsers++;
    //连线，缓存当前连接客户端
    $tmpSocket=array(
        "roomid"=>0,
        "from"=>"",
        "uid"=>0,
        "socketid"=>$connection,
        "roleid"=>0,
        "remoteAddress"=>"");
    $hasSocketFlag=0;
    if(count($socketSet)>0){
        for ($i=0;$i<count($socketSet);$i++){
            if($socketSet[$i]['socketid']==$tmpSocket['socketid']){
                $hasSocketFlag++;
            }
            if($socketSet[$i]['from']==""){
               array_splice($socketSet,$i,1);
            }
        }
    }
    if($hasSocketFlag==0){
        array_push($socketSet,$tmpSocket);
    }


    $connection->emit('conn',array("msgtype"=>1,"socketid"=>"tets","totalnum"=>$onLineUsers));

    $connection->on('onlineEvent',function($data)use($io){

    });

    $connection->on('disconnect',function(){
        global $onLineUsers;
        $onLineUsers--;
    });

});

Worker::runAll();