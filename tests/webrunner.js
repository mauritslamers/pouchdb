/*globals $:false, console: false */

"use strict";

// use query parameter testFiles if present,
// eg: test.html?testFiles=test.basics.js
var testFiles = window.location.search.match(/[?&]testFiles=([^&]+)/);
testFiles = testFiles && testFiles[1].split(',') || [];
var started = new Date();
if (!testFiles.length) {
  // If you want to run performance tests, uncomment these tests
  // and comment out the testFiles below
  //testFiles = [
  //  'perf.attachments.js'
  //];

  // Temporarily disable tests that can leave CouchDB in non Admin Party
  // 'test.cors.js'
  // 'test.auth_replication.js',
  testFiles = ['test.basics.js', 'test.all_dbs.js', 'test.changes.js',
               'test.bulk_docs.js', 'test.all_docs.js', 'test.conflicts.js',
               'test.revs_diff.js',
               'test.replication.js', 'test.views.js', 'test.taskqueue.js',
               'test.design_docs.js', 'test.issue221.js', 'test.http.js',
               'test.gql.js', 'test.compaction.js', 'test.get.js',
               'test.attachments.js', 'test.uuids.js', 'test.slash_id.js'];
}

testFiles.unshift('test.utils.js');

var sourceFiles = {
  'dev': ['../src/deps/md5.js',
          '../src/deps/blob.js',
          '../src/deps/uuid.js',
          '../src/deps/extend.js',
          '../src/deps/ajax.js',
          '../src/pouch.utils.js',
          '../src/pouch.collate.js',
          '../src/pouch.merge.js',
          '../src/pouch.js',
          '../src/pouch.adapter.js',
          '../src/adapters/pouch.http.js',
          '../src/adapters/pouch.idb.js',
          '../src/adapters/pouch.websql.js',
          '../src/pouch.replicate.js',
          '../src/plugins/pouchdb.gql.js',
          '../src/plugins/pouchdb.mapreduce.js',
          '../src/plugins/pouchdb.spatial.js'],
  'release': ['../dist/pouchdb-nightly.js', '../src/deps/extend.js', '../src/deps/ajax.js'],
  'release-min': ['../dist/pouchdb-nightly.min.js', '../src/deps/extend.js', '../src/deps/ajax.js']
};

// Thanks to http://engineeredweb.com/blog/simple-async-javascript-loader/
function asyncLoadScript(url, callback) {

  // Create a new script and setup the basics.
  var script = document.createElement("script"),
  firstScript = document.getElementsByTagName('script')[0];

  script.async = true;
  script.src = url;

  // Handle the case where an optional callback was passed in.
  if ( "function" === typeof(callback) ) {
    script.onload = function() {
      callback();

      // Clear it out to avoid getting called more than once or any memory leaks.
      script.onload = script.onreadystatechange = undefined;
    };
    script.onreadystatechange = function() {
      if ( "loaded" === script.readyState || "complete" === script.readyState ) {
        script.onload();
      }
    };
  }

  // Attach the script tag to the page (before the first script) so the
  //magic can happen.
  firstScript.parentNode.insertBefore(script, firstScript);
}

function startQUnit() {
  QUnit.config.reorder = false;
}

function asyncParForEach(array, fn, callback) {
  if (array.length === 0) {
    callback(); // done immediately
    return;
  }
  var toLoad = array.shift();
  fn(toLoad, function() {
    asyncParForEach(array, fn, callback);
  });
}

var source = window.location.search.match(/[?&]test=([^&]+)/);
source = source && source[1] || 'dev';

QUnit.config.testTimeout = 60000;

QUnit.jUnitReport = function(report) {
  document.body.classList.add('testsComplete');
  report.started = started;
  report.completed = new Date();
  report.passed = (report.results.failed === 0);
  window.testReport = report;
};

asyncParForEach(sourceFiles[source], asyncLoadScript, function() {
  asyncParForEach(testFiles, asyncLoadScript, function() {
    startQUnit();
  });
});
