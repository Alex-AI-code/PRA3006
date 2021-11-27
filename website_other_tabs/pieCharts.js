var is_title = false;

// set the dimensions and margins of the graph
var width = 450;
height = 450;
margin = 40;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin;

// append the svg object to the div called 'my_dataviz'
var pie_chart = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 450 450")
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// set the color scale
var color = d3
  .scaleOrdinal()
  .domain(["a", "b", "c", "d", "e", "f"])
  .range(d3.schemeDark2);

var Tooltip_pie = d3
  .select("#my_dataviz")
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
  Tooltip_pie.html("The exact value of<br>this cell is: " + d.value)
    .style("left", d3.mouse(this)[0] + 250 + "px")
    .style("top", d3.mouse(this)[1] + -250 + "px");
};
var mouseleave_pie = function (d) {
  Tooltip_pie.style("opacity", 0);
  d3.select(this).style("stroke", "none").style("opacity", 0.8);
};
// A function that create / update the plot for a given variable:
function show_title(label) {
  console.log("Inside ", is_title);
  if (!is_title) {
    text = d3
      .select("#my_dataviz")
      .append("text")
      .style("font-size", "20px")
      // .style("margin", "35%")
      .text("Dosages for " + label);
  } else {
    new_text = d3.select("text").text("Dosages for " + label);
  }
  is_title = true;
}
function update(data) {
  // Compute the position of each group on the pie:
  var pie = d3
    .pie()
    .value(function (d) {
      console.log("d: ", d.value);
      return d.value;
    })
    .sort(function (a, b) {
      return d3.ascending(a.key, b.key);
    }); // This make sure that group order remains the same in the pie chart
  var data_ready = pie(d3.entries(data));

  // map to data
  var u = pie_chart.selectAll("path").data(data_ready);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  u.enter()
    .append("path")
    .merge(u)
    .transition()
    .duration(1000)
    .attr("d", d3.arc().innerRadius(100).outerRadius(radius))
    .attr("fill", function (d) {
      return color(d.data.key);
    })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1);

  // remove the group that is not present anymore
  u.exit().remove();

  var v = pie_chart.selectAll("path").data(data_ready);
  v.on("mouseover", mouseover_pie)
    .on("mousemove", mousemove_pie)
    .on("mouseleave", mouseleave_pie);
}