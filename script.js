const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 60, right: 40, bottom: 60, left: 60 };

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
const instruction = d3.select("#instructions");

let currentScene = 0;

const scenes = [
  renderScene0,
  renderScene1,
  renderScene2
];

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

  scenes[currentScene](cleanData);

  d3.select("#next").on("click", () => {
    currentScene = (currentScene + 1) % scenes.length;
    scenes[currentScene](cleanData);
  });

  d3.select("#prev").on("click", () => {
    currentScene = (currentScene - 1 + scenes.length) % scenes.length;
    scenes[currentScene](cleanData);
  });
});

function renderScene0(data) {
  svg.selectAll("*").remove();
  instruction.text("");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  g.append("text").attr("class", "scene-title").attr("x", 0).attr("y", -20).text("Scene 1: MPG Comparison");

  const x = d3.scaleLinear().domain(d3.extent(data, d => d.city)).range([0, chartWidth]);
  const y = d3.scaleLinear().domain(d3.extent(data, d => d.highway)).range([chartHeight, 0]);

  g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));

  g.selectAll("circle").data(data).enter()
    .append("circle")
    .attr("cx", d => x(d.city))
    .attr("cy", d => y(d.highway))
    .attr("r", 5)
    .attr("fill", "#69b3a2");

  const annotations = d3.annotation()
    .annotations([
      {
        note: { label: "General trend of cars' MPG", title: "Fuel Efficiency Spread" },
        x: x(20),
        y: y(30),
        dy: -30,
        dx: 50
      }
    ]);
  g.append("g").call(annotations);
}

function renderScene1(data) {
  svg.selectAll("*").remove();
  instruction.text("");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  g.append("text").attr("class", "scene-title").attr("x", 0).attr("y", -20).text("Scene 2: 4-Cylinder Cars Highlighted");

  const x = d3.scaleLinear().domain(d3.extent(data, d => d.city)).range([0, chartWidth]);
  const y = d3.scaleLinear().domain(d3.extent(data, d => d.highway)).range([chartHeight, 0]);

  g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));

  g.selectAll("circle").data(data).enter()
    .append("circle")
    .attr("cx", d => x(d.city))
    .attr("cy", d => y(d.highway))
    .attr("r", 5)
    .attr("fill", d => d.cylinders === 4 ? "green" : "#ccc");

  const annotations = d3.annotation()
    .annotations([
      {
        note: { label: "Green = 4-cylinder engines", title: "Common Efficient Cars" },
        x: x(25),
        y: y(35),
        dy: -20,
        dx: 70
      }
    ]);
  g.append("g").call(annotations);
}

function renderScene2(data) {
  svg.selectAll("*").remove();
  instruction.text("Hover over a point to see vehicle details.");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  g.append("text").attr("class", "scene-title").attr("x", 0).attr("y", -20).text("Scene 3: Highest Efficiency Cars");

  const x = d3.scaleLinear().domain(d3.extent(data, d => d.city)).range([0, chartWidth]);
  const y = d3.scaleLinear().domain(d3.extent(data, d => d.highway)).range([chartHeight, 0]);

  g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));

  g.selectAll("circle").data(data).enter()
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
        note: { label: "Orange = High efficiency vehicles", title: "Top Performers" },
        x: x(40),
        y: y(50),
        dy: -30,
        dx: 60
      }
    ]);
  g.append("g").call(annotations);
}
