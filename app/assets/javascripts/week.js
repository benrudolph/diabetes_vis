Date.prototype.addDays = function(nDays) {
  return new Date(
      this.getFullYear(),
      this.getMonth(),
      this.getDate() + nDays,
      this.getHours(),
      this.getMinutes(),
      this.getSeconds())
}

Date.prototype.subtractDays = function(nDays) {
  return new Date(
      this.getFullYear(),
      this.getMonth(),
      this.getDate() - nDays,
      this.getHours(),
      this.getMinutes(),
      this.getSeconds())
}

var WeekHeatmap = function(svg) {
  this.svg = svg
  this.id = Dashboard.GRAPH_TYPES.WEEK

  this.container = svg
      .append("svg:g")
      .attr("class", "weekHeatmap")
      .attr("id", this.id)

  this.margin = {
    top: 0,
    right: 10,
    bottom: 40,
    left: 70
  }

  this.tileMargin = {
    top: 3,
    middle: 0,
    bottom: 3,
  }

  this.daySelectionMargin = 3

  this.interval = 15
  // Multiply by hours in day
  this.width = (WeekHeatmap.TILE.WIDTH + this.tileMargin.middle) * 24

  // Multiply by days in week
  this.weekHeight = (WeekHeatmap.TILE.HEIGHT) * 7

  this.x = this.xScale()

  this.y = d3.scale.ordinal()
      .rangePoints([2 * this.tileMargin.top, this.weekHeight + (2 * this.tileMargin.bottom)])
      .domain(WeekHeatmap.DAYS)

  this.yWeek = d3.scale.ordinal()
      .rangePoints([this.margin.top, (3 * this.weekHeight) - this.margin.bottom])


  this.data = {
    before: [],
    current: [],
    after: []
  }

  this.weekDates = {
    before: [],
    current: [],
    after: []
  }


  // Extent of days shown in heatmap
  this.extent = undefined

  this.daySeries = new DaySeries(svg, undefined, this.width + this.margin.left + this.margin.right, undefined)
  d3.select("#" + this.daySeries.id)
      .attr("transform", "translate(0, 0)")

  this.showContext = false

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
  WIDTH: 25,
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

WeekHeatmap.prototype.getHours = function(weekDates) {
  var hours = []

  weekDates.forEach(function(d) {
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

WeekHeatmap.prototype.setData = function(data) {
  this.allData = data.data
  this.allWeekDates = data.week_dates
  this.interval = data.interval
  this.filterData()
}

WeekHeatmap.prototype.filterData = function() {
  this.currentData = this.allData.filter(function(d) {
    if (this.showContext) {
      return d
    } else if (!this.showContext && d.week_context === "current") {
      return d
    }
  }.bind(this))

  this.weekDates = this.allWeekDates.filter(function(d) {
    if (this.showContext) {
      return d
    } else if (!this.showContext && d.week_context === "current") {
      return d
    }
  }.bind(this))

}
/*
 * #update
 */
WeekHeatmap.prototype.update = function(loadDay) {
  var that = this

  if (loadDay || loadDay === undefined) {
    this.daySeries.loadData((window.Day.currentDate), undefined,
        this.daySeries.update.bind(this.daySeries))
  }


  this.container
      .selectAll(".before, .current, .after")
      .remove()

  this.container
      .select("#context")
      .remove()

  this.render(false)
 }

WeekHeatmap.prototype.prepareWeeks = function() {

  if (this.showContext) {
    this.extent = d3.extent(this.weekDates.before.concat(this.weekDates.after), function(d) { return d.date })
    this.yWeek.domain(["before", "current", "after"])
  } else {
    this.extent = d3.extent(this.weekDates.current, function(d) { return d.date })
    this.yWeek.domain(["current", "dummy", "dummy"])
  }

  var before = this.container
      .append("svg")
      .attr("class", "before")
      .attr("x", 0)
      .attr("y", this.yWeek("before"))

  var current = this.container
      .append("svg")
      .attr("class", "current")
      .attr("x", 0)
      .attr("y", this.yWeek("current"))

  var after = this.container
      .append("svg")
      .attr("class", "after")
      .attr("x", 0)
      .attr("y", this.yWeek("after"))


  var weeks = [{ container: before, week: "before" },
      { container: current, week: "current" },
      { container: after, week: "after" }]
  return weeks
}

/*
 * #render
 */
WeekHeatmap.prototype.render = function(loadDay) {
  if (loadDay === undefined)
    loadDay = true
  if (loadDay)
    this.daySeries.loadData((window.Day.currentDate))



  var that = this
  var weeks = this.prepareWeeks()

  d3.selectAll(".after, .before, .current")
      .style("opacity", 0)

  weeks.forEach(function(d) {
    this.renderWeekendSelections(d.container, d.week)
    this.renderSlices(d.container, d.week)
    this.renderYAxis(d.container, d.week)
    this.renderTiles(d.container, d.week)
    this.renderDaySelections(d.container, d.week)

  }.bind(this))

  this.renderArrow()
  var selection;
  if (this.showContext) {
    selection = d3.selectAll(".before, .current, .after")
  } else {
    selection = d3.selectAll(".current")
  }

  selection
      .transition()
      .duration(1000)
      .style("opacity", 1)

  this.container
      .selectAll(".x.axis")
      .data(new Array(24))
      .enter()
      .append("text")
      .attr("class", "x axis")
      .attr("y", -5)
      .attr("x", function(d, i) {
        return this.x[i](0) + (WeekHeatmap.TILE.WIDTH / 2)
      }.bind(this))
      .attr("text-anchor", "middle")
      .text(function(d, i) {
        // Calculation to convert 24 hour index into 12 hour time.
        if (i % 2 == 0) {
          return ''
        }
        var t = i % 12
        if (t === 0)
          t = 12
        t = i > 11 ? t + "pm" : t + "am"
        return t
      })


}

WeekHeatmap.prototype.renderYAxis = function(container, week) {
  //var format = d3.time.format("%Y-%d-%m %A")
  var format = d3.time.format("%A")
  var yAxis = container
      .selectAll(".y.axis")
      .data(WeekHeatmap.DAYS)

  yAxis
    .enter()
      .append("text")
      .attr("class", "y axis")
      .attr("y", function(d) {
        return this.y(d) + (WeekHeatmap.TILE.HEIGHT / 2)
      }.bind(this))
      .attr("x", this.margin.left - (3 * this.tileMargin.top))
      .attr("text-anchor", "end")
      .attr("dy", ".35em") // vertical-align: middle
      .text(function(d) {
        return d.slice(0, 3)
      })

  yAxis
      .transition()
      .duration(1000)
      .style("opacity", function(d) {
        return 1.0
      })

}

WeekHeatmap.prototype.renderArrow = function() {
  if (!this.showContext) {
    this.container
      .append("svg:image")
      .attr("xlink:href", "/images/arrowdown.png")
      .attr("id", "context")
      .attr("x", this.margin.left + this.width / 2 - 25)
      .attr("y", this.yWeek("current") + this.weekHeight + 40)
      .attr("width", 52)
      .attr("height", 25)
      .on("click", function() {
        window.dashboard.toggleWeekHeatmapContext()
      })

  } else {
    this.container
      .append("svg:image")
      .attr("xlink:href", "/images/arrowup.png")
      .attr("id", "context")
      .attr("x", this.margin.left + this.width / 2 - 25)
      .attr("y", this.yWeek("after") + this.weekHeight + 40)
      .attr("width", 52)
      .attr("height", 25)
      .on("click", function() {
        window.dashboard.toggleWeekHeatmapContext()
      })
  }

}

WeekHeatmap.prototype.renderSlices = function(container, week) {
  var that = this

  var slices = container
      .selectAll(".slice")
      .data(this.data[week])

  slices.enter()
      .append("rect")
      .attr("class", "slice")
      .attr("x", function(d, i) {
        return this.x[parseInt(d.time / 60)](d.time % 60)
      }.bind(this))
      .attr("y", function(d) {
        return this.y(d.day) + .5
      }.bind(this))
      .attr("height", WeekHeatmap.TILE.HEIGHT - 1)
      .attr("width", WeekHeatmap.TILE.WIDTH / (60 / this.interval))
      .style("fill", function(d) {
        return window.Utility.getGlucoseColor(d.glucose)
      })
      .on("mouseover", function(d) {
        if (d.day !== WeekHeatmap.getDayFromDate(window.Day.currentDate))
          return

        var slice = d3.select(this)

        slice.style("stroke", "black")
            .style("stroke-width", "1px")

        var tmp = d.timestamp.adjustTimezone(true)
        that.daySeries.highlightFromDate(tmp)
      })
      .on("mouseout", function(d) {
        var slice = d3.select(this)

        slice.style("stroke", "none")
      })

  slices
      .transition()
      .duration(1000)
      .style("opacity", function(d) {
        return 1.0
      })

}

WeekHeatmap.prototype.toggleContext = function() {
  var transitionLength = 1000
  this.showContext = this.showContext ? false : true
  this.animate(transitionLength)
}

WeekHeatmap.prototype.animate = function(transitionLength) {
  var that = this

  if (this.showContext) {
    // Animating the heat map to center before loading
    this.extent = d3.extent(this.weekDates.before.concat(this.weekDates.after), function(d) { return d.date })
    this.yWeek.domain(["before", "current", "after"])

    var context = this.container
        .selectAll(".before, .after")

    context.attr("y", function(d) {
          if (d3.select(this).classed("before"))
            return that.yWeek("before")
          else
            return that.yWeek("after")
        })
    context
        .transition()
        .duration(transitionLength)
        .style("opacity", 1)

    this.container
        .select(".current")
        .transition()
        .duration(transitionLength)
        .attr("y", function(d, i) {
          return that.yWeek("current")
        })

    this.container
        .select("#context")
        .transition()
        .duration(transitionLength)
        .attr("xlink:href", "/images/arrowup.png")
        .attr("y", function(d, i) {
          return that.yWeek("after") + that.weekHeight + 40
        })
  } else {
    this.yWeek.domain(["current", "dummy", "dummy"])
    this.extent = d3.extent(this.weekDates.current, function(d) { return d.date })

    var context = this.container
        .selectAll(".before, .after")

    context
        .transition()
        .duration(transitionLength)
        .style("opacity", 0)

    this.container
        .select(".current")
        .transition()
        .duration(transitionLength)
        .attr("y", function(d, i) {
          return that.yWeek("current")
        })

    this.container
        .select("#context")
        .transition()
        .duration(transitionLength)
        .attr("xlink:href", "/images/arrowdown.png")
        .attr("y", function(d, i) {
          return that.yWeek("current") + that.weekHeight + 40
        })
  }
}

WeekHeatmap.prototype.renderTiles = function(container, week) {
  this.hours = this.getHours(this.weekDates[week])

  var tiles = container
      .selectAll(".tile")
      .data(this.hours)

  tiles.enter()
      .append("rect")
      .attr("class", "tile")
      .attr("x", function(d, i) {
        return this.x[parseInt(i % 24)](0)
      }.bind(this))
      .attr("y", function(d, i) {
        return this.y(d.day)
      }.bind(this))
      .attr("width", WeekHeatmap.TILE.WIDTH)
      .attr("height", WeekHeatmap.TILE.HEIGHT)
      .attr("rx", 4)
      .attr("ry", 4)

  tiles
      .transition()
      .duration(1000)
      .style("opacity", function(d) {
        return 1.0
      })
}

WeekHeatmap.prototype.renderWeekendSelections = function(container, week) {
  var that = this

  var weekendSelections = container
      .selectAll(".weekendSelection")
      .data(this.weekDates[week].filter(function(d) {
        return d.day == "saturday"
      }))

  weekendSelections.enter()
      .append("rect")
      .attr("class", "weekendSelection")
      .attr("x", function(d) {
        return this.x[0](0) - this.daySelectionMargin
      }.bind(this))
      .attr("y", function(d) {
        return this.y(d.day) - this.daySelectionMargin
      }.bind(this))
      .attr("width", this.width + (2 * this.daySelectionMargin))
      .attr("height", (2 * WeekHeatmap.TILE.HEIGHT) + (3 * this.daySelectionMargin))
      .attr("rx", this.daySelectionMargin)
      .attr("ry", this.daySelectionMargin)

}

WeekHeatmap.prototype.renderDaySelections = function(container, week) {
  var that = this

  var daySelections = container
      .selectAll(".daySelection")
      .data(this.weekDates[week])

  daySelections.enter()
      .append("rect")
      .attr("id", function(d) {
        return "daySelection" + +d.date
      })
      .attr("class", function(d) {
        var clazz = "daySelection " + d.day
        if (window.Utility.isSameDay(d.date, window.Day.currentDate))
          clazz += " selected"
        return clazz
      }.bind(this))
      .attr("x", function(d) {
        return this.x[0](0) - this.daySelectionMargin
      }.bind(this))
      .attr("y", function(d) {
        return this.y(d.day) - this.daySelectionMargin
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
        window.dashboard.updateDay(d.date)
      })

}

WeekHeatmap.prototype.updateDay = function(date) {

  // check if date is in range of week heatmap
  if (+date >= +this.extent[0] && +date <= +this.extent[1]) {
    this.daySeries.loadData(date, undefined,
              this.daySeries.update.bind(this.daySeries))
    d3.select(".daySelection.selected").classed("selected", false)
    d3.select("#daySelection" + +date).classed("selected", true)
    this.isLoading = false;
  } else {
    // Not in current view, so let's load it up
    console.log("Loading more data...")
    if (this.showContext) {
      d3.selectAll(".current, .before, .after")
          .transition()
          .duration(1000)
          .style("opacity", .2)
    } else {
      d3.selectAll(".current")
          .transition()
          .duration(1000)
          .style("opacity", .2)
    }
    this.loadData(window.Day.currentDate, this.update.bind(this, false))
  }


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
    data: { stamp: +dateToGet / 1000,
            currentDate: +currentDate / 1000,
            interval: this.interval,
            plus_weeks: plusWeeks,
            context: 1 },
    success: function(data) {
      data.data.forEach(function(d) {
        d.date = new Date(d.date * 1000)
        d.timestamp = new Date(d.timestamp * 1000)
      })
      data.week_dates.forEach(function(d) {
        d.date = new Date(d.date * 1000)
      })
      this.data.before = data.data.filter(function(d) {
        if (d.week_context === "before")
          return d
      })
      this.data.current = data.data.filter(function(d) {
        if (d.week_context === "current")
          return d
      })
      this.data.after = data.data.filter(function(d) {
        if (d.week_context === "after")
          return d
      })
      this.weekDates.before = data.week_dates.filter(function(d) {
        if (d.week_context === "before")
          return d
      })
      this.weekDates.current = data.week_dates.filter(function(d) {
        if (d.week_context === "current")
          return d
      })
      this.weekDates.after = data.week_dates.filter(function(d) {
        if (d.week_context === "after")
          return d
      })
      this.isLoading = false;
      callback(data)
    }.bind(this)
  })
}

WeekHeatmap.getDayFromDate = function(date) {
  var day = date.getDay() - 1
  // Adjust for starting the week on monday
  if (day < 0)
    day = WeekHeatmap.DAYS.length - 1
  return WeekHeatmap.DAYS[day]
}
