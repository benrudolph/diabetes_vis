var WeekHeatmap = function(svg) {
  this.container = svg
      .append("svg:g")
      .attr("class", "weekHeatmap")

  this.margin = {
    top: 10,
    right: 10,
    bottom: 40,
    left: 40
  }


  // Multiply by hours in day
  this.width = WeekHeatmap.TILE.WIDTH * 24

  // Multiply by days in week
  this.height = WeekHeatmap.TILE.HEIGHT * 7

  this.x = d3.time.scale.utc()
      .range([this.margin.left, this.width - this.margin.right])

  this.y = d3.scale.ordinal()
      .rangePoints([this.margin.top, this.height - this.margin.bottom])
      .domain(WeekHeatmap.DAYS)

  this.data = undefined

}

WeekHeatmap.DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]

WeekHeatmap.TILE = {
  WIDTH: 90,
  HEIGHT: 90
}

/*
 * #render
 * data =
 * {
 *   data: [{ glucose: <value>, timestamp: <date>, day: <day> }, ...],
 *   interval: <number based on sampling [0, 60] (5 would mean 5 minutes between each sample)>
 * }
 */
WeekHeatmap.prototype.render = function(data) {
  this.data = data.data
  this.interval = data.interval

  if (!this.data)
    console.log("Alert no data to render graph")

  this.container
      .data(this.data)
      .enter()
      .append("rect")
      .attr("class", "slice")
      .attr("x", function(d) {
        return this.x(d.timestamp)
      }.bind(this))
      .attr("y", function(d) {
        return this.y(d.day)
      }.bind(this))
      .attr("height", WeekHeatmap.TILE.HEIGHT)
      .attr("width", WeekHeatmap.TILE.WIDTH / (60 / this.interval))
}

WeekHeatmap.prototype.loadData = function(callback) {
  if (!callback) {
    callback = this.render.bind(this)
  }

  $.ajax({
    url: "/diabetes/week_heatmap",
    type: "GET",
    success: function(data) {
      callback(data)
    }
  }
}

