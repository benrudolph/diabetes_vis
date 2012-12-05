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
  this.monthsView = new MonthsView(window.Day.currentDate, 3, 12, 210);

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

Dashboard.prototype.toggleWeekHeatmapContext = function() {
  this.weekHeatmap.toggleContext()

}

Dashboard.prototype.updateDay = function(date) {
  window.Day.currentDate = date

  this.weekHeatmap.updateDay(date)

  this.weekHeatmap.daySeries.loadData(date, undefined,
      this.weekHeatmap.daySeries.update.bind(this.weekHeatmap.daySeries))

  this.monthsView.update(date)
}

window.Day = {
  currentDate: new Date(2010,9,4)
}
