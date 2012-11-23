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
