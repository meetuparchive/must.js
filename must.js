;(function(window, $) {
  if (window.must !== undefined) {
      return window.must;
  }
  var mu = {};
  var supportsWebsockets = window.WebSocket || window.MozWebSocket;

  /** Streams public RSVP data from http://www.meetup.com/meetup_api/docs/stream/2/rsvps/#polling */
  mu.Rsvps = function(callback, params, error) {
    return new mu.Stream({
      path: "/2/rsvps",
      callback: callback,
      error: error,
      params: params
    });
  };

  /** Streams public photo data from http://www.meetup.com/meetup_api/docs/stream/2/photos/#polling */
  mu.Photos = function(callback, params, error) {
    return new mu.Stream({
      path: "/2/photos",
      callback: callback,
      error: error,
      params: params
    });
  };

  /** Streams public checkin data from http://www.meetup.com/meetup_api/docs/stream/2/checkins/#polling */
  mu.Checkins = function(callback, params, error) {
    return new mu.Stream({
      path: "/2/checkins",
      callback: callback,
      error: error,
      params: params
    });
  };

  /** Streams public Meetup comments from http://www.meetup.com/meetup_api/docs/stream/2/event_comments/#polling */
  mu.Comments = function(callback, params, error) {
    return new mu.Stream({
      path: "/2/event_comments",
      callback: callback,
      params: params,
      error: error
    });
  };

  /**
   * @param config object that defines the following options
   *  host - base host
   *  path - path of stream endpoint
   *  url - http url for the stream
   *  wsUrl - websockets url for the stream
   *  callback - callback for messages, parameter is one JS object
   *  log    - function that logs a msg
   *  error  - function called when an error occurs
   */
  mu.Stream = function(config) {
    var $      = jQuery,
      defaults = {
        host: "http://stream.meetup.com",
        path: "/2/rsvps",
        log: function(msg) { },
        stopping: false,
        error: function(msg) {
            alert(msg);
        }
      }

    $.extend(this, defaults, config);
    this.url = this.host + this.path;
    this.wsUrl = this.wsUrl || this.url.replace(/^http/, 'ws');

    this.stop = this.close;  // backward compatibility
    if (!this.noOpen) {
      this.open();
    }


    return this;
  };
  mu.Stream.prototype = {
    handleJson: function(json) {
      if (typeof this.callback === "function") {
        this.callback(json);
      } else {
        this.error("callback is not a function");
      }
    },
    close: function() {
      this.stopping = true;
    },
    open: function() {
      var self = this;
      if (supportsWebsockets) {
        if (this.params) { this.wsUrl = this.wsUrl + "?" + $.param(this.params) };
        var s = window.WebSocket ? new WebSocket(this.wsUrl) : new MozWebSocket(this.wsUrl);
        s.onmessage = function(e) {
          if (this.stopping) {
            s.close();
          } else {
            var ary = JSON.parse(e.data);
            if (ary.errors) {
              error(ary.errors);
            } else {
              self.handleJson(ary);
            }
          }
        };
      } else {
        var newest = 0;
        this.successCallback = function(ary) {
          if (!this.stopping) {
            if (ary) {
              if (ary.errors) {
                stopping = true;
                error(ary.errors);
              } else {
                $.each(ary, function() {
                  self.handleJson(this);
                  newest = Math.max(newest, this.mtime);
                });
              }
            }
            if (!stopping) {
              var params = self.params || {};
              if (newest > 0) {
                params.since_mtime = newest;
                delete params.since_count;
              }
              $.ajax({
                url: self.url,
                data: params,
                dataType: 'jsonp',
                success: self.successCallback,
                scriptCharset: 'UTF-8'
              });
            }
          }
        };
        mu.Loader.defer(function () {
          self.successCallback();
        });
      }
    }
  }

  // export to window
  window.must = mu;

}(this, jQuery));
