"use strict";

namespace('clientio', function () {

  this.connect = function(address, success) {
    $.getScript(address + '/socket.io/socket.io.js')
     .done(libFinded).fail(libError);

    function libFinded() {
      addWildcardSupport();
      var socket = io.connect(address);
      success(socket);
    }
    function libError(jqxhr, settings, exception ) {
      console.error(exception);
    }
  };

  function addWildcardSupport() {
    // versions 0.8.*-0.9.*
    if (io.SocketNamespace) {
      io.SocketNamespace.prototype.$emit = (function ($orgEmit) {
        return function () {
          var args = Array.prototype.slice.call(arguments);
          $orgEmit.apply(this, ['*'].concat(args));
          $orgEmit.apply(this, arguments);
        };
      })(io.SocketNamespace.prototype.$emit);
    }
    //version 1.0.*+
    else if (io.Socket.prototype.onevent) {
      //more complicated here, finded by long research
      io.Socket.prototype.onevent = (function (emit) {
        return function (packet) {
          var args = packet.data || []

          if (packet.id) {
            args.push(this.ack(packet.id));
          }

          this.io.emit.apply(this, args);
          this.io.emit.apply(this, ['*'].concat(args));
        };
      })(io.Socket.prototype.emit);
    }
  }
});
