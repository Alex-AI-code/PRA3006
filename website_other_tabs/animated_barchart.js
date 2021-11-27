var data1 = [
    { group: "A", value: 4 },
    { group: "B", value: 1000 },
    { group: "C", value: 750 },
  ];
  
  var data2 = [
    { group: "A", value: 7 },
    { group: "B", value: 1 },
    { group: "C", value: 20 },
    { group: "D", value: 10 },
  ];
  
  var margin = { top: 30, right: 0, bottom: 70, left: 0 },
    width = 2 * 460 - margin.left - margin.right,
    height = 2 * 400 - margin.top - margin.bottom;
  
  // append the svg object to the body of the page
  var svg_animated_bar = d3
    .select("#my_bar_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // Initialize the X axis
  var x = d3.scaleBand().range([0, width]).padding(0.2);
  var xAxis = svg_animated_bar
    .append("g")
    .attr("transform", "translate(0," + height + ")");
  
  // Initialize the Y axis
  var y = d3.scaleLinear().domain([1000, 0]).range([height, 0]);
  var yAxis = svg_animated_bar.append("g").attr("class", "myYaxis");
  
  // create a tooltip
  var Tooltip2 = d3
    .select("#my_bar_chart")
    .append("div")
    .style("opacity", 10)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");
  
  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    Tooltip2.style("opacity", 1);
    d3.select(this).style("stroke", "black").style("opacity", 1);
  };
  
  // -900 for scuffed method of centering the tooltip
  var mousemove = function (d) {
    Tooltip2.html("Value " + d.value + "<br> Name: " + d.group)
      .style("left", d3.mouse(this)[0] + -900 + "px")
      .style("top", d3.mouse(this)[1] + "px");
  };
  var mouseleave = function (d) {
    Tooltip2.style("opacity", 0);
    d3.select(this).style("stroke", "none").style("opacity", 0.8);
  };
  
  function get_max_graphs(data) {
    var max = 0;
    for (i = 0; i < data.length; i++) {
      if (data[i].value > max) {
        max = data[i].value;
      }
    }
    return max;
  }
  
  function get_min_graphs(data) {
    var min = data[0].value;
    for (i = 0; i < data.length; i++) {
      if (data[i].value < min) {
        min = data[i].value;
      }
    }
    return min;
  }
  
  // A function that create / update the plot for a given variable:
  function update_animated_bar_chart(data) {
    // TODO: fix this
    var scale = d3
      .scaleLinear()
      .domain([get_min_graphs(data), get_max_graphs(data)])
      .range([height / 2, 0]);
  
    // Update the X axis
    x.domain(
      data.map(function (d) {
        return d.group;
      })
    );
    xAxis
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
  
    // Update the Y axis
    y.domain([
      0,
      d3.max(data, function (d) {
        return d.value;
      }),
    ]);
  
    yAxis.transition().duration(1000).call(d3.axisLeft(y));
  
    // Create the u variable
    var u = svg_animated_bar.selectAll("rect").data(data);
  
    u.enter()
      .append("rect") // Add a new rect for each new elements
      .merge(u) // get the already existing elements as well
      .transition() // and apply changes to all of them
      .duration(1000)
      .attr("x", function (d) {
        return x(d.group);
      })
      .attr("y", function (d) {
        return y(d.value);
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return height - y(d.value);
      })
      .attr("fill", "#69b3a2");
  
    // If less group in the new dataset, I delete the ones not in use anymore
    u.exit().remove();
  
    var v = svg_animated_bar.selectAll("rect").data(data);
    v.on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  }