/*
 * Use this object to define helper methods
 */

window.Utility = {}

/*
 * xOffset is the xvalue that you'd like to get the point of.
 * path is the svg path element
 */
Utility.getPointOnPath = function(xOffset, path) {

  var x = xOffset
  var beginning = 0, end = path.getTotalLength(), target;
  while (true) {
    target = Math.floor((beginning + end) / 2);
    pos = path.getPointAtLength(target);
    if ((target === end || target === beginning) && pos.x !== x) {
        break;
    }
    if (pos.x > x)      end = target;
    else if (pos.x < x) beginning = target;
    else                break; //position found
  }

  return pos

}

Utility.GLUCOSE_HIGH = 180
Utility.GLUCOSE_LOW = 80

Utility.MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

Utility.glucoseLowScale = d3.scale.linear()
    .domain([40, 80])
    .range([50, 100])
    .clamp(true)

Utility.glucoseHighScale = d3.scale.linear()
    .domain([180, 400])
    .range([100, 50])
    .clamp(true)

Utility.getGlucoseColor = function(glucose) {
  if (glucose <= this.GLUCOSE_LOW  && glucose !== null) {
    var lightness = this.glucoseLowScale(glucose)
    return "hsl(" + 229 + ",50%," + lightness + "%)";
  } else if (glucose >= this.GLUCOSE_HIGH && glucose !== null) {
    var lightness = this.glucoseHighScale(glucose)
    return "hsl(" + 9 + ",50%," + lightness + "%)";
  } else if (glucose){
    return "#ffffff"
  } else {
    return "#ccc"
  }
}

Utility.dateToString = function(date) {
  return (date.getMonth() + 1) + "/" + date.getDate() + "/" +  date.getFullYear()
}

Utility.stringToDate = function(stringDate) {
  var dateParts = stringDate.split("-")
  return new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
}

Utility.isSameDay = function(date1, date2) {
  return date1.getTime() === date2.getTime()
}
