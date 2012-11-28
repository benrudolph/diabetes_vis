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

}

Dashboard.prototype.init = function() {

  // Holds all graphs and visualizations on the dashboard
  this.graphs = [
    {
      type: "day",
      container: "#daySeries",
      graph: new DaySeries("#daySeries"),
    }
  ]
}
