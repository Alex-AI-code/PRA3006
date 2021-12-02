// Create variables for the dimenions
var width = 700,
  height = 450,
  radius = Math.min(width, height) / 2;

// select the location where the visualization will be drawn - here it is my_pie_chart div
var svg_pie = d3
  .select("#my_pie_chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");

svg_pie.append("g").attr("class", "slices");
svg_pie.append("g").attr("class", "labels");
svg_pie.append("g").attr("class", "lines");

// we dont need the .sort() but im leaving in here just to be sure it won't mess the visualization on the website
var pie = d3.layout
  .pie()
  .sort(null)
  .value(function (d) {
    return d.value;
  });

var arc = d3.svg
  .arc()
  .outerRadius(radius * 0.8)
  .innerRadius(radius * 0.4);

var outerArc = d3.svg
  .arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9);

// we center the pie in our svg - for some reason width/2 doesnt give us centered pie so thats why 1.75
svg_pie.attr("transform", "translate(" + width / 1.75 + "," + height / 2 + ")");

var key = function (d) {
  return d.data.label;
};

// Choose the colors of the pie chart, each element of the list is a color for each slice (only three because we have only three units)
var color = d3.scale.ordinal().range(["#b3e6da", "#2d8674", "#6cceba"]);

// Create a tooltip - this tooltip is different from the ones used for barchart
var Tooltip_pie = d3
  .select("#my_pie_chart")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip_pie")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover_pie = function (d) {
  Tooltip_pie.style("opacity", 1);
  d3.select(this).style("stroke", "black").style("opacity", 1);
  console.log(d.group);
};

// -275 left and 200 top for scuffed method of centering the tooltip - very unfortunate
var mousemove_pie = function (d) {
  Tooltip_pie.html("Amount of drugs expressed in this unit: " + d.value)
    .style("left", d3.mouse(this)[0] + -275 + "px")
    .style("top", d3.mouse(this)[1] + 200 + "px");
};

// What happens with each bar after we move the mouse out of it
var mouseleave_pie = function (d) {
  Tooltip_pie.style("opacity", 0);
  d3.select(this).style("stroke", "none").style("opacity", 0.8);
};

// updates the pie chart with new data without redrawing the whole thing
function update_pie(data) {
  /* ------- PIE SLICES -------*/
  var slice = svg_pie
    .select(".slices")
    // .append("a")
    .selectAll("path.slice")
    .data(pie(data), key);

  slice
    .enter()
    .insert("path")
    .style("fill", function (d) {
      return color(d.data.label);
    })
    .attr("class", "slice");

  slice
    .transition()
    .duration(1000)
    .attrTween("d", function (d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function (t) {
        return arc(interpolate(t));
      };
    });

  // add some interactive element to the piechart
  slice
    .on("mouseover", mouseover_pie)
    .on("mousemove", mousemove_pie)
    .on("mouseleave", mouseleave_pie);

  slice.exit().remove();

  /* ------- TEXT LABELS -------*/

  var text = svg_pie.select(".labels").selectAll("text").data(pie(data), key);

  text
    .enter()
    .append("text")
    .attr("dy", ".35em")
    .text(function (d) {
      return d.data.label;
    });

  function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  text
    .transition()
    .duration(1000)
    .attrTween("transform", function (d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function (t) {
        var d2 = interpolate(t);
        var pos = outerArc.centroid(d2);
        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
        return "translate(" + pos + ")";
      };
    })
    .styleTween("text-anchor", function (d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function (t) {
        var d2 = interpolate(t);
        return midAngle(d2) < Math.PI ? "start" : "end";
      };
    });

  text.exit().remove();

  /* ------- SLICE TO TEXT POLYLINES -------*/

  var polyline = svg_pie
    .select(".lines")
    .selectAll("polyline")
    .data(pie(data), key);

  polyline.enter().append("polyline");

  polyline
    .transition()
    .duration(1000)
    .attrTween("points", function (d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function (t) {
        var d2 = interpolate(t);
        var pos = outerArc.centroid(d2);
        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
        return [arc.centroid(d2), outerArc.centroid(d2), pos];
      };
    });

  polyline.exit().remove();
}
