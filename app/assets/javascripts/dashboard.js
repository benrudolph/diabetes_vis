var Dashboard = function(selector, width, height) {
  this.selector = selector

  this.height = height || 1000
  this.width = width || 1300

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
  this.monthsView = new MonthsView(window.Day.currentDate, 3, 12, 200);

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

}

Dashboard.prototype.extendWeekHeatmap = function() {
  this.weekHeatmap.loadData((window.Day.currentDate),
    this.weekHeatmap.extend.bind(this.weekHeatmap),
    (this.weekHeatmap.extent[0]), -1)
}

Dashboard.prototype.updateDay = function(date) {
  window.Day.currentDate = date

  this.weekHeatmap.loadData(window.Day.currentDate, this.weekHeatmap.update.bind(this.weekHeatmap))
}

window.Day = {
  currentDate: new Date(Date.UTC(2010,9,4))
}
