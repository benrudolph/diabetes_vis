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
