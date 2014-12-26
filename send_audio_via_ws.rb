require 'coreaudio'
require 'pry'
require 'em-websocket'
require 'json'

EM.run do
  EM::WebSocket.run(:host => "0.0.0.0", :port => 8010) do |ws|

    dev = CoreAudio.default_input_device
    buf = dev.input_buffer(1024)
    th = Thread.start do
      while true
        w = buf.read(1024)
        a = (w[0, true].to_f / 32767).to_a
        ws.send a.to_s
      end
    end

    ws.onclose { puts "Connection closed" }

    buf.start
  end
end
