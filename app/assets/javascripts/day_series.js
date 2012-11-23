var DaySeries = function(selector, data, width, height) {
  this.selector = selector
  this.height = height || 500
  this.width = width || 500

  this.margin = {
    top: 10,
    right: 10,
    bottom: 40,
    left: 40
  }

  this.low = 80
  this.high = 180

  this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr("class", "svg")
      .attr("height", this.height)
      .attr("width", this.width)
      .append("svg:g")

  //this.day_data = data.day_data
  //this.day_average_data = data.day_average_data
  this.x = d3
      .time
      .scale
      .utc()
      .range([this.margin.left , this.width - this.margin.right])

  this.y = d3
      .scale
      .linear()
      .range([this.height - this.margin.bottom, this.margin.top])
      .domain([0, 500])

  this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(d3.time.hours, 4)
      .tickFormat(d3.time.format.utc("%I:%M %p"))
      .orient("bottom")

  this.yAxis = d3.svg.axis()
      .scale(this.y)
      .ticks(20)
      .orient("left")

  this.line = d3
      .svg
      .line()
      .x(function(d) {
        return this.x(new Date(d.timestamp))
      }.bind(this))
      .y(function(d) {
        return +this.y(d.glucose)
      }.bind(this))
}

DaySeries.prototype.updateAverage = function(day_average_data) {
  this.day_average_data = day_average_data
  var average = this.svg
      .selectAll(".average")
      .data([this.day_average_data])

  average
      .transition()
      .duration(1000)
      .attr("d", this.line)
}

DaySeries.prototype.update = function(data) {
  this.day_data = data.day_data
  this.x.domain(d3.extent(this.day_data, function(d) { return new Date(d.timestamp) }))

  var real = this.svg
      .selectAll(".real")
      .data([this.day_data])

  real
      .transition()
      .duration(1000)
      .attr("d", this.line)

  this.udpateAverage(data.averages)
}

DaySeries.prototype.render = function(data) {
  this.day_data = data.day_data
  this.day_average_data = data.averages

  this.x.domain(d3.extent(this.day_data, function(d) { return new Date(d.timestamp) }))

  var that = this

  this.svg
      .selectAll(".real")
      .data([this.day_data])
      .enter()
      .append("path")
      .attr("class", "real line")
      .attr("d", this.line)

  this.svg
      .selectAll(".average")
      .data([this.day_average_data])
      .enter()
      .append("path")
      .attr("class", "average line")
      .attr("stroke-dasharray", "5, 5")
      .attr("d", this.line)

  this.svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + (this.height - (this.margin.bottom)) + ")")
      .call(this.xAxis)

  this.svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + this.margin.left + ", 0)")
      .call(this.yAxis)

  this.svg
      .append("rect")
      .attr("class", "low range")
      .attr("x", this.margin.left)
      .attr("y", this.y(this.low))
      .attr("width", this.width - this.margin.left - this.margin.right)
      .attr("height", this.y(this.height - this.low + this.margin.top))

  this.svg
      .append("rect")
      .attr("class", "high range")
      .attr("x", this.margin.left)
      .attr("y", this.margin.top)
      .attr("width", this.width - this.margin.left - this.margin.right)
      .attr("height", this.height - this.high - this.margin.bottom + this.margin.top)

  this.svg
      .append("svg:g")
      .attr("id", "overlayContainer")
      .attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")")
      .append("rect")
      .attr("class", "overlay")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.width - this.margin.left - this.margin.right)
      .attr("height", this.height - this.margin.bottom - this.margin.top)
      .on("mousemove", function() {
        d3.selectAll(".guide").remove()
        d3.selectAll(".highlight").remove()

        var real = d3.select(".real")[0][0]
        var average = d3.select(".average")[0][0]

        var coords = d3.mouse(d3.select("#overlayContainer")[0][0])

        var highlightReal = window.Utility.getPointOnPath(coords[0] + that.margin.left, real)
        var highlightAverage = window.Utility.getPointOnPath(coords[0] + that.margin.left, average)

        d3.select("#overlayContainer")
            .append("rect")
            .attr("class", "guide")
            .attr("x", coords[0])
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", d3.select(this).attr("height"))

        that.svg
            .selectAll(".highlight")
            .data([highlightReal, highlightAverage])
            .enter()
            .append("circle")
            .attr("class", "highlight")
            .attr("cx", function(d) {
              return d.x + .5
            })
            .attr("cy", function(d) {
              return d.y
            })
            .attr("r", 5)


      })
      .on("mouseout", function() {
        d3.selectAll(".guide").remove()
        d3.selectAll(".highlight").remove()
      })

}

DaySeries.prototype.getAverage = function(day, limit, callback) {
  if (!callback) {
    callback = this.updateAverage.bind(this)
  }
  $.ajax({
    url: "/diabetes/day_averages",
    type: "GET",
    data: { day: day,
            limit: limit },
    success: function(data) {
      callback(data)
    }
  })
}

DaySeries.prototype.getDay = function(day, limit, callback) {
  if (!callback) {
    callback = this.render.bind(this)
  }
  $.ajax({
    url: "/diabetes/day",
    type: "GET",
    data: { day: day,
            limit: limit },
    success: function(data) {
      callback(data)
    }
  })
}
