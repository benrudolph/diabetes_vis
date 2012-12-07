Date.prototype.getNumWeeks = function() {
  return this.endOfMonth().getWeekInMonth();
};

Date.prototype.getDayAdjusted = function() {
    var curr_day = this.getDay() - 1;
    return (curr_day == -1) ? 6 : curr_day;
};

Date.prototype.lastSundayOfMonth = function() {
  var end_of_month = this.endOfMonth();
  if (end_of_month == 0) {
    return end_of_month;
  } else {
    return new Date(end_of_month.getFullYear(), end_of_month.getMonth(), end_of_month.getDate() - end_of_month.getDay());
  }
};

Date.prototype.startsOnMonday = function() {
  return this.startOfMonth().getDay() == 1;
};

Date.prototype.startOfMonth = function() {
  return new Date(this.getFullYear(), this.getMonth());
};

Date.prototype.endOfMonth = function() {
  return new Date(this.getFullYear(), this.getMonth() + 1, 0);
};

Date.prototype.endsOnSunday = function() {
  return this.endOfMonth().getDay() == 0;
};

Date.prototype.isOneMonthBefore = function(date_obj) {
  var last_month = new Date(date_obj.getFullYear(), date_obj.getMonth() - 1);
  return last_month.getFullYear() == this.getFullYear() && last_month.getMonth() == this.getMonth();
};

Date.prototype.isOneMonthAhead = function(date_obj) {
  var next_month = new Date(date_obj.getFullYear(), date_obj.getMonth() + 1);
  return next_month.getFullYear() == this.getFullYear() && next_month.getMonth() == this.getMonth();
};

Date.prototype.getWeekInMonth = function() {
  var start_of_month = this.startOfMonth();
  var starts_on = start_of_month.getDayAdjusted();
  var days = this.getDate();
  if (starts_on == 0) {
    return Math.ceil(days / 7);
  } else {
    var subtract = 7 - starts_on;
    if (days <= subtract) {
      return 1;
    } else {
      return 1 + Math.ceil((days - subtract) / 7);
    }
  }
};

var MonthsView = function(date_obj, n_months, increments, calendar_width) {
  this.text_hidden = false;
  this.svg = d3
    .select("#months_view")
    .append("svg")
    .attr("class", "months_view");
  this.is_interactive = true;

  this.n_months = n_months;
  this.increments = increments;
  this.calendar_width = calendar_width;
  var start_range = new Date(date_obj.getFullYear(), date_obj.getMonth() - n_months + 1);
  var stop_range = new Date(date_obj.getFullYear(), date_obj.getMonth() + 1);
  this.months = d3.time.months(start_range, stop_range);

  this.start_at_y = 50;
  this.svg
    .append("svg:image")
    .attr("xlink:href", "/images/arrowup.png")
    .attr("x", 102)
    .attr("y", 20)
    .attr("width", 50)
    .attr("height", 25)
    .on("click", function() {
      this.lastMonth()
    }.bind(this));

  var y_pos = this.start_at_y;
  this.month_objs = [];
  this.months.forEach(function(mo, i) {
    var month_obj = new MonthView(this.svg, mo, increments, calendar_width, 0, y_pos, this);
    month_obj.render(true);
    this.month_objs.push(month_obj);
    y_pos += month_obj.getEffectiveHeight();
  }.bind(this));

  this.svg
    .append("svg:image")
    .attr("xlink:href", "/images/arrowdown.png")
    .attr("x", 102)
    .attr("y", (this.calendar_width / 7) * 6 * this.n_months - 40)
    .attr("width", 50)
    .attr("height", 25)
    .on("click", function() {
      this.nextMonth()
    }.bind(this));

  var days_in_week = ['m', 't', 'w', 'th', 'f', 's', 'su']
  this.svg
    .selectAll(".days_in_week")
    .data(days_in_week)
    .enter()
    .append("svg:text")
    .attr("x", function(d, i) {
      return 25 + i * 30;
    })
    .attr("y", function(d, i) {
      return 60;
    })
    .text(function(d) { return d; })

};

MonthsView.prototype.refreshTextView = function() {
  this.month_objs.forEach(function(month_obj) {
    month_obj.days
      .selectAll("text")
      .transition()
      .style("opacity", function() {
        return (this.text_hidden) ? 0 : 1;
      }.bind(this));
  }.bind(this));
};

MonthsView.prototype.updateTextData = function(date_obj) {
  d3.json("get_month_glucose_ratios?date="+date_obj.getFullYear()+"-"+(date_obj.getMonth() + 1)+"-"+date_obj.getDate(), function(data) {

    d3.selectAll(".figure .percent").text("%")

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
  });
};

MonthsView.prototype.update = function(date_obj) {
  var target_mo = new Date(date_obj.getFullYear(), date_obj.getMonth());
  if (target_mo <= this.months[this.n_months - 1] && target_mo >= this.months[0]) {
    // we do nothing.... but probably something to update a specific day selection thing
  } else if (date_obj.isOneMonthBefore(this.months[0])) {
    this.marker_date = date_obj;
    this.lastMonth();
    return;
  } else if (date_obj.isOneMonthAhead(this.months[this.n_months - 1])) {
    this.marker_date = date_obj;
    this.nextMonth();
    return;
  } else {
    this.month_objs.forEach(function(month_obj) {
      month_obj.svg
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .attr("x", 500)
        .remove();
    });
    var y_pos = this.start_at_y;
    var start_range = new Date(date_obj.getFullYear(), date_obj.getMonth() - this.n_months + 1);
    var stop_range = new Date(date_obj.getFullYear(), date_obj.getMonth() + 1);
    this.months = d3.time.months(start_range, stop_range);
    this.month_objs = []
    this.months.forEach(function(mo, i) {
      var month_obj = new MonthView(this.svg, mo, this.increments, this.calendar_width, 0, y_pos, this);
      month_obj.render(true);
      this.month_objs.push(month_obj);
      y_pos += month_obj.getEffectiveHeight();
    }.bind(this));
  }
  this.setMarker(date_obj);
  this.updateTextData(date_obj);
};

MonthsView.prototype.updateMarker = function(date_obj, is_next) {
  var should_update = false;
  if (this.marker_date == null) { return false; }
  var num_weeks_in_month = this.marker_date.getNumWeeks();
  var week_in_month = this.marker_date.getWeekInMonth();
  if (week_in_month == 1 || week_in_month == num_weeks_in_month) {
      if ((this.marker_date.isOneMonthAhead(this.months[this.n_months - 1])) &&
          !this.marker_date.startsOnMonday()) {
        this.marker_date = new Date(this.marker_date.getFullYear(), this.marker_date.getMonth(), this.marker_date.getDate() - this.marker_date.getDayAdjusted());
        should_update = true;
      } else if ((this.marker_date.isOneMonthBefore(this.months[0])) &&
                 !this.marker_date.endsOnSunday() && week_in_month == num_weeks_in_month) {
        this.marker_date = new Date(this.marker_date.getFullYear(), this.marker_date.getMonth() + 1, 1);
        should_update = true;
      }
  }
  if ((date_obj.getFullYear() == this.marker_date.getFullYear()) &&
      (date_obj.getMonth() == this.marker_date.getMonth())) {
    should_update = true;
  }
  return should_update;
};

MonthsView.prototype.setMarker = function(date_obj) {
  var ind = this.findIndex(date_obj);
  this.month_objs.forEach(function(month_obj, i) {
    month_obj.clearMarker();
    if (i == ind) {
      month_obj.setMarker(date_obj);
    }
  });
  this.marker_date = date_obj;
};

MonthsView.prototype.findIndex = function(date_obj) {
  var ind = -1;
  for (var i = 0; i < this.months.length; i++) {
    if (this.months[i].getFullYear() == date_obj.getFullYear() &&
        this.months[i].getMonth() == date_obj.getMonth()) {
      ind = i;
      break;
    }
  }
  return ind;
};

MonthsView.prototype.yTop = function() {
  return this.start_at_y;
};

MonthsView.prototype.yBottom = function() {
  var bottom_obj = this.month_objs[this.n_months - 1];
  return bottom_obj.y_pos + bottom_obj.getEffectiveHeight();
};

MonthsView.prototype.nextMonth = function() {
  if (this.is_interactive) {
    this.is_interactive = false; // set lock
    var next_month = new Date(this.months[this.n_months - 1].getFullYear(), this.months[this.n_months - 1].getMonth() + 1);
    var move_up_by = this.month_objs[0].getEffectiveHeight();
    var month_obj = new MonthView(this.svg, next_month, this.increments, this.calendar_width, 0, this.yBottom(), this);
    month_obj.render(false, function() {
      this.months.push(next_month);
      this.month_objs.push(month_obj);

      this.month_objs.forEach(function(month_obj, i) {
        month_obj.moveUpBy(move_up_by, i == 0);
      }.bind(this));

      this.months.splice(0,1);
      this.month_objs.splice(0,1);
      if (this.updateMarker(next_month, true)) {
        this.setMarker(this.marker_date);
      }
      this.is_interactive = true; // release lock
    }.bind(this));
  }
};

MonthsView.prototype.adjustEdgeWeeks = function(is_next) {
  var num_weeks_in_month = date_obj.getNumWeeks();
  var week_in_month = date_obj.getWeekInMonth();
  if (week_in_month == 1) {

  };
  if (is_next) {

  } else {

  }
}

MonthsView.prototype.lastMonth = function() {
  if (this.is_interactive) {
    this.is_interactive = false; // set lock
    var last_month = new Date(this.months[0].getFullYear(), this.months[0].getMonth() - 1);
    var month_obj = new MonthView(this.svg, last_month, this.increments, this.calendar_width, 0, this.yTop(), this);
    var move_down_by = month_obj.getEffectiveHeight();

    month_obj.svg.attr("y", (this.start_at_y - move_down_by));
    month_obj.y_pos = (this.start_at_y - move_down_by);

    month_obj.render(false, function() {
      this.months.splice(0,0,last_month);
      this.month_objs.splice(0,0,month_obj);

      this.month_objs.forEach(function(month_obj, i) {
        month_obj.moveDownBy(move_down_by, i == (this.n_months));
      }.bind(this));

      this.months.pop();
      this.month_objs.pop();
      if (this.updateMarker(last_month, false)) {
        this.setMarker(this.marker_date);
      }
      this.is_interactive = true; // release lock
    }.bind(this));
  }
};

var MonthView = function(append_to, date_obj, increments, calendar_width, x_pos, y_pos, parent_svg) {
  this.parent_svg = parent_svg;
  this.svg = append_to
    .append("svg")
    .attr("class", "month_view")
    .attr("x", x_pos)
    .attr("y", y_pos)
    .style("opacity", 0);

  this.svg
    .append("text")
    .attr("x", 15)
    .attr("y", 140)
    .attr("width", 100)
    .attr("height", 200)
    .attr("transform", "rotate(270 15,140)")
    .text(d3.time.format("%B")(date_obj).toLowerCase());

  this.margin = 20;
  this.x_pos = x_pos;
  this.y_pos = y_pos;
  this.date_obj = date_obj;
  this.calendar_width = calendar_width;
  this.cell_width = this.calendar_width / 7;
  this.parseDate = d3.time.format("%Y-%m-%d").parse;
  this.day = d3.time.format("%d");
  this.week = d3.time.format("%U");
  // Compute day in week Monday - Sunday, 0 - 6
  this.wday = function (date_obj) {
    var curr_day = date_obj.getDay() - 1;
    return (curr_day == -1) ? 6 : curr_day;
  };
  this.increments = increments;
  this.month = date_obj.getMonth() + 1;
  this.year = date_obj.getFullYear();
  this.marker = null;
};

MonthView.prototype.clearMarker = function() {
  if (this.marker !== null) { this.marker.remove(); }
};

MonthView.prototype.setMarker = function(date_obj) {
  var y_pos = this.margin + ((date_obj.getWeekInMonth() - 1) * this.cell_width) + (this.cell_width / 2);
  this.marker = this.svg
    .append("svg:path")
    .attr("transform", "translate(245,"+y_pos+") rotate(90)")
    .attr("id", "marker")
    .attr("d", d3.svg.symbol().type("triangle-down"));
};

MonthView.prototype.render = function(visible, callback) {
  d3.json("get_month_data?increments="+this.increments+"&month="+this.month+"&year="+this.year,
    function(data) {
      data.data.forEach(function(d) {
          d.date = this.parseDate(d.date);
    }.bind(this));
    // have to do this week counting thing because format strings report week
    // in year, not week in month

    this.ratios = data.ratios

    this.border_line = d3.svg.line()
      .x(function(d){return this.margin + d.x;}.bind(this))
      .y(function(d){return this.margin + d.y;}.bind(this))
      .interpolate("linear");

    this.border_el = this.svg
      .append("svg:path")
      .attr("d", this.border_line(this.computeBorderCoordinates()))
      .style("stroke-width", 3)
      .style("stroke", "black")
      .style("opacity", .5)
      .style("fill", "none");

    var first_iteration = true;
    this.cur_week = 0;
    this.days = this.svg
      .selectAll("svg")
      .data(data.data)
      .enter()
      .append("svg")
      .attr("x", function(d) {
        return this.margin + (this.wday(d.date) * this.cell_width); }.bind(this))
      .attr("y", function(d) {
        this.cur_week = (+this.wday(d.date) == 0 && !first_iteration) ? this.cur_week + 1 : this.cur_week;
        first_iteration = false;
        return this.margin + (this.cur_week * this.cell_width); }.bind(this))
      .attr("width", this.cell_width)
      .attr("height", this.cell_width)
      .attr("class", "day")
      .attr("id", function(d) { return d3.time.format("d%Y%m%d")(d.date); });

    var self = this;
    this.days
      .on("click", function(d) {
        var el = d3.select(this);
        var blink = el.append("rect")
          .attr("fill", "white")
          .attr("width", +el.attr("width"))
          .attr("height", +el.attr("height"))
          .style("opacity", .8);
        blink
          .transition()
          .duration(1000)
          .style("opacity", 0)
          .remove();
        window.dashboard.updateDay(d.date)
      });

    this.colors = d3.interpolateRgb(d3.rgb(0,0,255), d3.rgb(255,0,0));
    this.days
        .selectAll("svg")
        .data(function(d) {
          return d.glucose; })
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          return (i * (this.cell_width / this.increments)); }.bind(this))
        .attr("width", this.cell_width / this.increments)
        .attr("height", this.cell_width)
        .attr("class", "gradient_rect")
        .style("fill", function(d) {
          return window.Utility.getGlucoseColor(d); }.bind(this));

    this.days
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", 10)
      .style("opacity", function() {
        return (this.parent_svg.text_hidden) ? 0 : 1;
      }.bind(this))
      .text(function(d) {
        return this.day(d.date); }.bind(this));

    if (visible) {
      this.svg
        .transition()
        .duration(500)
        .style("opacity", 1);
    }

    if (callback !== undefined) {
      callback();
    }
  }.bind(this));
};

MonthView.prototype.moveUpBy = function(move_up_by, remove_after) {
  this.moveBy(-move_up_by, remove_after);
};

MonthView.prototype.moveDownBy = function(move_down_by, remove_after) {
  this.moveBy(move_down_by, remove_after);
};

MonthView.prototype.moveBy = function(y_units, remove_after) {
  var new_y_pos = this.y_pos + y_units;
  if (remove_after) {
    this.svg
      .transition()
      .duration(1000)
      .attr("y", new_y_pos)
      .style("opacity", 0)
      .remove();
  } else {
    this.svg
      .transition()
      .duration(1000)
      .attr("y", new_y_pos)
      .style("opacity", 1);
  }
  this.y_pos = new_y_pos;
};

MonthView.prototype.getEffectiveHeight = function() {
  var num_weeks = this.date_obj.getNumWeeks();
  var height = this.cell_width * num_weeks;
  return (this.date_obj.endsOnSunday()) ? height : height - this.cell_width;
};

MonthView.prototype.computeBorderCoordinates = function() {
  var coords = [];
  var cur_x = this.x_pos;
  var cur_y = 0;
  var cell_width = 30;
  if (this.date_obj.startsOnMonday()) {
    coords.push({x: cur_x, y: cur_y});
  } else {
    cur_x += (this.date_obj.startOfMonth().getDayAdjusted() * cell_width);
    coords.push({x: cur_x, y: cur_y});
  }
  cur_x = 7 * cell_width;
  coords.push({x: cur_x, y: cur_y});
  if (this.date_obj.endsOnSunday()) {
    cur_y += this.date_obj.getNumWeeks() * cell_width;
    coords.push({x: cur_x, y: cur_y});
    cur_x = this.x_pos;
    coords.push({x: cur_x, y: cur_y});
  } else {
    var len_of_last_week = this.date_obj.endOfMonth().getDayAdjusted() + 1;
    cur_y += (this.date_obj.getNumWeeks() - 1) * cell_width;
    coords.push({x: cur_x, y: cur_y});
    cur_x -= (7 - len_of_last_week) * cell_width;
    coords.push({x: cur_x, y: cur_y});
    cur_y += cell_width;
    coords.push({x: cur_x, y: cur_y});
    cur_x -= (len_of_last_week * cell_width);
    coords.push({x: cur_x, y: cur_y});
  }
  if (this.date_obj.startsOnMonday()) {
    cur_y -= this.date_obj.getNumWeeks() * cell_width;
    coords.push({x: cur_x, y: cur_y});
  } else {
    cur_y -= (this.date_obj.getNumWeeks() - 1) * cell_width;
    coords.push({x: cur_x, y: cur_y});
    cur_x += (this.date_obj.startOfMonth().getDayAdjusted()) * cell_width;
    coords.push({x: cur_x, y: cur_y});
    cur_y -= cell_width;
    coords.push({x: cur_x, y: cur_y});
  }
    coords.push({x: cur_x + 3, y: cur_y});
  return coords;
}

//$(document).ready(function() {
//  months_view = new MonthsView(new Date(2012,3), 3, 12, 210);
//});
