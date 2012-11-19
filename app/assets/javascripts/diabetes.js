$(document).ready(function() {
  var daySeries = new DaySeries("#daySeries")
  daySeries.getDay($("#date").val())

  $("#date").change(function(event) {
    daySeries.getDay($("#date").val(), daySeries.update.bind(daySeries))
  })
})

