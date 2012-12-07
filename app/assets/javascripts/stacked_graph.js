var StackedGraphs= function(selector, width, height) {

  this.width = width || 200
  this.height = height || 60

  this.margin = {
    top: 2,
    right: 40,
    bottom: 20,
    left: 10
  }

  this.stackWidth = 40
  this.stackMargin = 20
  this.stackOffset = 15

  this.container = d3.select(selector)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)

  this.y = d3.scale.linear()
      .domain([0, 1])
      .range([this.height - this.margin.bottom, this.margin.top])

  this.types = ["month", "week", "day"]

  this.x = d3.scale.ordinal()
      .domain(this.types)
      .rangePoints([this.margin.left, this.width - this.margin.right])

  this.ranges = ["low", "optimal", "high"]
}

StackedGraphs.prototype.update = function(data) {
  var that = this

  this.types.forEach(function(type) {
    this.ranges.forEach(function(range) {
      var selection = d3.select(".stack." + type + "." + range)
      var value = data[type][range]

      var start;
      if (range === "low")
        start = value
      else if (range === "optimal")
        start = value + data[type]["low"]
      else if (range === "high")
        start = value + data[type]["optimal"] + data[type]["low"]


      selection
        .transition()
        .duration(1000)
        .attr("y", this.y(start))
        .attr("height", this.y(start - value) - this.y(start))
        .attr("width", this.stackWidth - this.stackMargin)

      selection.select(".title").remove()

      selection.append("title")
        .data([{ value: value, range: range, type: type }])
        .attr("class", "title")
        .text(function(d) { return Math.round(d.value * 100, 2) + "% of time spent in " + d.range + " range for the current " + d.type; })

    }.bind(this))
  }.bind(this))
}

StackedGraphs.prototype.render = function(data) {
  var that = this

  this.types.forEach(function(type) {
    this.container
        .append("svg")
        .attr("x", this.x(type))
        .attr("y", this.margin.top)
        .attr("class", "stacked" + type + " stacked " + type)
        .append("rect")
        .attr("x", this.stackOffset)
        .attr("y", this.margin.top)
        .attr("height", this.y(0) - this.margin.top)
        .attr("width", this.stackWidth - this.stackMargin)
        .attr("class", "outline")
    this.ranges.forEach(function(range) {
      var start;
      if (range === "low")
        start = data[type][range]
      else if (range === "optimal")
        start = data[type][range] + data[type]["low"]
      else if (range === "high")
        start = data[type][range] + data[type]["optimal"] + data[type]["low"]

      this.renderStack(type, range, data[type][range], start)
    }.bind(this))
  }.bind(this))

  this.container
      .selectAll(".stacked")
      .append("text")
      .attr("class", "stackLabel")
      .attr("x", 10)
      .attr("y", this.height / 2 - 10)
      .attr("width", 100)
      .attr("height", 100)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(270 " + 10 + "," + ((this.height / 2) - 10) + ")")
      .text(function(d) {
        var selection = d3.select(this.parentNode)
        if (selection.classed("month"))
          return "month"
        else if (selection.classed("week"))
          return "week"
        else
          return "day"
      })

}

StackedGraphs.prototype.renderStack = function(type, range, value, start) {
  this.container
      .select(".stacked" + type)
      .append("rect")
      .attr("class", "stack " + type + " " + range)
      .attr("x", this.stackOffset)
      .attr("y", this.y(start))
      .attr("height", this.y(start - value) - this.y(start))
      .attr("width", this.stackWidth - this.stackMargin)
      .append("title")
        .data([{ value: value, range: range, type: type }])
        .attr("class", "title")
        .text(function(d) { return Math.round(d.value * 100, 2) + "% of time spent in " + d.range + " range for the current " + d.type; })
}

StackedGraphs.prototype.loadData = function(date_obj, callback) {
  if (!callback) {
    callback = this.render.bind(this)
  }
  d3.json("/diabetes/get_month_glucose_ratios?date="+date_obj.getFullYear()+"-"+(date_obj.getMonth() + 1)+"-"+date_obj.getDate(), function(data) {

    callback(data)
    /*d3.selectAll(".figure .percent").text("%")

    d3.selectAll(".figure").each(function(d) {
      var element = d3.select(this)
      var range = element.attr("range")
      var type = element.attr("type")
      var from = parseInt(element.select(".number").text())
      if (!from)
        from = 0
      $(this).find(".number").countTo({
        from: from,
        to: Math.round(100 * data[type][range], 1),
        speed: 500,
      })
    })
    */
  });
};


