//= require ./jquery
//= require ./jquery_ujs
//= require ./list
//= require ./stupidtable
//= require ./jquery.stickytableheaders
//= require ./selectize
//= require ./highlight.pack
//= require ./moment
//= require ./moment-timezone
//= require ./daterangepicker
//= require ./Chart.js
//= require ./chartkick
//= require ./ace/ace
//= require ./ace/ext-language_tools
//= require ./ace/theme-twilight
//= require ./ace/mode-sql
//= require ./ace/snippets/text
//= require ./ace/snippets/sql
//= require ./Sortable
//= require ./bootstrap

$( function () {
  $('.dropdown-toggle').mouseenter( function () {
    $(this).parent().addClass('open');
  });
});

function jsBootstrap(key) {
  var content = $("#js_bootstrap_" + key).attr("content");
  if (!content) return null;
  return $.parseJSON(content);
}

$( function () {
  var page = jsBootstrap("page");
  if (page.controller === "queries" && page.action === "home") {
    var options = {
      valueNames: ["name", "vars", "hide", "creator"],
      item: "search-item",
      page: 200,
      indexAsync: true
    };
    var dashboardValues = jsBootstrap("dashboards");
    var queryValues = jsBootstrap("queries");
    var queryList = new List("queries", options, dashboardValues);
    queryList.add(queryValues);

    var queryIds = {};
    for (var i = 0; i < queryValues.length; i++) {
      queryIds[queryValues[i].id] = true;
    }
  } else if (page.controller === "checks" && (page.action === "new" || page.action === "edit" || page.action === "create" || page.action === "update")) {
    var check = jsBootstrap("check");
    styleSelect("#check_query_id", {options: jsBootstrap("queries"), items: check.query_id ? [check.query_id] : []})
    styleSelect("#check_check_type");
    styleSelect("#check_invert");
    styleSelect("#check_schedule");
  }
})

function styleSelect(selector, selectizeOptions) {
  $(selector).selectize($.extend({}, {highlight: false, maxOptions: 100}, selectizeOptions)).parents(".hide").removeClass("hide");
}

function runQuery(data, success, error) {
  return $.ajax({
    url: window.runQueriesPath,
    method: "POST",
    data: data,
    dataType: "html"
  }).done( function (d) {
    if (d[0] == "{") {
      var response = $.parseJSON(d);
      data.blazer = response;
      setTimeout( function () {
        runQuery(data, success, error);
      }, 1000);
    } else {
      success(d);
    }
  }).fail( function(jqXHR, textStatus, errorThrown) {
    var message = (typeof errorThrown === "string") ? errorThrown : errorThrown.message;
    error(message);
  });
}

function submitIfCompleted($form) {
  var completed = true;
  $form.find("input[name], select").each( function () {
    if ($(this).val() == "") {
      completed = false;
    }
  });
  if (completed) {
    $form.submit();
  }
}

// Prevent backspace from navigating backwards.
// Adapted from Biff MaGriff: http://stackoverflow.com/a/7895814/1196499
function preventBackspaceNav() {
  $(document).keydown(function (e) {
    var preventKeyPress;
    if (e.keyCode == 8) {
      var d = e.srcElement || e.target;
      switch (d.tagName.toUpperCase()) {
        case 'TEXTAREA':
          preventKeyPress = d.readOnly || d.disabled;
          break;
        case 'INPUT':
          preventKeyPress = d.readOnly || d.disabled || (d.attributes["type"] && $.inArray(d.attributes["type"].value.toLowerCase(), ["radio", "reset", "checkbox", "submit", "button"]) >= 0);
          break;
        case 'DIV':
          preventKeyPress = d.readOnly || d.disabled || !(d.attributes["contentEditable"] && d.attributes["contentEditable"].value == "true");
          break;
        default:
          preventKeyPress = true;
          break;
      }
    }
    else {
      preventKeyPress = false;
    }

    if (preventKeyPress) {
      e.preventDefault();
    }
  });
}
