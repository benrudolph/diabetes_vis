var Dashboard = function(selector, width, height) {
  this.selector = selector

  this.height = height || 600
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

/*
Dashboard.LAYOUT = {}
Dashboard.LAYOUT[Dashboard.GRAPH_TYPES.DAY].x = 500
Dashboard.LAYOUT[Dashboard.GRAPH_TYPES.DAY].y = 0

Dashboard.LAYOUT[Dashboard.GRAPH_TYPES.WEEK] = {}
Dashboard.LAYOUT[Dashboard.GRAPH_TYPES.WEEK][Dashboard.GLUCOSE_LEVELS.HIGH] = {}
*/

Dashboard.prototype.init = function() {

  // Holds all graphs and visualizations on the dashboard
  this.graphs = [
    {
      type: Dashboard.GRAPH_TYPES.DAY,
      id: Dashboard.GRAPH_TYPES.DAY,
      vis: new DaySeries(this.svg),
      x: 800,
      y: 0
    },
    {
      type: Dashboard.GRAPH_TYPES.WEEK,
      id: "" + Dashboard.GRAPH_TYPES.WEEK + Dashboard.GLUCOSE_LEVELS.HIGH,
      vis: new GlucoseRatiosLineGraph(this.svg, Dashboard.GRAPH_TYPES.WEEK, Dashboard.GLUCOSE_LEVELS.HIGH),
      x: 0,
      y: 0
    },
    {
      type: Dashboard.GRAPH_TYPES.WEEK,
      id: "" + Dashboard.GRAPH_TYPES.WEEK + Dashboard.GLUCOSE_LEVELS.OPTIMAL,
      vis: new GlucoseRatiosLineGraph(this.svg, Dashboard.GRAPH_TYPES.WEEK, Dashboard.GLUCOSE_LEVELS.OPTIMAL),
      x: 0,
      y: 150
    },
    {
      type: Dashboard.GRAPH_TYPES.WEEK,
      id: "" + Dashboard.GRAPH_TYPES.WEEK + Dashboard.GLUCOSE_LEVELS.LOW,
      vis: new GlucoseRatiosLineGraph(this.svg, Dashboard.GRAPH_TYPES.WEEK, Dashboard.GLUCOSE_LEVELS.LOW),
      x: 0,
      y: 300
    },
    {
      type: Dashboard.GRAPH_TYPES.YEAR,
      id: "" + Dashboard.GRAPH_TYPES.YEAR + Dashboard.GLUCOSE_LEVELS.LOW,
      vis: new GlucoseRatiosLineGraph(this.svg, Dashboard.GRAPH_TYPES.YEAR, Dashboard.GLUCOSE_LEVELS.LOW),
      x: 420,
      y: 300
    },
    {
      type: Dashboard.GRAPH_TYPES.YEAR,
      id: "" + Dashboard.GRAPH_TYPES.YEAR + Dashboard.GLUCOSE_LEVELS.OPTIMAL,
      vis: new GlucoseRatiosLineGraph(this.svg, Dashboard.GRAPH_TYPES.YEAR, Dashboard.GLUCOSE_LEVELS.OPTIMAL),
      x: 420,
      y: 150
    },
    {
      type: Dashboard.GRAPH_TYPES.YEAR,
      id: "" + Dashboard.GRAPH_TYPES.YEAR + Dashboard.GLUCOSE_LEVELS.HIGH,
      vis: new GlucoseRatiosLineGraph(this.svg, Dashboard.GRAPH_TYPES.YEAR, Dashboard.GLUCOSE_LEVELS.HIGH),
      x: 420,
      y: 0
    },

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
  var date = d || "2010-10-10"

  this.graphs.forEach(function(graph) {
    switch (graph.type) {
      case Dashboard.GRAPH_TYPES.DAY:
        graph.vis.loadData(date)
        break;
      case Dashboard.GRAPH_TYPES.WEEK:
        graph.vis.loadData(date)
        break;
      case Dashboard.GRAPH_TYPES.YEAR:
        graph.vis.loadData(date)
        break;
    }
  })
}

Dashboard.prototype.render = function() {
  this.graphs.forEach(function(graph) {
    graph.vis.render()
  })
}
