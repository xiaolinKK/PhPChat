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

$io=new SocketIO(1233);

$io->on('connection',function($socket){
    echo 'connection....';
    //echo var_dump($socket);
    global $onLineUsers,$socketSet;

    $onLineUsers++;
    //连线，缓存当前连接客户端
    $tmpSocket=array(
        "roomid"=>0,
        "from"=>"",
        "uid"=>0,
        "socketid"=>$socket,
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
    $socket->broadcast->emit('connection',array("msgtype"=>1,"socketid"=>$socket,"totalnum"=>$onLineUsers));

});

Worker::runAll();