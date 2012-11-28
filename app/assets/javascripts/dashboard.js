var Dashboard = function(selector, width, height) {
  this.selector = selector

  this.height = height || 600
  this.width = width || 1000

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

  this.init()

}

Dashboard.GRAPH_TYPES = {
  DAY: 0,
  WEEK: 1,
  YEAR: 2
}

Dashboard.GLUCOSE_LEVELS = {
  HIGH: 0,
  OPTIMAL: 1,
  LOW: 2
}

Dashboard.prototype.init = function() {

  // Holds all graphs and visualizations on the dashboard
  this.graphs = [
    {
      type: Dashboard.GRAPH_TYPES.DAY,
      id: Dashboard.GRAPH_TYPES.DAY,
      vis: new DaySeries(this.svg),
    },
    {
      type: Dashboard.GRAPH_TYPES.WEEK,
      id: "" + Dashboard.GRAPH_TYPES.WEEK + Dashboard.GLUCOSE_LEVELS.HIGH,
      vis: new GlucoseRatiosLineGraph(this.svg)


  ]

  this.loadData()
}

/* Loads all data for each graph */
Dashboard.prototype.loadData = function(d) {
  var date = d || "2010-10-10"
  var parts = date.split("-")

  var year = date[0]
    , month = date[1]
    , day = date[2]

  this.graphs.forEach(function(graph) {
    switch (graph.type) {
      case Dashboard.GRAPH_TYPES.DAY:
        graph.vis.loadData(date)
        break;
      case Dashboard.GRAPH_TYPES.WEEK:
        graph.vis.loadData(date)
        break;
      case Dashboard.GRAPH_TYPES.YEAR:
        graph.vis.loadData(year)
        break;
    }
  })
}

Dashboard.prototype.render = function() {
  this.graphs.forEach(function(graph) {
    graph.vis.render()
  })
}
