String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

$(document).ready(function() {
  //var daySeries = new DaySeries("#daySeries")
  //daySeries.getDay($("#date").val())
  window.dashboard = new Dashboard("#dashboard")
  var options = {
    weekStart: 1 // Want to be consistent and start on monday
  }
  //$("#datepicker").val(Utility.dateToString(window.Day.currentDate))
  $('#datepicker').datepicker(options)
    .on("changeDate", function(event) {
      window.dashboard.updateDay(event.date)
    })
  $('#datepicker').datepicker("setValue", window.Day.currentDate)

  $("#date").change(function(event) {
    daySeries.getDay($("#date").val(), $(".limit:checked").val(), daySeries.update.bind(daySeries))
  })

  $(".limit").change(function(event) {
    daySeries.getAverage($("#date").val(), $(this).val(), daySeries.updateAverage.bind(daySeries))
  })

  function initTooltips() {
    var monthText = "Percentage of {1} spent in the {0} range"
    var weekText = "Percentage of the current week spent in the {0} range"
    var dayText = "Percentage of {2} {1}th spent in the {0} range"
    var options = {}

    d3.selectAll("#figures .month").each(function(d) {
      var month = d3.select(this)
      options.title = monthText.format(month.attr("range"),
          window.Utility.MONTHS[window.Day.currentDate.getMonth()])
      $(this).tooltip(options)
    })
    d3.selectAll("#figures .week").each(function(d) {
      var week = d3.select(this)
      options.title = weekText.format(week.attr("range"))
      $(this).tooltip(options)
    })
    d3.selectAll("#figures .day").each(function(d) {
      var day = d3.select(this)
      options.title = dayText.format(day.attr("range"),
          window.Day.currentDate.getDate().toString(),
          window.Utility.MONTHS[window.Day.currentDate.getMonth()])
      $(this).tooltip(options)
    })
  }

  initTooltips()

  d3.select("#currentDate").text(window.Day.currentDate.getPrettyDate())
})
