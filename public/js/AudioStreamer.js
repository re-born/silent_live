/*
Copyright 2012 Eiji Kitamura

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Eiji Kitamura (agektmr@gmail.com)
*/
'use strict';

var AudioStreamer = (function() {
  var BUFFER_LENGTH = 1024;

  var TextMessage = {
    createMessage: function(type, message) {
      if (type != 'connection' && type != 'message')
        throw 'message type is unknown';
      var msg = {
        type: type,
        message: message || ''
      };
      return JSON.stringify(msg);
    }
  };

  var AudioSource = function() {
    this.buffer = [];
    this.js = audioContext.createScriptProcessor(BUFFER_LENGTH, 2, 2);
    this.js.onaudioprocess = this.onaudioprocess.bind(this);
    this.socket = null;
    this.getBufferCallback = null;
  };
  AudioSource.prototype = {
    onaudioprocess: function(event) {
      if (typeof this.getBufferCallback === 'function')
        this.getBufferCallback();

      var buffers = this.buffer.shift() || new Float32Array(BUFFER_LENGTH),
          that = this;

      for (var ch = 0; ch < 2; ch++) {
        event.outputBuffer.getChannelData(ch).set(buffers);
      }
    },
    connect: function(destination) {
      this.js.connect(destination);
    },
    disconnect: function() {
      this.js.disconnect();
    },
    connectSocket: function(socket) {
      this.socket = socket;
    },
    setBuffer: function(buffer) {
      this.buffer.push(buffer);
    }
  };

  var AudioPlayer = function(source, destination, onplayend) {
    this.source = source;
    if (typeof onplayend === 'function')
      this.onplayend = onplayend;
    this.destination = destination;

    if (isSmartphone){
      var gradation_array = []
      for (var i = 0; i < 100; i++) {
        gradation_array.push(hslToRgb(100-i, '50%', '50%'))
      };

      var waiting_buffer_dom = document.getElementById("waiting_buffer");

      setInterval( function() {
        waiting_buffer_dom.textContent = source.buffer.length;
        var waiting_buffer = source.buffer;
        var body = document.getElementsByTagName("body")[0];
        body.style.backgroundColor = gradation_array[waiting_buffer.length];
        if (waiting_buffer.length > 5) {
          waiting_buffer.shift_n(waiting_buffer.length - 5);
        }
      }, 1000)
    };
  }
  AudioPlayer.prototype = {
    listen: function() {
      this.source.connect(this.destination);
    }
  };

  var AudioStreamer = function(ws_host, callback) {
    var that = this;
    this.source = null;
    this.onMessage = null;

    this.websocket = new WebSocket(ws_host);
    this.websocket.onopen = function() {
      if (typeof callback == 'function') {
        callback();
      }
    };
    this.websocket.onmessage = function(req) {
      try {
        if (req.data.indexOf('{') == 0) {
          var msg = JSON.parse(req.data);
          that.onMessage(msg);
        } else {
          var buffer = JSON.parse(req.data);
          that.audioListener.source.setBuffer(buffer);
        }
      } catch(e) {
        throw e;
      }
    };
    this.websocket.onerror = function() {
      console.log('connection error.');
    };

    this.audioMerger = audioContext.createChannelMerger();
    var listenerSource = new AudioSource();
    this.audioListener = new AudioPlayer(listenerSource, this.audioMerger);
    this.audioListener.listen();

    this.analyser = audioContext.createAnalyser();
    this.audioMerger.connect(this.analyser);
    this.analyser.connect(audioContext.destination);
  };
  AudioStreamer.prototype = {
    nameSelf: function(name) {
      var msg = TextMessage.createMessage('connection');
      this.websocket.send(msg);
    },
    sendText: function(text) {
      var msg = TextMessage.createMessage('message', text);
      this.websocket.send(msg);
    },
    disconnect: function() {
      if (this.websocket.close) {
        this.stop();
        this.audioListener.stop();
        this.websocket.close();
        console.debug('socket disconnected.');
      }
    }
  };

  return function(host, callback) {
    return new AudioStreamer(host, callback);
  };
})();