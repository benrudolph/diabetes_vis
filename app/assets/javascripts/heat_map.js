var parseDate = d3.time.format("%Y-%m-%d").parse;
var GlucoseRatiosLineGraph = function() {

};

GlucoseRatiosLineGraph.prototype.init = function() {

  this.height = 150
  this.width = 400

  this.margin = {
    top: 10,
    right: 40,
    bottom: 40,
    left: 40
  }


  this.x_scale = d3.time.scale.utc()
      .range([this.margin.left, this.width - this.margin.right]);

  this.y_scale = d3.scale.linear()
      .range([this.height - this.margin.bottom, this.margin.top])
      .domain([0, 1]);

  this.x_axis = d3.svg.axis().scale(this.x_scale)
      .ticks(this.ticks, 1)
      .tickFormat(this.tickFormat)
      .orient("bottom");

  this.y_axis = d3.svg.axis().scale(this.y_scale)
      .ticks(5)
      .orient("left");

  this.line = d3.svg.line()
      .x(function(d) { return this.x_scale(d.date) }.bind(this))
      .y(function(d) { return this.y_scale(d[this.glucoseLevel]) }.bind(this));

  this.brush = d3.svg.brush()
      .x(this.x_scale)
      .on("brush", this.onBrush.bind(this))
      .on("brushstart", this.onBrushstart.bind(this))
      .on("brushend", this.onBrushend.bind(this))

}

GlucoseRatiosLineGraph.prototype.render = function(data) {
  data.forEach(function(d) {
      d.date = parseDate(d.date);
  });

  this.data = data

  this.brush.data = this.data

  this.x_scale.domain(d3.extent(this.data, function(d) { return d.date; }));

  this.container
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + (this.height - (this.margin.bottom)) + ")")
      .call(this.x_axis);

  this.container
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + this.margin.left + ", 0)")
      .call(this.y_axis);

  this.container
      .selectAll(".line")
      .data([data])
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("d", this.line)

  this.container
      .call(this.brush)
      .selectAll("rect")
      .attr("y", this.margin.top)
      .attr("height", this.height - this.margin.bottom - 10);



};

GlucoseRatiosLineGraph.prototype.update = function(data) {
  this.data = data
  this.x_scale.domain(d3.extent(data, function(d) { return d.date; }));

  var line = this.container
      .selectAll(".line")
      .data([data])

  line
      .transition()
      .duration(1000)
      .attr("d", this.line);
};

GlucoseRatiosLineGraph.prototype.loadData = function(date, callback) {
  if (!callback) {
    callback = this.render.bind(this)
  }
  $.ajax({
    url: this.loadUrl,
    data: { date: date },
    type: "GET",
    success: function(data) {
      if (callback)
        callback(data)
    }
  })

}

GlucoseRatiosLineGraph.prototype.onBrush = function(d) {};
GlucoseRatiosLineGraph.prototype.onBrushstart = function(d) {};
GlucoseRatiosLineGraph.prototype.onBrushend = function(d) {};

GlucoseRatiosLineGraph.prototype.clearBrush = function() {
  this.container.call(this.brush.clear())
}

GlucoseRatiosLineGraph.prototype.setExtent = function(extent) {
  this.brush.extent(extent)
  this.container
      .call(this.brush)
}

/*
 * GlucoseRatiosWeek - inherits GlucoseRatiosLineGraph
 */

var GlucoseRatiosWeek = function(svg, glucoseLevel, dashboard) {
  this.loadUrl = "/diabetes/get_daily_glucose_ratios"
  this.ticks = d3.time.days;
  this.tickFormat = d3.time.format.utc("%a");

  this.dashboard = dashboard

  this.glucoseLevel = glucoseLevel

  this.id = "week" + this.glucoseLevel

  this.container = svg
      .append("svg:g")
      .attr("class", "week " + this.glucoseLevel)
      .attr("id", this.id)

  this.init()

};

GlucoseRatiosWeek.prototype = new GlucoseRatiosLineGraph();

GlucoseRatiosWeek.prototype.onBrushstart = function(d) {
  this.dashboard.setActiveBrush(this.id, this.brush.extent(), Dashboard.GRAPH_TYPES.WEEK)
};

GlucoseRatiosWeek.prototype.onBrush = function(d) {
  this.dashboard.setActiveBrush(this.id, this.brush.extent(), Dashboard.GRAPH_TYPES.WEEK)
};


/*
 * GlucoseRatiosYear - inherits GlucoseRatiosLineGraph
 */

var GlucoseRatiosYear = function(svg, glucoseLevel, dashboard) {
  this.loadUrl = "/diabetes/get_monthly_glucose_ratios"
  this.ticks = d3.time.months;
  this.tickFormat = d3.time.format.utc("%m");

  this.dashboard = dashboard

  this.glucoseLevel = glucoseLevel

  this.id = "year" + this.glucoseLevel

  this.container = svg
      .append("svg:g")
      .attr("class", "year " + this.glucoseLevel)
      .attr("id", this.id)

  this.init()
};

GlucoseRatiosYear.prototype = new GlucoseRatiosLineGraph();

GlucoseRatiosYear.prototype.onBrushstart = function(d) {
  this.dashboard.setActiveBrush(this.id, this.brush.extent(), Dashboard.GRAPH_TYPES.YEAR)
};

GlucoseRatiosYear.prototype.onBrush = function(d) {
  this.dashboard.setActiveBrush(this.id, this.brush.extent(), Dashboard.GRAPH_TYPES.YEAR)
};



/*
d3.json("get_daily_glucose_ratios?year=2012&month=0&week=0",
  function(data) {
    data.forEach(function(d) {
        d.date = parseDate(d.date);
    });
    ratio_graphs = [];
    ratio_graphs.push(new GlucoseRatiosLineGraph("#graph1", data, "low", 400, 150, "days"));
    ratio_graphs.push(new GlucoseRatiosLineGraph("#graph2", data, "optimal", 400, 150, "days"));
    ratio_graphs.push(new GlucoseRatiosLineGraph("#graph3", data, "high", 400, 150, "days"));
    ratio_graphs.forEach(function(ratio_graph) {
      ratio_graph.render(data);
    });
  });

d3.json("get_monthly_glucose_ratios?year=2011",
  function(data) {
    data.forEach(function(d) {
        d.date = parseDate(d.date);
    });
    ratio_graphs2 = [];
    ratio_graphs2.push(new GlucoseRatiosLineGraph("#graph4", data, "low", 400, 150, "months"));
    ratio_graphs2.push(new GlucoseRatiosLineGraph("#graph5", data, "optimal", 400, 150, "months"));
    ratio_graphs2.push(new GlucoseRatiosLineGraph("#graph6", data, "high", 400, 150, "months"));
    ratio_graphs2.forEach(function(ratio_graph2) {
      ratio_graph2.render(data);
    });
  });

$(document).ready(function () {
  var year_selector = document.getElementById("year_selector");
  var month_selector = document.getElementById("month_selector");
  var week_selector = document.getElementById("week_selector");

  function getYear() {
    return year_selector.options[year_selector.selectedIndex].value;
  }

  function getMonth() {
    return month_selector.options[month_selector.selectedIndex].value;
  }

  function getWeek() {
    return week_selector.options[week_selector.selectedIndex].value;
  }

  function updateWeekSelector() {
    var year = getYear();
    var month = getMonth();
    var curr_month = new Date(year, month);
    var curr_month_end = new Date(year, month + 1, 0);
    var curr_day = 8 - curr_month.getDay();
    curr_day = (curr_day == 8) ? 1 : curr_day;

    // make an adjustment for months that don't start on monday
    var curr_month_days = curr_month_end.getDate() - curr_day;
    var weeks = 1 + Math.ceil(curr_month_days / 7);
    var n_options = week_selector.options.length;
    for (var i = 0; i < n_options; i++) {
      week_selector.options.remove();
    }
    for (var i = 0; i < weeks; i++) {
      week_selector.options.add(new Option(i));
    }
  };

  updateWeekSelector();

  year_selector.onchange = function () {
    updateWeekSelector();
    updateWeekGraph();
  };

  month_selector.onchange = function () {
    updateWeekSelector();
    updateWeekGraph();
  };

  function updateWeekGraph() {
    d3.json("get_daily_glucose_ratios?year="+getYear()+"&month="+getMonth()+"&week="+getWeek(),
      function(data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
        });
        ratio_graphs.forEach(function(ratio_graph) {
          ratio_graph.update(data);
        });
      });
  };

  week_selector.onchange = function () {
    updateWeekGraph();
  };
});
*/

