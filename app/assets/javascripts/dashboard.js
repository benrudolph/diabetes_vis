Date.prototype.getPrettyDate = function() {
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]

  var date = this.getDate()

  switch (date % 10) {
    case 1:
      if (date === 11)
        date += "th"
      else
        date += "st"
      break;
    case 2:
      if (date === 12)
        date += "th"
      else
        date += "nd"
      break;
    case 3:
      if (date === 13)
        date += "th"
      else
        date += "rd"
      break;
    default:
      date += "th"
      break;
  }

  return "{0}, {1} {2} {3}".format(days[this.getDay()], months[this.getMonth()], date, this.getFullYear())
}

var Dashboard = function(selector, width, height) {
  this.selector = selector

  this.height = height || 800
  this.width = width || 800

  this.margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }

  this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr("class", "svg")
      .attr("height", this.height)
      .attr("width", this.width)
      .append("svg:g")


  this.activeWeekBrush = undefined
  this.activeYearBrush = undefined

  this.init()

}

Dashboard.GRAPH_TYPES = {
  DAY: "day",
  WEEK: "week",
  YEAR: "year"
}

Dashboard.GLUCOSE_LEVELS = {
  HIGH: "high",
  OPTIMAL: "optimal",
  LOW: "low"
}


Dashboard.prototype.init = function() {

  // Holds all graphs and visualizations on the dashboard
  this.weekHeatmap = new WeekHeatmap(this.svg)
  this.weekHeatmap.isLoading = false;
  this.weekHeatmap.daySeries.isLoading = false;
  this.monthsView = new MonthsView(window.Day.currentDate, 3, 12, 210);
  this.monthsView.update(window.Day.currentDate)

  this.stackGraphs = new StackedGraphs("#stackedGraphs", undefined, undefined)

  $("#toggle_text").click(function() {
    this.monthsView.text_hidden = !this.monthsView.text_hidden;
    this.monthsView.refreshTextView();
    $("#toggle_text").text((this.monthsView.text_hidden) ? "Date Labels On" : "Date Labels Off");
  }.bind(this));
  this.layout()
  this.loadData()
}

Dashboard.prototype.layout = function() {
    d3.select("#" + this.weekHeatmap.id)
        .attr("transform", "translate(" + 0 + ", " + 300 + ")")
}

/* Loads all data for each graph */
Dashboard.prototype.loadData = function(d) {
  window.Day.currentDate = d || window.Day.currentDate

  this.weekHeatmap.loadData(window.Day.currentDate)

  this.stackGraphs.loadData(window.Day.currentDate)

}

Dashboard.prototype.toggleWeekHeatmapContext = function() {
  this.weekHeatmap.toggleContext()

}

Dashboard.prototype.updateDay = function(date) {
  if (!this.weekHeatmap.daySeries.isLoading && !this.weekHeatmap.isLoading) {
    this.weekHeatmap.daySeries.isLoading = true;
    this.weekHeatmap.isLoading = true;
    window.Day.currentDate = date

    this.weekHeatmap.updateDay(date)
    $('#datepicker').datepicker("setValue", window.Day.currentDate)

    this.weekHeatmap.daySeries.loadData(date, undefined,
        this.weekHeatmap.daySeries.update.bind(this.weekHeatmap.daySeries))

    this.monthsView.update(date)

    this.stackGraphs.loadData(window.Day.currentDate,
        this.stackGraphs.update.bind(this.stackGraphs))

    this.updateTooltips();

    d3.select("#currentDate").text(date.getPrettyDate())
  }
}

Dashboard.prototype.updateTooltips = function() {
  var monthText = "Percentage {1} spent in the {0} range"
  var weekText = "Percentage of the current week spent in the {0} range"
  var dayText = "Percentage of {2} {1}th spent in the {0} range"
  var options = {}

  d3.selectAll("#figures .month").each(function(d) {
    var month = d3.select(this)
    var title = monthText.format(month.attr("range"),
        window.Utility.MONTHS[window.Day.currentDate.getMonth()])
    $(this).tooltip('hide')
        .attr('data-original-title', title)
        .tooltip('fixTitle')
  })
  d3.selectAll("#figures .week").each(function(d) {
    var week = d3.select(this)
    var title = weekText.format(week.attr("range"))
    $(this).tooltip('hide')
        .attr('data-original-title', title)
        .tooltip('fixTitle')
  })
  d3.selectAll("#figures .day").each(function(d) {
    var day = d3.select(this)
    var title = dayText.format(day.attr("range"),
        window.Day.currentDate.getDate().toString(),
        window.Utility.MONTHS[window.Day.currentDate.getMonth()])
    $(this).tooltip('hide')
        .attr('data-original-title', title)
        .tooltip('fixTitle')
  })
}

window.Day = {
  currentDate: new Date(2010,9,4)
}
