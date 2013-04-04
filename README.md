# must.js

A browser client for the Meetup Streaming API

## usage

This client provides a interface for both websocket and long-polling
protocols. You supply a callback function to respond to the json,
and any parameters you want to be included. For example, to alert
with the member_id for every RSVP in the event "1234":

### loading

You will want to make sure the client is loaded, once

You can either load it immediately

     $(window).load(must.Loader.load);

Or defer is loading

     $(window).load(mu.Loader.defer(function() {
        // do after deferral
     }));

### streaming

After loading you can start streaming meetup data

#### RSVPS

      must.Rsvps(function(json) {
          alert(json.member.member_id);
      }, { event_id: 1234 });

#### Comments

     must.Comments(function(json) {
        alert(json.comment);
     });

### Events

    must.Events(function(json) {
       alert(json.name);
    });

### Photos

    must.Photos(function(){
      alert(json.highres_link);
    });

### Checkins

    must.Checkins(function(json) {
      alert(json.member.member_name);
    }, {
      event_id: 1234
    });

### stoping stream

If you ever wish to stop the cycle of callbacks, call `stop()`
on the object returned by a streams creation.

      stream.stop();

To restart the stream, create a new one with the function above.

This client requires jQuery 1.4 or higher.

Meetup 2013
