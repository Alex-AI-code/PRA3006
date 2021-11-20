
dataset = [ {disease: "0", count: 10},
{disease: "a", count: 20},
{disease: "b", count: 30},
{disease: "c", count: 40},
{disease: "d", count: 50},
{disease: "e", count: 60},
{disease: "f", count: 70},
{disease: "g", count: 80},
{disease: "h", count: 90},
{disease: "i", count: 100}];

data = dataset.map(function(item) { return {"name": item.disease, "value": item.count} } )

var height = 250;
var width = 250;

var svg_container = d3.select("#histogram").append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 300 300")
  // .attr("transform", "translate(0,100)")
  .classed("svg-content", true);

margin = ({top: 20, right: 0, bottom: 30, left: 40});

xAxis = g => g
.attr("transform", `translate(0,${height - margin.bottom})`)
.style("text-anchor", "middle", "rotate(-90)")
.call(d3.axisBottom(x).tickSizeOuter(0));

yAxis = g => g
.attr("transform", `translate(${margin.left},0)`)
.call(d3.axisLeft(y))
.call(g => g.select(".domain").remove());

x = d3.scaleBand()
.domain(data.map(d => d.name))
.range([margin.left, width - margin.right])
.padding(0.1);

y = d3.scaleLinear()
.domain([0, d3.max(data, d => d.value)]).nice()
.range([height - margin.bottom, margin.top]);

svg_container.append("g")
.attr("fill", "steelblue")
.selectAll("rect")
.data(data)
.enter().append("rect")
.attr("x", d => x(d.name))
.attr("y", d => y(d.value))
.attr("height", d => y(0) - y(d.value))
.attr("width", x.bandwidth());

svg_container.append("g")	
.call(xAxis);

svg_container.append("g")
.call(yAxis);

