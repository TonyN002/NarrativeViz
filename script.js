const svg = d3.select("svg");
let currentScene = 0;

d3.csv("https://flunky.github.io/cars2017.csv").then(data => {
  const cleanData = data.filter(d => 
    +d.AverageCityMPG > 0 &&
    +d.AverageHighwayMPG > 0 &&
    +d.EngineCylinders > 0
  ).map(d => ({
    make: d.Make,
    city: +d.AverageCityMPG,
    highway: +d.AverageHighwayMPG,
    cylinders: +d.EngineCylinders
  }));

  const scenes = [scene1, scene2, scene3];

  d3.select("#next").on("click", () => {
    currentScene = (currentScene + 1) % scenes.length;
    svg.selectAll("*").remove();
    scenes[currentScene](cleanData);
  });

  d3.select("#back").on("click", () => {
    currentScene = (currentScene - 1 + scenes.length) % scenes.length;
    svg.selectAll("*").remove();
    scenes[currentScene](cleanData);
  });

  scenes[currentScene](cleanData);
});

function scene1(data) {
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.city))
    .range([50, 850]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.highway))
    .range([550, 50]);

  svg.append("g")
    .attr("transform", "translate(0,550)")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", "translate(50,0)")
    .call(d3.axisLeft(y));

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.city))
    .attr("cy", d => y(d.highway))
    .attr("r", 5)
    .attr("fill", "steelblue");

  const annotations = d3.annotation()
    .annotations([
      {
        note: { label: "City vs. Highway MPG", title: "Scene 1" },
        x: 150, y: 100, dx: 30, dy: 30
      }
    ]);
  svg.append("g").call(annotations);
}

function scene2(data) {
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.city))
    .range([50, 850]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.highway))
    .range([550, 50]);

  svg.append("g")
    .attr("transform", "translate(0,550)")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", "translate(50,0)")
    .call(d3.axisLeft(y));

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.city))
    .attr("cy", d => y(d.highway))
    .attr("r", 5)
    .attr("fill", d => d.cylinders === 4 ? "green" : "#ccc");

  const annotations = d3.annotation()
    .annotations([
      {
        note: { label: "Green dots = 4-cylinder cars", title: "Scene 2" },
        x: 200, y: 120, dx: 40, dy: 20
      }
    ]);
  svg.append("g").call(annotations);
}

function scene3(data) {
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.city))
    .range([50, 850]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.highway))
    .range([550, 50]);

  svg.append("g")
    .attr("transform", "translate(0,550)")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", "translate(50,0)")
    .call(d3.axisLeft(y));

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.city))
    .attr("cy", d => y(d.highway))
    .attr("r", 5)
    .attr("fill", d => (d.city + d.highway > 70) ? "orange" : "#999")
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`Make: ${d.make}<br>City MPG: ${d.city}<br>Highway MPG: ${d.highway}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(300).style("opacity", 0);
    });

  const annotations = d3.annotation()
    .annotations([
      {
        note: { label: "Orange dots = highest efficiency", title: "Scene 3" },
        x: 250, y: 150, dx: 50, dy: -30
      }
    ]);
  svg.append("g").call(annotations);
}
