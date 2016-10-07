var leaves;

// Testing flag, for mocking the dates of the events
// without having to change the dates in the events.json
var testing = true;

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

var app = new Vue({
  el: '#app',
  data: {
    showoptions: false,
    foodNotify: true,
    talksNotify: true,
    eventsNotify: true,
    bieneNotify: false,
    events: [],
    animation: true,
    days: [
      new Date("2016/10/07"),
      new Date("2016/10/08"),
      new Date("2016/10/09")
    ]
  },
  ready: function() {
    this.updateEvents();
    this.startAnimation();
    this.notify("Welcome to HackUPC Live", null, "essential");

    if(testing){
       window.setInterval(function(){
          app.updateEvents();
        }, 1000);
    } else {
      window.setInterval(function(){
        app.updateEvents();
      }, 30000);
    }
  },
  methods: {
    options: function() {
      this.showoptions = this.showoptions ? false : true;
    },

    // fn newEvent()
    // creates a new event in the event
    // array, with notify status and 
    // the text dates converted to Date 
    // objects
    newEvent: function(event) {
      oldObject = app.oldObject(event._id);

      if(oldObject == -1) {
        event.notifySent = false;
      } else {
        event.notifySent = oldObject.notifySent;
      }

      event.begin = new Date(event.begin);

      if(event.end === "") {
        event.end = new Date(event.begin.getTime() + 10*60000);
        event.showProgress = false;
      } else {
        event.end = new Date(event.end);
        event.showProgress = true;
      }
      
      event.progress = app.whereAreWe(event.begin, event.end);
      event.current = event.progress > 0;
      event.past = event.progress == -1;

      if(!event.notifySent && event.progress > 0) {
         app.notify(event.title, event.place, event.type);
         event.notifySent = true;
      }

      return event;
    },

    // fn oldIndexById()
    // find event in old event list by ID,
    // if event is found the index is returned
    // if it is not found -1 is returned
    oldObject: function(id) {
      old_events = this.$get('events')

      if(old_events != null) {
        for(var i = 0; i < old_events.length; i++) {
          for(var j = 0; j < old_events[i].events.length; j++) {
            if(old_events[i].events[j]._id == id) {
              return old_events[i].events[j];
            }
          }
        }
      }

      return -1;
    },

    // fn updateTimetable()
    // updates the event array with the current json
    // manages all updates to the events
    updateEvents: function () {
    this.$http.get('/assets/data/events.json?nocache=' + Math.floor(Math.random()*100000))
      .then(function(response) {
        old_events = this.$get('events');
        new_events = response.body.events;

        for (var i = 0; i < new_events.length; i++) {
          new_events[i] = app.newEvent(new_events[i]); 
        }

        new_events.sort(function(a,b){
          return (a.begin - b.begin) ||
                 (a.end - b.end) ||
                 (b.title < a.title ? 1 : -1);
        });

        now = new Date(Date.now());

        events = [
          {
            day: "Friday",
            events: []
          },
          {
            day: "Saturday",
            events: []
          },
          {
            day: "Sunday",
            events: []
          }
        ];

        if(!(now > this.days[1])) {
          events[0].events = new_events.filter(function(event) {
            return event.begin < app.days[1];
          });
        }

        if(!(now > this.days[2])) {
          events[1].events = new_events.filter(function(event) {
            return event.begin < app.days[2] && event.begin >= app.days[1];
          });
        }

        events[2].events = new_events.filter(function(event) {
          return event.begin > app.days[2];
        });

        this.$set('events', events);
      }, function(response) {
        console.log("Sth wrong");
      });
    },

    biene: function () {
      alert("BIENE");
    },

    // Toggles animation between stopped and started state
    toggleAnimation: function (data) {
      if(data == false) {
        leaves.stop();
      } else {
        leaves.restart();
      }
    },

    // Starts background animation
    startAnimation: function () {
      leaves = new Leaves(true);
      leaves.start();
    },

    // Returns false if not in range and percentage of completion if true
    whereAreWe: function (start, end) {
      d = new Date(Date.now());
      if(start <= d && d <= end) { // Inside the range
        return (d - start)/(end - start);;
      } else if(d < start) {
        return -2; // Before the range
      } else if(d > end) {
        return -1; // After the range
      }
    },

    // Notify the user of the events according
    // to his preferences
    notify: function (title, place, type) {
      if(typeof Notification === 'function' &&
        !navigator.userAgent.match(/IEMobile|Windows Phone|Lumia|Android|webOS|iPhone|iPod|Blackberry|PlayBook|BB10|Mobile Safari|Opera Mini|\bCrMo\/|Opera Mobi/i)) {
        permission = Notification.permission;
        if(permission !== "denied") {
          if(permission === "default") {
            Notification.requestPermission();
          }

          notifiable = false;
          if((type === "food" && this.foodNotify)
            || (type === "events" && this.eventsNotify) 
            || (type === "talks" && this.talksNotify)
            || (type === "essential")) {
            notifiable = true;
          }

          if (permission === "granted" && notifiable) {
            var options = {
              body: place != null ? 'happening right now at ' + place : '',
              icon: '/favicon.ico',
            }

            new Notification(title, options);
          }
        }
      }
    }
  },
  watch: {
    animation: function (data) {
      this.toggleAnimation(data);
    }
  },
  filters: {
    hackupcdate: function (date) {
      return date.getHours() + ":" + date.getMinutes().pad(2) + ":" + date.getSeconds().pad(2);
    }
  }
});
