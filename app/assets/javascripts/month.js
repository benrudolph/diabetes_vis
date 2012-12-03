
  /*
$(document).ready(function() {
  svg = d3.select("#month").append("svg").attr("class", "months");
  svg = svg.append("svg").attr("class", "month_view").attr("x", 100);
  var cell_width = 40;
  var parseDate = d3.time.format("%Y-%m-%d").parse;
  var day = d3.time.format("%d");
  var week = d3.time.format("%U");
  // Compute day in week Monday - Sunday, 0 - 6
  var wday = function (date_obj) {
    var curr_day = date_obj.getDay() - 1;
    return (curr_day == -1) ? 6 : curr_day;
  };
  var increments = 24;
  var month = 5;
  var year = 2012;
  var glucose_scale = d3
    .scale
    .linear()
    .domain([0, 500])
    .range([0, 1]);

  d3.json("get_month_data?increments="+increments+"&month="+month+"&year="+year,
    function(data) {
      data.forEach(function(d) {
          d.date = parseDate(d.date);
    });
    // have to do this week counting thing because format strings report week
    // in year, not week in month
    var cur_week = 0;
    days = svg.selectAll("svg")
      .data(data)
      .enter()
      .append("svg")
      .attr("x", function(d) {
        return wday(d.date) * cell_width; })
      .attr("y", function(d) {
        cur_week = (+wday(d.date) == 0) ? cur_week + 1 : cur_week;
        return cur_week * cell_width; })
      .attr("width", cell_width)
      .attr("height", cell_width)
      .attr("class", "day");

    colors = d3.interpolateRgb(d3.rgb(0,0,255), d3.rgb(255,0,0));
    days.selectAll("svg")
        .data(function(d) {
          return d.glucose; })
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          return i * (cell_width / increments); })
        .attr("width", cell_width / increments)
        .attr("height", cell_width)
        .attr("class", "gradient_rect")
        .style("fill", function(d) {
          return colors(glucose_scale(d)); });

    days
      .append("rect")
      .attr("width", 40)
      .attr("height", 40)
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", 1);

    days
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text(function(d) {
        return day(d.date); });
  })
});
*/
/* Update the range of the colors representing glucose. For example, you'd pass
 * it 200, 300 if you want the darkest blue to be 200 and the darkest red to be
 * 300 (leaving the rest of the range beyond those points the same color)
 */
function updateFill(begin, end) {
  var new_scale = d3
    .scale
    .linear()
    .domain([begin, end])
    .range([0, 1]);

  days
    .transition()
    .duration(100)
    .selectAll(".gradient_rect")
    .style("fill", function(d) {
      return colors(new_scale(d)); });
}
