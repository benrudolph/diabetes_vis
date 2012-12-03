Date.prototype.getNumWeeks = function() {
  var curr_month_end = new Date(this.getFullYear(), this.getMonth() + 1, 0);
  var curr_day = 8 - this.getDay();
  curr_day = (curr_day == 8) ? 1 : curr_day;

  var curr_month_days = curr_month_end.getDate() - curr_day;
  return 1 + Math.ceil(curr_month_days / 7);
};

Date.prototype.endsOnSunday = function() {
  var curr_month_end = new Date(this.getFullYear(), this.getMonth() + 1, 0);
  return curr_month_end.getDay() == 0;
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

  this.start_at_y = 0;

  var y_pos = this.start_at_y;
  this.month_objs = []
  this.months.forEach(function(mo, i) {
    var month_obj = new MonthView(this.svg, mo, increments, calendar_width, 0, y_pos);
    month_obj.render();
    this.month_objs.push(month_obj);
    y_pos += month_obj.getEffectiveHeight();
  }.bind(this));
}

MonthsView.prototype.yTop = function() {
  return this.start_at_y;
};

MonthsView.prototype.yBottom = function() {
  var bottom_obj = this.month_objs[this.n_months - 1];
  return bottom_obj.y_pos + bottom_obj.getEffectiveHeight();
};

MonthsView.prototype.render = function() {
  this.month_objs.forEach(function(month_obj) {
    month_obj.render();
  });
};

MonthsView.prototype.nextMonth = function() {
  var next_month = new Date(this.months[0].getFullYear(), this.months[this.n_months - 1].getMonth() + 1);
  var move_up_by = this.month_objs[0].getEffectiveHeight();
  this.month_objs.forEach(function(month_obj, i) {
    month_obj.moveUpBy(move_up_by, i == 0);
  }.bind(this));
  var month_obj = new MonthView(this.svg, next_month, this.increments, this.calendar_width, 0, this.yBottom());
  month_obj.render();
  this.months.push(next_month);
  this.months.splice(0,1);
  this.month_objs.push(month_obj);
  this.month_objs.splice(0,1);
};

MonthsView.prototype.lastMonth = function() {
  var last_month = new Date(this.months[0].getFullYear(), this.months[0].getMonth() - 1);
  var month_obj = new MonthView(this.svg, last_month, this.increments, this.calendar_width, 0, this.yTop());
  var move_down_by = month_obj.getEffectiveHeight();
  this.month_objs.forEach(function(month_obj, i) {
    month_obj.moveDownBy(move_down_by, i == (this.n_months - 1));
  }.bind(this));
  month_obj.render();
  this.months.splice(0,0,last_month);
  this.month_objs.splice(0,0,month_obj);
  this.months.pop();
  this.month_objs.pop();
};

var MonthView = function(append_to, date_obj, increments, calendar_width, x_pos, y_pos) {
  this.svg = append_to
    .append("svg")
    .attr("class", "month_view")
    .attr("x", x_pos)
    .attr("y", y_pos);

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

MonthView.prototype.render = function() {
  d3.json("get_month_data?increments="+this.increments+"&month="+this.month+"&year="+this.year,
    function(data) {
      data.forEach(function(d) {
          d.date = this.parseDate(d.date);
    }.bind(this));
    // have to do this week counting thing because format strings report week
    // in year, not week in month
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
      .attr("class", "day");

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
          return this.colors(this.glucose_scale(d)); }.bind(this));

    this.days
      .append("rect")
      .attr("width", 40)
      .attr("height", 40)
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", 1);

    this.days
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text(function(d) {
        return this.day(d.date); }.bind(this));
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
      .attr("y", new_y_pos);
  }
  this.y_pos = new_y_pos;
};

MonthView.prototype.getEffectiveHeight = function() {
  var num_weeks = this.date_obj.getNumWeeks();
  var height = this.cell_width * num_weeks;
  return (this.date_obj.endsOnSunday()) ? height : height - this.cell_width;
};

MonthView.prototype.destroy = function() {
  this.svg
    .transition()
    .duration(1000)
    .style("opacity", 0)
    .remove();
};

$(document).ready(function() {
  months_view = new MonthsView(new Date(2012,3), 3, 48, 200);
  months_view.render();
});

