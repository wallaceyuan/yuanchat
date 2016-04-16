angular.module('chatModule').controller('roomCtrl',function($scope,$timeout,socket){
    $scope.status = true;$scope.dialog = false;
    $scope.ptop;
    $scope.messages = [],$scope.message = '',$scope.line = '',$scope.onlines = [],$scope.world = [],$scope.times= [];
    $scope.ws = 'messenger-empty';$scope.wss = 'messenger-hidden';


    $scope.chat = function(name){
        $scope.ptop = name;
    }
    /*提交姓名*/
    $scope.subName = function(){
        $scope.status = false;
        if($scope.line){
            socket.emit('join',$scope.line);
        }
    }

    $scope.createMessage = function(){
        if($scope.message){
            socket.emit('createMessage',{user:$scope.line,message:$scope.message,time:getTime()});
            $scope.message = '';
        }
    }

    $scope.replay = function(user){
        $scope.message = '@'+user;
    }

    /*回车事件*/
    $scope.enter = function(keyEvent){
        var char = keyEvent.charCode || keyEvent.keyCode || keyEvent.which;
        if(char == 13){
            $scope.createMessage();
        }
    }

    /*连接事件*/
    socket.on('connect', function(){
        $scope.tip = 'Hello,Friend!';
    });

    /*获取在线列表*/
    socket.emit('getAllMessages');

    socket.on('allMessages',function(data){
        //$scope.messages = data.messages;
        $scope.onlines = data.users;
    });

    socket.on('message.add',function(msg){
        if($.inArray(msg.time, $scope.times)>-1){
            msg.time = false;
        }else{
            $scope.times.push(msg.time);
        }
        if(msg.user == $scope.line){
            msg.flag = 'me message-reply';
        }else{
            msg.flag = 'other message-receive';
        }
        $scope.messages.push(msg);
        var timer = $timeout(function() {
            $('.content').mCustomScrollbar("scrollTo","bottom",{
                scrollInertia:100
            });
            $timeout.cancel(timer);
        }, 0);
    });

    socket.on('people.del',function(msg){
        $scope.ws = '';$scope.wss = '';
        $scope.world = msg;
        $scope.onlines = $scope.onlines.filter(function(user){
            if(user)
                return user.name != msg.name;
        });

        var timer = $timeout(function() {
            $scope.ws = 'messenger-empty';$scope.wss = 'messenger-hidden';
            $timeout.cancel(timer);
        }, 3000);
    });

    socket.on('joinChat',function(msg){
        var user = msg;
        if(user.name == $scope.line)
            user.icon = true;
        else
            user.icon = false;
        $scope.ws = '';$scope.wss = '';
        $scope.world = {user:user.name,content:'上线了'};
        $scope.onlines.push(user);

        $timeout.cancel($scope.promise);

        var timer = $timeout(function() {
            $scope.ws = 'messenger-empty';$scope.wss = 'messenger-hidden';
            $timeout.cancel(timer);
        }, 3000);
    });

});


function getTime(){
    var t = new Date();
    var year = t.getFullYear();
    var month = t.getMonth(), dayDate = t.getDate(), monthBox = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
        dayDate = dayDate < 10 ? "0" + dayDate : dayDate, today = year + "-" + monthBox[month] + "-" + dayDate;
    var hour = t.getHours(),min = t.getMinutes(),sec=t.getSeconds();
    return hour+':'+min
}