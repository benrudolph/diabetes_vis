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

  this.currentDate = "2010-09-04"

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
  this.graphs = [
  /*  {
      type: Dashboard.GRAPH_TYPES.DAY,
      id: Dashboard.GRAPH_TYPES.DAY,
      vis: new DaySeries(this.svg),
      x: (this.width / 2) - 200,
      y: 300
    },*/
    {
      type: Dashboard.GRAPH_TYPES.WEEK,
      id: Dashboard.GRAPH_TYPES.WEEK,
      vis: new WeekHeatmap(this.svg),
      x: 0,
      y: 0
    }
  ]

  this.layout()
  this.loadData()
}

Dashboard.prototype.layout = function() {
  this.graphs.forEach(function(graph) {
    d3.select("#" + graph.id)
        .attr("transform", "translate(" + graph.x + ", " + graph.y + ")")
  })
}

/* Loads all data for each graph */
Dashboard.prototype.loadData = function(d) {
  this.currentDate = d || this.currentDate

  this.graphs.forEach(function(graph) {
    switch (graph.type) {
      case Dashboard.GRAPH_TYPES.DAY:
        graph.vis.loadData(this.currentDate)
        break;
      case Dashboard.GRAPH_TYPES.WEEK:
        graph.vis.loadData(this.currentDate)
        break;
      case Dashboard.GRAPH_TYPES.YEAR:
        graph.vis.loadData(this.currentDate)
        break;
    }
  }.bind(this))
}

Dashboard.prototype.render = function() {
  this.graphs.forEach(function(graph) {
    graph.vis.render()
  })
}
