var WeekHeatmap = function(svg) {
  this.svg = svg
  this.id = Dashboard.GRAPH_TYPES.WEEK

  this.container = svg
      .append("svg:g")
      .attr("class", "weekHeatmap")
      .attr("id", this.id)

  this.margin = {
    top: 40,
    right: 10,
    bottom: 40,
    left: 100
  }

  this.tileMargin = {
    top: 3,
    middle: 3,
    bottom: 3,
  }

  this.daySelectionMargin = 3

  this.interval = 10
  // Multiply by hours in day
  this.width = (WeekHeatmap.TILE.WIDTH + this.tileMargin.middle) * 24

  // Multiply by days in week
  this.height = (WeekHeatmap.TILE.HEIGHT + this.tileMargin.top + this.tileMargin.bottom) * 7 +
      this.margin.top

  this.x = this.xScale()

  this.y = d3.time.scale.utc()


  this.data = undefined

  // Extent of days shown in heatmap
  this.extent = undefined

  this.daySeries = new DaySeries(svg)
  d3.select("#" + this.daySeries.id)
      .attr("transform", "translate(0, 0)")

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
  WIDTH: 30,
  HEIGHT: 15
}

/*
 * #xScale
 * This creates a separate scale for each hour in the heat map so that it easy to customize spacing between
 * the hour tiles
 */
WeekHeatmap.prototype.xScale = function() {
  var x = {}
  for (var i = 0; i < 24; i ++) {
    var start = (i * (this.tileMargin.middle + WeekHeatmap.TILE.WIDTH)) + this.margin.left
    x[i] = d3.scale.linear()
        .domain([0, 60])
        .range([start, start + WeekHeatmap.TILE.WIDTH])
  }
  return x
}

WeekHeatmap.prototype.getHours = function() {
  var hours = []

  this.weekDates.forEach(function(d) {
    var dayHours = new Array(24)
    for (var i = 0; i < dayHours.length; i++) {
      dayHours[i] = {
        day: d.day,
        date: d.date,
        hour: i
      }
    }
    hours = hours.concat(dayHours)
  })

  return hours
}

/*
 * #update
 * Updates the weekheatmap to a new week as well as updating the day graph associated with the week
 */
WeekHeatmap.prototype.update = function(data) {
  var that = this

  this.daySeries.loadData((window.Day.currentDate), undefined,
      this.daySeries.update.bind(this.daySeries))

  if (data) {
    this.data = data.data
    this.weekDates = data.week_dates
    this.interval = data.interval
  }

  this.extent = d3.extent(this.weekDates, function(d) { return d.date })
  this.y.domain([this.extent[0], new Date(this.extent[0].getUTCFullYear(),
      this.extent[0].getUTCMonth(),
      this.extent[0].getUTCDate() + 6)])
      .range([this.margin.top, this.height - this.margin.bottom])

  var slices = this.container
      .selectAll(".slice")
      .data(this.data, function(d) {
        return d.time
      })

  slices
    .transition()
    .duration(1000)
    .style("fill", function(d) {
      return window.Utility.getGlucoseColor(d.glucose)
    })

  slices
    .exit()
    .remove()


  this.container
      .selectAll(".daySelection")
      .remove()

  this.container
      .selectAll(".tile")
      .remove()

  this.container
      .selectAll(".y.axis")
      .remove()

  this.renderSlices()
  this.renderYAxis()

  // Need to re render tiles and dayselections so that they are ontop of the slices
  this.renderTiles()
  this.renderDaySelections()

}

/*
 * #render
 * data =
 * {
 *   data: [{ glucose: <value>, time: <total minutes>, day: <day> }, ...],
 *   interval: <number based on sampling [0, 60] (5 would mean 5 minutes between each sample)>
 *   days: [ { day: monday, date: <date> }, ...]
 * }
 *
 * This function should only be called once. If you need to make changes to the graph use #update
 */
WeekHeatmap.prototype.render = function(data) {
  this.daySeries.loadData((window.Day.currentDate))

  this.data = data.data
  this.weekDates = data.week_dates
  this.interval = data.interval

  this.extent = d3.extent(this.weekDates, function(d) { return d.date })
  this.y.domain(this.extent)
      .range([this.margin.top, this.height - this.margin.bottom])

  if (!this.data)
    console.log("Alert no data to render graph")

  var that = this

  this.renderSlices()

  this.renderYAxis()

  this.container
      .selectAll(".x.axis")
      .data(new Array(24))
      .enter()
      .append("text")
      .attr("class", "x axis")
      .attr("y", this.margin.top - 4)
      .attr("x", function(d, i) {
        return this.x[i](0) + (WeekHeatmap.TILE.WIDTH / 2)
      }.bind(this))
      .attr("text-anchor", "middle")
      .text(function(d, i) {
        // Calculation to convert 24 hour index into 12 hour time.
        var t = i % 12
        if (t === 0)
          t = 12
        t = i > 11 ? t + "pm" : t + "am"
        return t
      })

  this.renderTiles()
  this.renderDaySelections()


  //this.loadData("2010-10-04", this.update.bind(this))
}

WeekHeatmap.prototype.renderYAxis = function() {
  var format = d3.time.format.utc("%Y-%m-%d %A")
  this.container
      .selectAll(".y.axis")
      .data(this.weekDates)
      .enter()
      .append("text")
      .attr("class", "y axis")
      .attr("y", function(d) {
        return this.y(d.date) + (WeekHeatmap.TILE.HEIGHT / 2)
      }.bind(this))
      .attr("x", 0)
      .attr("text-anchor", "right")
      .attr("dy", ".35em") // vertical-align: middle
      .text(function(d) {
        return format(d.date)
      })

}

WeekHeatmap.prototype.renderSlices = function() {
  var that = this

  this.container
      .selectAll(".slice")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("class", "slice")
      .attr("x", function(d, i) {
        return this.x[parseInt(d.time / 60)](d.time % 60)
      }.bind(this))
      .attr("y", function(d) {
        return this.y(d.date) + .5
      }.bind(this))
      .attr("height", WeekHeatmap.TILE.HEIGHT - 1)
      .attr("width", WeekHeatmap.TILE.WIDTH / (60 / this.interval))
      .style("fill", function(d) {
        return window.Utility.getGlucoseColor(d.glucose)
      })
      .on("mouseover", function(d) {
        if (d.day !== WeekHeatmap.getDayFromDate(that.currentDate))
          return

        var slice = d3.select(this)

        slice.style("stroke", "black")
            .style("stroke-width", "1px")

        that.daySeries.highlightFromDate(d.timestamp)
      })
      .on("mouseout", function(d) {
        var slice = d3.select(this)

        slice.style("stroke", "none")
      })

}

WeekHeatmap.prototype.extend = function(data) {

  this.data = this.data.concat(data.data)
  this.weekDates = this.weekDates.concat(data.week_dates)
  this.interval = data.interval

  this.update()
}

WeekHeatmap.prototype.renderTiles = function() {
  this.hours = this.getHours()

  this.container
      .selectAll(".tile")
      .data(this.hours)
      .enter()
      .append("rect")
      .attr("class", "tile")
      .attr("x", function(d, i) {
        return this.x[parseInt(i % 24)](0)
      }.bind(this))
      .attr("y", function(d, i) {
        return this.y(d.date)
      }.bind(this))
      .attr("width", WeekHeatmap.TILE.WIDTH)
      .attr("height", WeekHeatmap.TILE.HEIGHT)
      .attr("rx", 4)
      .attr("ry", 4)
}

WeekHeatmap.prototype.renderDaySelections = function() {
  var that = this

  this.container
      .selectAll(".daySelection")
      .data(this.weekDates)
      .enter()
      .append("rect")
      .attr("class", function(d) {
        var clazz = "daySelection"
        if (window.Utility.isSameDay(d.date, window.Day.currentDate))
          clazz += " selected"
        return clazz
      }.bind(this))
      .attr("x", function(d) {
        return this.x[0](0) - this.daySelectionMargin
      }.bind(this))
      .attr("y", function(d) {
        return this.y(d.date) - this.daySelectionMargin
      }.bind(this))
      .attr("width", this.width + (2 * this.daySelectionMargin))
      .attr("height", WeekHeatmap.TILE.HEIGHT + (2 * this.daySelectionMargin))
      .attr("rx", this.daySelectionMargin)
      .attr("ry", this.daySelectionMargin)
      .on("mouseover", function(d) {
        if (!window.Utility.isSameDay(d.date, window.Day.currentDate))
          that.daySeries.highlightRemove()
      }.bind(this))
      .on("click", function(d) {

        d3.select(".daySelection.selected").classed("selected", false)
        d3.select(this).classed("selected", true)

        that.currentDate = d.date
        that.daySeries.loadData((d.date), undefined,
            that.daySeries.update.bind(that.daySeries))
      })

}

/*
 * #loadData
 * Loads the data for a given data. Will load most recent monday to sunday. plusWeeks is an optional parameter
 * that specifies how many weeks should be added to the current date. This is because ruby supplies much better
 * utilities for adding dates than javascript does.
 * CurrentDate is a Date object
 */
WeekHeatmap.prototype.loadData = function(currentDate, callback, dateToGet, plusWeeks) {
  if (!callback) {
    callback = this.render.bind(this)
  }

  if (!dateToGet) {
    dateToGet = currentDate
  }

  window.Day.currentDate = currentDate

  $.ajax({
    url: "/diabetes/week",
    type: "GET",
    data: { date: window.Utility.dateToString(dateToGet),
            currentDate: window.Utility.dateToString(currentDate),
            interval: this.interval,
            plus_weeks: plusWeeks },
    success: function(data) {
      data.data.forEach(function(d) {
        d.date = new Date(d.date)
      })
      data.week_dates.forEach(function(d) {
        d.date = new Date(d.date)
      })
      callback(data)
    }
  })
}

WeekHeatmap.getDayFromDate = function(date) {
  var day = date.getUTCDay() - 1
  // Adjust for starting the week on monday
  if (day < 0)
    day = WeekHeatmap.DAYS.length - 1
  return WeekHeatmap.DAYS[day]
}
