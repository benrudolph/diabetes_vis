$(document).ready(function() {
  var daySeries = new DaySeries("#daySeries")
  daySeries.getDay($("#date").val())

  $("#date").change(function(event) {
    daySeries.getDay($("#date").val(), $(".limit:checked").val(), daySeries.update.bind(daySeries))
  })

  $(".limit").change(function(event) {
    daySeries.getAverage($("#date").val(), $(this).val(), daySeries.updateAverage.bind(daySeries))
  })
})
