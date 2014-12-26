require 'coreaudio'
require 'pry'
require 'em-websocket-client'
require 'json'

EM.run do
  conn = EventMachine::WebSocketClient.connect("ws://0.0.0.0:2929/socket")

  dev = CoreAudio.default_input_device
  # dev = CoreAudio.devices.find{|dev| dev.name == "Soundflower (2ch)" }
  buf = dev.input_buffer(1024)

  th = Thread.start do
    while true
      w = buf.read(1024)
      a = (w[0, true].to_f / 32767).to_a
      conn.send_msg a.to_s
    end
  end

  buf.start

  conn.errback do |e|
    puts "Got error: #{e}"
  end

  conn.stream do |msg|
    puts "<#{msg}>"
    if msg.data == "done"
      conn.close_connection
    end
  end

  conn.disconnect do
    puts "gone"
    EM::stop_event_loop
  end
end
