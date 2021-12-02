// this boolean prevents the case of creating a new visualization each time the user clicks the button
// bascially if the visualization has be drawn than we are not gonna exectue the draw_circle function
isCircle = false;

function draw_circle(root) {
  if (isCircle) {
    return;
  }
  isCircle = true;

  // Create the svg element with the specified attributes
  var svg_circle = d3
    .select("svg")
    .attr("class", "circle_chart")
    .style("border-style", "solid")
    .style("border-color", "#343a40")
    .style("margin-bottom", "20px")
    .style("border-radius", "25px");
  (margin = 20),
    (diameter = +svg_circle.attr("width")),
    (g = svg_circle
      .append("g")
      .attr(
        "transform",
        "translate(" + diameter / 2 + "," + diameter / 2 + ")"
      ));

  // Get the color scheme
  var color = d3
    .scaleLinear()
    .domain([-1, 3])
    .range(["hsl(60, 8%, 95%)", "hsl(168, 55%, 40%)"]);

  var pack = d3
    .pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

  root = d3
    .hierarchy(root)
    .sum(function (d) {
      return d.size;
    })
    .sort(function (a, b) {
      return b.value - a.value;
    });

  var focus = root,
    nodes = pack(root).descendants(),
    view;

  var circle = g
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      return d.parent
        ? d.children
          ? "node"
          : "node node--leaf"
        : "node node--root";
    })
    .style("fill", function (d) {
      return d.children ? color(d.depth) : null;
    })
    .on("click", function (d) {
      if (focus !== d) zoom(d), d3.event.stopPropagation();
    });

  var text = g
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .style("fill-opacity", function (d) {
      return d.parent === root ? 1 : 0;
    })
    .style("display", function (d) {
      return d.parent === root ? "inline" : "none";
    })
    .text(function (d) {
      return d.data.name;
    });

  var node = g.selectAll("circle,text");

  svg_circle.style("background", color(-1)).on("click", function () {
    zoom(root);
  });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    focus = d;

    var transition = d3
      .transition()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween("zoom", function (d) {
        var i = d3.interpolateZoom(view, [
          focus.x,
          focus.y,
          focus.r * 2 + margin,
        ]);
        return function (t) {
          zoomTo(i(t));
        };
      });

    transition
      .selectAll("text")
      .filter(function (d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .style("fill-opacity", function (d) {
        return d.parent === focus ? 1 : 0;
      })
      .on("start", function (d) {
        if (d.parent === focus) this.style.display = "inline";
      })
      .on("end", function (d) {
        if (d.parent !== focus) this.style.display = "none";
      });
  }

  function zoomTo(v) {
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function (d) {
      return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    circle.attr("r", function (d) {
      return d.r * k;
    });
  }
}
