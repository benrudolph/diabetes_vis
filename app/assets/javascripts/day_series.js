Date.prototype.adjustTimezone = function(go_forward) {
  if (go_forward) {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours() + this.getTimezoneOffset() / 60, this.getMinutes(), this.getSeconds())
  } else {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours() - this.getTimezoneOffset() / 60, this.getMinutes(), this.getSeconds())
  }
};

var DaySeries = function(svg, data, width, height) {
  this.svg = svg
  this.height = height || 295
  this.width = width || 800

  this.margin = {
    top: 30,
    right: 10,
    bottom: 24,
    left: 70
  }

  this.low = 80
  this.high = 180

  this.id = Dashboard.GRAPH_TYPES.DAY

  this.container = this.svg
      .append("svg:g")
      .attr("id", this.id)
      .attr("class", "daySeries")
      .attr("height", this.height)
      .attr("width", this.width)

  //this.day_data = data.day_data
  //this.day_average_data = data.day_average_data
  this.x = d3
      .time
      .scale()
      .range([this.margin.left , this.width - this.margin.right])

  this.xAverage = d3
      .time
      .scale()
      .range([this.margin.left , this.width - this.margin.right])

  this.yMax = 400

  this.y = d3
      .scale
      .linear()
      .range([this.height - this.margin.bottom, this.margin.top])
      .domain([0, this.yMax])

  //this.isLoading = false;

  /*this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(d3.time.hours, 4)
      .tickFormat(d3.time.format("%I:%M %p"))
      .orient("bottom")*/

  this.xAxisScale = d3.scale.linear()
      .range([this.margin.left , this.width - this.margin.right])
      .domain([0, 24])

  this.xAxis = d3.svg.axis()
      .scale(this.xAxisScale)
      .ticks(6)
      .tickFormat(function(d) {
        // Calculation to convert 24 hour index into 12 hour time.
        var t = d % 12
        if (t === 0)
          t = 12
        t = d > 11 ? t + "pm" : t + "am"
        return t
      })
      .orient("bottom")


  this.yAxis = d3.svg.axis()
      .scale(this.y)
      .ticks(15)
      .orient("left")

  this.line = d3
      .svg
      .line()
      .x(function(d) {
        return this.x(d.timestamp)
      }.bind(this))
      .y(function(d) {
        return +this.y(d.glucose)
      }.bind(this))
      .interpolate("basis")

  this.averageLine = d3
      .svg
      .line()
      .x(function(d) {
        return this.xAverage(d.timestamp)
      }.bind(this))
      .y(function(d) {
        return +this.y(d.glucose)
      }.bind(this))
}

DaySeries.prototype.updateAverage = function(day_average_data) {
  this.day_average_data = day_average_data
  var average = this.container
      .selectAll(".average")
      .data([this.day_average_data])

  average
      .transition()
      .duration(1000)
      .attr("d", this.line)
}

DaySeries.prototype.update = function(data) {
  this.day_data = data.day_data
  this.x.domain(d3.extent([window.Day.currentDate,
                new Date(window.Day.currentDate.getFullYear(),
                         window.Day.currentDate.getMonth(),
                         window.Day.currentDate.getDate() + 1)]))
  console.log(this.x.domain())

  var real = this.container
      .selectAll(".real")
      .data([this.day_data])

  real
      .attr("d", this.line)

  //this.udpateAverage(data.averages)
}

DaySeries.prototype.render = function() {
  //this.day_data = data.day_data
  //this.day_average_data = data.averages

  //this.x.domain(d3.extent(this.day_data, function(d) { return (d.timestamp) }))

  this.x.domain([window.Day.currentDate, window.Day.currentDate.addDays(1)])

  this.xAverage.domain(d3.extent(this.day_average_data, function(d) {
    return d.timestamp
  }))


  var that = this

  var rangeHeight = 2

  this.container
      .selectAll("low range")
      .data(new Array(parseInt(this.low / rangeHeight)))
      .enter()
      .append("rect")
      .attr("class", "low range")
      .attr("x", this.margin.left)
      .attr("y", function(d, i) {
        return this.y(i * rangeHeight)
      }.bind(this))
      .attr("width", this.width - this.margin.left - this.margin.right)
      .attr("height", rangeHeight)
      .style("fill", function(d, i) {
        return window.Utility.getGlucoseColor(i * rangeHeight)
      }.bind(this))

  this.container
      .selectAll("high range")
      .data(new Array(parseInt((this.yMax - this.high) / rangeHeight)))
      .enter()
      .append("rect")
      .attr("class", "high range")
      .attr("x", this.margin.left)
      .attr("y", function(d, i) {
        var value = (i * rangeHeight) + this.high
        return this.y(value)

      }.bind(this))
      .attr("width", this.width - this.margin.left - this.margin.right)
      .attr("height", rangeHeight)
      .style("fill", function(d, i) {
        var value = (i * rangeHeight) + this.high
        return window.Utility.getGlucoseColor(value)
      }.bind(this))


  this.container
      .selectAll(".real")
      .data([this.day_data])
      .enter()
      .append("path")
      .attr("class", "real line")
      .attr("d", this.line)

  this.container
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + this.margin.left + ", 0)")
      .call(this.yAxis)

  this.container
      .append("text")
      .attr("class", "title")
      .attr("y", this.margin.top - 10)
      .attr("x", (this.width - this.margin.left - this.margin.right) / 2 + this.margin.left)
      .attr("width", (this.width - this.margin.left - this.margin.right) / 2)
      .attr("height", 15)
      .attr("text-anchor", "middle")
      .text("Blood glucose levels (mg/dl) over a day")

  this.container
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
        var coords = d3.mouse(d3.select("#overlayContainer")[0][0])
        this.highlight(coords[0])
      }.bind(this))
      .on("mouseout", function() {
        this.highlightRemove()
      }.bind(this))

}

DaySeries.prototype.highlightRemove = function() {
  d3.selectAll(".guide").remove()
  d3.selectAll(".highlight").remove()
  d3.selectAll(".popup").remove()
  d3.selectAll(".popupText").remove()
}

DaySeries.prototype.highlightFromDate = function(date) {
  // Largets of hacks to offset for the timezone. 25200 is 7 hours in seconds
  var d = new Date(((+date / 1000) - 25200) * 1000)
  this.highlight(this.x(d) - this.margin.left)
}

DaySeries.prototype.highlight = function(x) {
  this.highlightRemove()

  var real = d3.select(".real")[0][0]

  var highlightReal = window.Utility.getPointOnPath(x + this.margin.left, real)

  if (highlightReal.x === 0 && highlightReal.y === 0)
    return

  d3.select("#overlayContainer")
      .append("rect")
      .attr("class", "guide")
      .attr("x", x)
      .attr("y", 0)
      .attr("width", 1)
      .attr("height", this.height - this.margin.bottom - this.margin.top)

  this.container
      .selectAll(".highlight")
      .data([highlightReal])
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

  var popupHeight = 30
  var popupWidth = 50

  this.container
      .selectAll(".popup")
      .data([highlightReal])
      .enter()
      .append("rect")
      .attr("class", "popup")
      .attr("x", function(d) {
        return d.x
      })
      .attr("y", function(d) {
        return d.y - popupHeight
      })
      .attr("width", popupWidth)
      .attr("height", popupHeight)
      .attr("rx", 10)
      .attr("ry", 10)

  this.container
      .selectAll(".popupText")
      .data([highlightReal])
    .enter().append("text")
      .attr("class", "popupText")
      .attr("x", function(d) {
        return d.x + (popupWidth / 2)
      })
      .attr("y", function(d) {
        return d.y - (popupHeight / 2) + 3
      })
      .attr("width", 50)
      .attr("text-anchor", "middle")
      .text(function(d) {
        return d3.round(this.y.invert(d.y), 1)
      }.bind(this))




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

DaySeries.prototype.loadData = function(date, limit, callback) {
  if (!callback) {
    callback = this.render.bind(this)
  }
  d3.select(".daySeries")
      .transition()
      .duration(1000)
      .style("opacity", 0.2)

    $.ajax({
      url: "/diabetes/day",
      type: "GET",
      data: { stamp: +date / 1000,
              limit: limit },
      success: function(data) {
        //this.isLoading = false;
        d3.select(".daySeries")
            .transition()
            .duration(1000)
            .style("opacity", 1)
        data.day_data.forEach(function(d) {
          var tmp = new Date(d.timestamp)
          d.timestamp = tmp.adjustTimezone(true)
        })
        data.averages.forEach(function(d) {
          var tmp = new Date(d.timestamp)
          d.timestamp = tmp.adjustTimezone(true)
        })
        this.day_data = data.day_data
        this.day_average_data = data.averages
        this.isLoading = false;
        callback(data)
      }.bind(this)
    })
}
