// set the dimensions and margins of the graph
var margin = {top: 10, right: 200, bottom: 30, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("./data/stacked_data.csv", function(data) {

    // List of groups (here I have one group per column)
    let allGroup = d3.map(data, function(d){return(d.words)}).keys()

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // A color scale: one color for each group
    let myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

    // Set up scales
    // let xScale = d3.scaleLinear()
    //   .domain(d3.extent(data, function (d) { return d.year; }))
    //   .range([0, width]);

    // let yScale = d3.scaleLinear()
    //   .domain([0, d3.max(data, function (d) { return d3.max(columns, function (c) { return +d[c]; }); })])
    //   .range([height, 0]);
    
    // Add X axis --> it is a date format
    let x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d.year; }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.count; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Initialize line with first group of the list
    var line = svg
      .append('g')
      .append("path")
        .datum(data.filter(function(d){return d.words==allGroup[0]}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.year) })
          .y(function(d) { return y(+d.count) })
        )
        .attr("stroke", function(d){ return myColor("valueA") })
        .style("stroke-width", 4)
        .style("fill", "none")

    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.year; }).left;

    // Create the circle that travels along the curve of chart
    var focus = svg
      .append('g')
      .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    var focusText = svg
      .append('g')
      .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    var selectedGroup = allGroup[0];
    var tooltipData = data.filter(function(d) { return d.words == selectedGroup; }); 
    
    // Create a rect on top of the svg area: this rectangle recovers mouse position
    var rect = svg.append('rect')
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('width', width)
      .attr('height', height);
    // What happens when the mouse move -> show the annotations at the right positions.
    rect.on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]);
      var i = bisect(tooltipData, x0, 1);
      var selectedData = tooltipData[i];
      focus.attr("cx", x(selectedData.year))
          .attr("cy", y(selectedData.count));
      focusText.html("Year: " + selectedData.year + ", Count: " + selectedData.count)
          .attr("x", x(selectedData.year) + 15)
          .attr("y", y(selectedData.count));
    }
    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
      focus.style("opacity", 1)
      focusText.style("opacity",1)
    }
    function mouseout() {
      focus.style("opacity", 0)
      focusText.style("opacity", 0)
    }
    // A function that update the chart
    function update(selectedGroup) {
      var dataFilter = data.filter(function(d) { return d.words == selectedGroup; });
      line.datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(+d.count); })
          )
          .attr("stroke", function(d) { return myColor(selectedGroup); });
    }
    // Initialize the chart with the first group
    update(selectedGroup);
    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
      selectedGroup = d3.select(this).property("value");
      update(selectedGroup);
      tooltipData = data.filter(function(d) { return d.words == selectedGroup; });
    })

})