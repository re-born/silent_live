var WS_HOST = window.location.href.replace(/(http|https)(:\/\/.*?)\//, 'ws$2'),
    as = null;

var audioContext = window.AudioContext ? new window.AudioContext() :
                   window.webkitAudioContext ? new window.webkitAudioContext() :
                   window.mozAudioContext ? new window.mozAudioContext() :
                   window.oAudioContext ? new window.oAudioContext() :
                   window.msAudioContext ? new window.msAudioContext() :
                   undefined;

var getUserMedia = navigator.getUserMedia ? 'getUserMedia' :
                   navigator.webkitGetUserMedia ? 'webkitGetUserMedia' :
                   navigator.mozGetUserMedia ? 'mozGetUserMedia' :
                   navigator.oGetUserMedia ? 'oGetUserMedia' :
                   navigator.msGetUserMedia ? 'msGetUserMedia' :
                   undefined;

var AudioStreamerCtrl = function($scope) {
  $scope.websocket_started = false;
  $scope.input_started = false;
  $scope.audio_loaded = false;
  $scope.source_connected = false;

  $scope.session_button = 'connect';
  $scope.message = '';
  $scope.messages = [];
  $scope.notification = '';
  $scope.notification_type = 'info';
  $scope.toggle_session = function() {
    if ($scope.websocket_started) {
      $scope.streamer.disconnect();
      $scope.streamer = null;
      $scope.websocket_started = false;
      $scope.session_button = 'connect';
    } else {
      $scope.input_started = false;
      $scope.audio_loaded = false;
      $scope.source_connected = false;
      $scope.streamer = new AudioStreamer(WS_HOST, function() {
        $scope.streamer.onMessage = $scope.onmessage;
        $scope.streamer.nameSelf($scope.name || 'GUEST USER');
        $scope.websocket_started = true;
        $scope.session_button = 'If something go wrong';
        connect_button = document.getElementById('connect');
        connect_button.parentNode.removeChild(connect_button);
        $scope.$apply();
      });
    }
  };
  $scope.onmessage = function(msg) {
    switch (msg.type) {
      case 'connected':
        return;
      case 'connection':
        $scope.attendees = msg.message;
        break;
      case 'message':
        $scope.messages.unshift(msg);
        break;
      case 'start_music':
        msg.message = 'Started playing audio';
        $scope.messages.unshift(msg);
        break;
      default:
        return;
    }
    $scope.$apply();
  };
  $scope.send_message = function() {
    var message = $scope.message;
    if (message.length > 0) {
      $scope.streamer.sendText(message);
      $scope.message = '';
      $scope.$apply();
    }
  };

  document.querySelector('#text').onkeydown = function(e) {
    if (e.keyCode == 13) {
      $scope.send_message();
      e.stopPropagation();
      e.preventDefault();
    }
  };
};



window.addEventListener('touchmove', function() {
    document.body.ontouchmove = event.preventDefault();
}, false);

var isSmartphone = navigator.userAgent.search(/(iPhone|iPad|Android)/) !== -1
if (isSmartphone){
  // window.onload = function() {
    // var acceleration = document.getElementById("acceleration");
  //   window.addEventListener("devicemotion", function(ev){
  //     var dx = ev.acceleration.x*100;
  //     var dy = ev.acceleration.y*100;
  //     var dz = ev.acceleration.z*100;
  //     acceleration.textContent = Math.round(dx+dy+dz)
  //   });
  // }
}