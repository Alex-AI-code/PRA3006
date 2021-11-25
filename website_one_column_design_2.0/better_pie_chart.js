var width = 700,
  height = 450,
  radius = Math.min(width, height) / 2;

var svg_pie = d3
  .select("#my_pie_chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");

svg_pie.append("g").attr("class", "slices");
svg_pie.append("g").attr("class", "labels");
svg_pie.append("g").attr("class", "lines");

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

svg_pie.attr("transform", "translate(" + width / 1.75 + "," + height / 2 + ")");

var key = function (d) {
  return d.data.label;
};

var color = d3.scale
  .ordinal()
  .domain([
    "Lorem ipsum",
    "dolor sit",
    "amet",
    "consectetur",
    "adipisicing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
  ])
  .range([
    "#98abc5",
    "#8a89a6",
    "#7b6888",
    "#6b486b",
    "#a05d56",
    "#d0743c",
    "#ff8c00",
  ]);

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
};

// 250 left and -250 top for scuffed method of centering the tooltip
var mousemove_pie = function (d) {
  Tooltip_pie.html("Value: " + d.value)
    .style("left", d3.mouse(this)[0] + -275 + "px")
    .style("top", d3.mouse(this)[1] + 200 + "px");
};
var mouseleave_pie = function (d) {
  Tooltip_pie.style("opacity", 0);
  d3.select(this).style("stroke", "none").style("opacity", 0.8);
};
function update_pie(data) {
  /* ------- PIE SLICES -------*/
  var slice = svg_pie
    .select(".slices")
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
