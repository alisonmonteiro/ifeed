;(function() {
  var App = function(selector, opts) {
    var options = {
      get: 'popular',
      tagName: null,
      locationId: null,
      userId: null,
      accessToken: null,
      resolution: 'thumbnail',
      sortBy: 'recent',
      limit: 9,
      template: '<a target="_blank" href="{{link}}"><img src="{{image}}" />{{likes}}</a>',
      before: null,
      after: null
    };

    var init = function() {
      setOptions();
      before();
      buildUrl();
    }

    var setOptions = function() {
      var item, value;

      if (typeof opts === 'object') {
        for (item in opts) {
          value = opts[item];

          if (value !== '') {
            options[item] = value;
          }
        }
      }
    }

    var before = function() {
      if (typeof options.before === 'function')
        options.before.call(this);
    }

    var buildUrl = function() {
      var complement, finalUrl;
      var urlBase = 'https://api.instagram.com/v1';

      switch (options.get) {
        case 'user':
          if (typeof options.userId !== 'number') {
            console.error('No user specified. Use the ' + options.userId + ' option.');
          }
          if (typeof options.accessToken !== 'string') {
            console.error('No access token. Use the ' + accessToken + ' option.');
          }
          complement = 'users/' + options.userId + '/media/recent';
          break;

        case 'popular':
          complement = 'media/popular';
          break;

        case 'tagged':
          if (typeof options.tagName !== 'string') {
            console.error('No tag name specified. Use the ' + tagName + ' option.');
          }
          complement = 'tags/' + options.tagName + '/media/recent';
          break;

        case 'location':
          if (typeof options.locationId !== 'number') {
            console.error('No location specified. Use the ' + locationId + ' option.');
          }
          complement = 'locations/' + options.locationId + '/media/recent';
          break;

        default:
          console.error('Invalid option for get: \'' + options.get + '\'.');
      }

      finalUrl = urlBase + '/' + complement;
      if (options.accessToken !== null) {
        finalUrl += '?access_token=' + options.accessToken;
      } else {
        finalUrl += '?client_id=' + options.clientId;
      }

      finalUrl += '&count=' + options.limit;

      getResponseAndParse(finalUrl);
    }

    var getResponseAndParse = function(url) {
      jsonp(url, function (response) {
        if (typeof response !== 'object')
          console.error('Invalid JSON response');

        showHtml(response.data)
      })
    }

    /**
     * 'jsonp' doesn't use XMLHttpRequests.
     * Instead, the data is retrieved via a script.
     */
    var jsonp = function(url, callback) {
      var callbackName = 'ifeed_' + Math.round(100000 * Math.random());
      var script = document.createElement('script');

      window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
      };

      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
      document.body.appendChild(script);
    }

    var showHtml = function(images) {
      var output, image, imageString, resolution, sortSettings, reverse;

      if (options.sortBy !== 'recent') {
        if (options.sortBy === 'random') {
          sortSettings = ['', 'random'];
        } else {
          sortSettings = options.sortBy.split('-');
        }

        reverse = sortSettings[0] === 'least';
        switch (sortSettings[1]) {
          case 'random':
            images.sort(function () {
              return 0.5 - Math.random();
            });
            break;

          case 'recent':
            images = sortBy(images, 'created_time', reverse);
            break;

          case 'liked':
            images = sortBy(images, 'likes.count', reverse);
            break;

          case 'commented':
            images = sortBy(images, 'comments.count', reverse);
            break;

          default:
            console.error("Invalid option for sortBy: '" + options.sortBy + "'.");
        }
      }

      if (options.template !== null && typeof options.template === 'string') {
        output = '';
        imageString = '';

        for (var i = 0; i < images.length; i++) {
          image = images[i];
          resolution = options.resolution;

          if (resolution !== 'thumbnail') {
            resolution = resolution + '_resolution';
          }

          imageString = makeTemplate(options.template, {
            model: image,
            id: image.id,
            link: image.link,
            image: image.images[resolution].url,
            caption: getObjectProperty(image, 'caption.text'),
            likes: image.likes.count,
            comments: image.comments.count,
            location: getObjectProperty(image, 'location.name')
          });
          output += imageString;
        }

        selector.innerHTML = output;
        after();
      }
    }

    var makeTemplate = function(template, data) {
      var output = template, pattern, varName, varValue, ref;

      pattern = /(?:\{{2})([\w\[\]\.]+)(?:\}{2})/;
      while (pattern.test(output)) {
        varName = output.match(pattern)[1];
        varValue = (ref = getObjectProperty(data, varName)) != null ? ref : '';
        output = output.replace(pattern, "" + varValue);
      }

      return output;
    }

    var sortBy = function (data, property, reverse) {
      var sorter = function (a, b) {
        var valueA, valueB;

        valueA = getObjectProperty(a, property);
        valueB = getObjectProperty(b, property);

        if (reverse) {
          if (valueA > valueB) {
            return 1;
          } else {
            return -1;
          }
        }

        if (valueA < valueB) {
          return 1;
        } else {
          return -1;
        }
      };

      data.sort(sorter.bind(this));

      return data;
    }

    var getObjectProperty = function (object, property) {
      var pieces  = property.split('.');
      property = property.replace(/\[(\w+)\]/g, '.$1');

      while (pieces.length) {
        var piece = pieces.shift();

        if ((object !== null) && piece in object) {
          object = object[piece];
        } else {
          return null;
        }
      }

      return object;
    }

    var after = function() {
      if (typeof options.after === 'function')
        options.after.call(this);
    }

    return {
      init: init
    };
  };

  HTMLElement.prototype.ifeed = function(opts) {
    return App(this, opts).init();
  }
})();
