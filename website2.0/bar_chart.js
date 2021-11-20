var margin = {"top": 20, "right": 10, "bottom": 20, "left": 30 }
    var width = 500;
    var height = 500;
    var rectWidth = 100;
    
    // data
    var data = [[50, "red"], [100, "teal"], [125, "yellow"], [75, "purple"], [25, "green"]];
    
    // scales
    var xMax = 5 * rectWidth;
    var xScale = d3.scaleLinear()
    	.domain([0, xMax])
    	.range([margin.left, width - margin.right]);
    var yMax = d3.max(data, function(d){return d[0]});
    var yScale = d3.scaleLinear()
    	.domain([0, yMax])
    	.range([height - margin.bottom, margin.top]);
     
    // svg element
    var svg_bars = d3.select('#svgcontainer');
		
    // bars 
    var rect = svg_bars.selectAll('rect')
    	.data(data)
    	.enter().append('rect')
    	.attr('x', function(d, i){ 
        return xScale(i * rectWidth)})
    	.attr('y', function(d){
        return yScale(d[0])})
    	.attr('width', xScale(rectWidth) - margin.left)
    	.attr('height', function(d){
        return height - margin.bottom - yScale(d[0])})
			.attr('fill', function(d){
        return d[1]})
    	.attr('margin', 0);
    
    // axes
    var xAxis = d3.axisBottom()
    	.scale(xScale)
    	.tickFormat(d3.format('d'));
    var yAxis = d3.axisLeft()
    	.scale(yScale)
    	.tickFormat(d3.format('d'));
    
        svg_bars.append('g')
      	.attr('transform', 'translate(' + [0, height - margin.bottom] + ')')
      	.call(xAxis);
          svg_bars.append('g')
      	.attr('transform', 'translate(' + [margin.left, 0] + ')')
      	.call(yAxis);