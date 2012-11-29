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

  this.currentDate = "2010-10-10"

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
      vis: new GlucoseRatiosWeek(this.svg, Dashboard.GLUCOSE_LEVELS.HIGH, this),
      x: 0,
      y: 0
    },
    {
      type: Dashboard.GRAPH_TYPES.WEEK,
      id: "" + Dashboard.GRAPH_TYPES.WEEK + Dashboard.GLUCOSE_LEVELS.OPTIMAL,
      vis: new GlucoseRatiosWeek(this.svg, Dashboard.GLUCOSE_LEVELS.OPTIMAL, this),
      x: 0,
      y: 150
    },
    {
      type: Dashboard.GRAPH_TYPES.WEEK,
      id: "" + Dashboard.GRAPH_TYPES.WEEK + Dashboard.GLUCOSE_LEVELS.LOW,
      vis: new GlucoseRatiosWeek(this.svg, Dashboard.GLUCOSE_LEVELS.LOW, this),
      x: 0,
      y: 300
    },
    {
      type: Dashboard.GRAPH_TYPES.YEAR,
      id: "" + Dashboard.GRAPH_TYPES.YEAR + Dashboard.GLUCOSE_LEVELS.LOW,
      vis: new GlucoseRatiosYear(this.svg, Dashboard.GLUCOSE_LEVELS.LOW, this),
      x: 420,
      y: 300
    },
    {
      type: Dashboard.GRAPH_TYPES.YEAR,
      id: "" + Dashboard.GRAPH_TYPES.YEAR + Dashboard.GLUCOSE_LEVELS.OPTIMAL,
      vis: new GlucoseRatiosYear(this.svg, Dashboard.GLUCOSE_LEVELS.OPTIMAL, this),
      x: 420,
      y: 150
    },
    {
      type: Dashboard.GRAPH_TYPES.YEAR,
      id: "" + Dashboard.GRAPH_TYPES.YEAR + Dashboard.GLUCOSE_LEVELS.HIGH,
      vis: new GlucoseRatiosYear(this.svg, Dashboard.GLUCOSE_LEVELS.HIGH, this),
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

Dashboard.prototype.setActiveBrush = function(id, extent, type) {
  //if (id === this.activeWeekBrush)
  //  return

  this.graphs.forEach(function(graph) {
    if (graph.type === type && graph.id !== id) {
      //graph.vis.clearBrush()
      graph.vis.setExtent(extent)
    }
  })

  this.activeWeekBrush = id

}

Dashboard.prototype.initHandlers = function() {

}
