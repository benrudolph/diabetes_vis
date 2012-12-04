Date.prototype.getNumWeeks = function() {
  var curr_month_end = new Date(this.getFullYear(), this.getMonth() + 1, 0);
  var curr_day = 8 - this.getDay();
  curr_day = (curr_day == 8) ? 1 : curr_day;

  var curr_month_days = curr_month_end.getDate() - curr_day;
  return 1 + Math.ceil(curr_month_days / 7);
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

var MonthsView = function(date_obj, n_months, increments, calendar_width) {

  this.svg = d3
    .select("#months_view")
    .append("svg")
    .attr("class", "months_view");

  this.n_months = n_months;
  this.increments = increments;
  this.calendar_width = calendar_width;
  var start_range = new Date(date_obj.getFullYear(), date_obj.getMonth() - n_months + 1);
  var stop_range = new Date(date_obj.getFullYear(), date_obj.getMonth() + 1);
  this.months = d3.time.months(start_range, stop_range);

  this.start_at_y = 80;
  this.svg
    .append("svg:image")
    .attr("xlink:href", "/images/arrow_up.png")
    .attr("x", 80)
    .attr("y", 20)
    .attr("width", 25)
    .attr("height", 25)
    .on("click", function() { this.lastMonth() }.bind(this));

  var y_pos = this.start_at_y;
  this.month_objs = []
  this.months.forEach(function(mo, i) {
    var month_obj = new MonthView(this.svg, mo, increments, calendar_width, 0, y_pos);
    month_obj.render(true);
    this.month_objs.push(month_obj);
    y_pos += month_obj.getEffectiveHeight();
  }.bind(this));

  this.svg
    .append("svg:image")
    .attr("xlink:href", "/images/arrow_dn.png")
    .attr("x", 80)
    .attr("y", (this.calendar_width / 7) * 6 * this.n_months)
    .attr("width", 25)
    .attr("height", 25)
    .on("click", function() { this.nextMonth() }.bind(this));
}

MonthsView.prototype.yTop = function() {
  return this.start_at_y;
};

MonthsView.prototype.yBottom = function() {
  var bottom_obj = this.month_objs[this.n_months - 1];
  return bottom_obj.y_pos + bottom_obj.getEffectiveHeight();
};

MonthsView.prototype.nextMonth = function() {
  var next_month = new Date(this.months[this.n_months - 1].getFullYear(), this.months[this.n_months - 1].getMonth() + 1);
  var move_up_by = this.month_objs[0].getEffectiveHeight();
  var month_obj = new MonthView(this.svg, next_month, this.increments, this.calendar_width, 0, this.yBottom());
  month_obj.render(false, function() {
    this.months.push(next_month);
    this.month_objs.push(month_obj);

    this.month_objs.forEach(function(month_obj, i) {
      month_obj.moveUpBy(move_up_by, i == 0);
    }.bind(this));

    this.months.splice(0,1);
    this.month_objs.splice(0,1);
  }.bind(this));
};

MonthsView.prototype.lastMonth = function() {
  var last_month = new Date(this.months[0].getFullYear(), this.months[0].getMonth() - 1);
  var month_obj = new MonthView(this.svg, last_month, this.increments, this.calendar_width, 0, this.yTop());
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
  }.bind(this));
};

var MonthView = function(append_to, date_obj, increments, calendar_width, x_pos, y_pos) {
  this.svg = append_to
    .append("svg")
    .attr("class", "month_view")
    .attr("x", x_pos)
    .attr("y", y_pos)
    .style("opacity", 0);

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
  this.glucose_scale = d3
    .scale
    .linear()
    .domain([0, 500])
    .range([0, 1]);
};

MonthView.prototype.render = function(visible, callback) {
  d3.json("get_month_data?increments="+this.increments+"&month="+this.month+"&year="+this.year,
    function(data) {
      data.forEach(function(d) {
          d.date = this.parseDate(d.date);
    }.bind(this));
    // have to do this week counting thing because format strings report week
    // in year, not week in month

    this.border_line = d3.svg.line()
      .x(function(d){return d.x;})
      .y(function(d){return d.y;})
      .interpolate("linear");

    this.border_el = this.svg
      .append("svg:path")
      .attr("d", this.border_line(this.computeBorderCoordinates()))
      .style("stroke-width", 5)
      .style("stroke", "black")
      .style("fill", "none");

    this.cur_week = 0;
    this.days = this.svg
      .selectAll("svg")
      .data(data)
      .enter()
      .append("svg")
      .attr("x", function(d) {
        return this.wday(d.date) * this.cell_width; }.bind(this))
      .attr("y", function(d) {
        this.cur_week = (+this.wday(d.date) == 0) ? this.cur_week + 1 : this.cur_week;
        return this.cur_week * this.cell_width; }.bind(this))
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
          .attr("width", +el.attr("width") + 20)
          .attr("height", +el.attr("height") + 20)
          .style("opacity", .8);
        blink
          .transition()
          .duration(1000)
          .style("opacity", 0)
          .remove();
      });

    this.colors = d3.interpolateRgb(d3.rgb(0,0,255), d3.rgb(255,0,0));
    this.days
        .selectAll("svg")
        .data(function(d) {
          return d.glucose; })
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          return i * (this.cell_width / this.increments); }.bind(this))
        .attr("width", this.cell_width / this.increments)
        .attr("height", this.cell_width)
        .attr("class", "gradient_rect")
        .style("fill", function(d) {
          return window.Utility.getGlucoseColor(d); }.bind(this));

    this.days
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
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
  return height - this.cell_width;
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
  return coords;
}


$(document).ready(function() {
  months_view = new MonthsView(new Date(2012,3), 3, 12, 210);
});
