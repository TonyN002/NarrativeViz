let scene = 0;
let data;
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 50, right: 30, bottom: 50, left: 60 };

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().range([0, innerWidth]);
const y = d3.scaleLinear().range([innerHeight, 0]);

const tooltip = d3.select("body").append("div")
  .style("position", "absolute")
  .style("padding", "4px")
  .style("background", "lightgray")
  .style("display", "none");

d3.csv("https://flunky.github.io/cars2017.csv").then(raw => {
  data = raw.filter(d => +d.AverageCityMPG > 0 && +d.AverageHighwayMPG > 0);
  data.forEach(d => {
    d.city = +d.AverageCityMPG;
    d.highway = +d.AverageHighwayMPG;
    d.cylinders = +d["EngineCylinders"];
  });

  x.domain([0, d3.max(data, d => d.city)]);
  y.domain([0, d3.max(data, d => d.highway)]);

  d3.select("#next").on("click", () => {
    scene++;
    renderScene(scene);
  });

  renderScene(scene);
});

function renderScene(sceneNum) {
  g.selectAll("*").remove(); // Clear previous scene

  // Axes
  g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));
  g.append("text").attr("x", innerWidth / 2).attr("y", innerHeight + 40).text("Average City MPG");
  g.append("text").attr("x", -innerHeight / 2).attr("y", -40).attr("transform", "rotate(-90)").text("Average Highway MPG");

  const dots = g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.city))
    .attr("cy", d => y(d.highway))
    .attr("r", 5)
    .attr("fill", getColor(sceneNum, d => d));

  dots.on("mouseover", function (event, d) {
    tooltip.style("display", "block").html(`${d.Make} ${d.Model}<br/>City: ${d.city}<br/>Highway: ${d.highway}`);
  }).on("mousemove", function (event) {
    tooltip.style("left", (event.pageX + 5) + "px").style("top", (event.pageY - 30) + "px");
  }).on("mouseout", function () {
    tooltip.style("display", "none");
  });

  renderAnnotation(sceneNum);
}

function getColor(sceneNum, d) {
  return function (d) {
    if (sceneNum === 1 && (d.Fuel === "Electricity" || d.Fuel.includes("Hybrid"))) return "green";
    if (sceneNum === 2 && d.cylinders >= 8) return "red";
    return "#444";
  };
}

function renderAnnotation(sceneNum) {
  const annotations = [];

  if (sceneNum === 0) {
    annotations.push({
      note: { title: "Overview", label: "Most vehicles show proportional highway and city MPG" },
      x: x(20),
      y: y(30),
      dx: 80,
      dy: -40
    });
  } else if (sceneNum === 1) {
    annotations.push({
      note: { title: "High Efficiency", label: "Hybrids/Electrics have great city MPG" },
      x: x(60),
      y: y(80),
      dx: 100,
      dy: -50
    });
  } else if (sceneNum === 2) {
    annotations.push({
      note: { title: "Gas Guzzlers", label: "8+ Cylinder cars have low MPG" },
      x: x(12),
      y: y(15),
      dx: 80,
      dy: 50
    });
  }

  const makeAnnotations = d3.annotation().annotations(annotations);
  g.append("g").call(makeAnnotations);
}
