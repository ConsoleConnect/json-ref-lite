// Generated by CoffeeScript 1.10.0
(function() {
  var fs, request;

  fs = require('fs');

  request = false;

  if (fs.existsSync(__dirname + '/node_modules/sync-request')) {
    request = require('sync-request');
  }

  module.exports = function() {
    this.findIds = function(json, ids) {
      var id, k, obj, v;
      id = false;
      obj = {};
      for (k in json) {
        v = json[k];
        if (json.id != null) {
          id = json.id;
        }
        if (id && k !== "id") {
          obj[k] = v;
        }
        if (typeof v === 'object') {
          this.findIds(v, ids);
        }
      }
      if (id) {
        return ids[id] = obj;
      }
    };
    this.replace = function(json, ids, root) {
      var evalstr, k, ref, results, str, v;
      results = [];
      for (k in json) {
        v = json[k];
        if (v['$ref'] != null) {
          ref = v['$ref'];
          if (ids[ref] != null) {
            results.push(json[k] = ids[ref]);
          } else if (request && String(ref).match(/^http/)) {
            results.push(json[k] = JSON.parse(request("GET", ref).getBody().toString()));
          } else if (fs.existsSync(ref)) {
            str = fs.readFileSync(ref).toString();
            if (str.match(/module\.exports/)) {
              results.push(json[k] = require(ref));
            } else {
              results.push(json[k] = JSON.parse(str));
            }
          } else if (String(ref).match(/^#\//)) {
            evalstr = ref.replace(/\\\//, '#SLASH#').replace(/\//g, '.').replace(/#/, 'root').replace(/#SLASH#/, '/');
            if (process.env.DEBUG != null) {
              console.log(evalstr);
            }
            process.exit();
            results.push(json[k] = eval('try{' + evalstr + '}catch(e){}'));
          } else {
            results.push(void 0);
          }
        } else {
          if (typeof v === 'object') {
            results.push(this.replace(v, ids, root));
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    };
    this.resolve = function(json) {
      var ids;
      ids = {};
      this.findIds(json, ids);
      this.replace(json, ids, json);
      return json;
    };
    return this;
  };

}).call(this);
