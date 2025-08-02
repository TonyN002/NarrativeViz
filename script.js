let scene = 0;
let data;

const svg = d3.select("#chart");
const width = 900;
const height = 600;
const margin = { top: 80, right: 40, bottom: 60, left: 70 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().range([0, innerWidth]);
const y = d3.scaleLinear().range([innerHeight, 0]);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("padding", "8px")
  .style("background", "#333")
  .style("color", "#fff")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("display", "none");

const makeSelect = d3.select("#make-select");

d3.csv("https://flunky.github.io/cars2017.csv").then(raw => {
  data = raw.filter(d => +d.AverageCityMPG > 0 && +d.AverageHighwayMPG > 0);
  data.forEach(d => {
    d.city = +d.AverageCityMPG;
    d.highway = +d.AverageHighwayMPG;
    d.cylinders = +d.EngineCylinders;
    d.make = d.Make;
  });

  x.domain([0, d3.max(data, d => d.city) + 5]);
  y.domain([0, d3.max(data, d => d.highway) + 5]);

  const uniqueMakes = Array.from(new Set(data.map(d => d.Make))).sort();
  uniqueMakes.forEach(make => {
    makeSelect.append("option").attr("value", make).text(make);
  });

  makeSelect.on("change", () => {
    if (scene === 3) renderScene(3);
  });

  d3.select("#next").on("click", () => {
    scene++;
    renderScene(scene);
  });

  d3.select("#prev").on("click", () => {
    if (scene > 0) {
      scene--;
      renderScene(scene);
    }
  });

  renderScene(scene);
});

function renderScene(sceneNum) {
  g.selectAll("*").remove();
  d3.select("#instructions").remove();
  d3.select("#filter-container").style("display", sceneNum === 3 ? "block" : "none");
  makeSelect.property("value", "All");

  svg.selectAll(".scene-title").remove();

  const titles = [
    { title: "Fuel Efficiency Overview", subtitle: "City MPG vs. Highway MPG" },
    { title: "High-Efficiency Cars", subtitle: "Highlighting Hybrids & Electric Vehicles" },
    { title: "Gas Guzzlers", subtitle: "8+ Cylinder Vehicles Have Lower MPG" },
    { title: "Explore the Data", subtitle: "Hover or Filter to Interact" }
  ];

  svg.append("text")
    .attr("class", "scene-title")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text(titles[sceneNum]?.title || "");

  svg.append("text")
    .attr("class", "scene-title")
    .attr("x", width / 2)
    .attr("y", 55)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "#666")
    .text(titles[sceneNum]?.subtitle || "");

  d3.select("#prev").attr("disabled", sceneNum === 0 ? true : null);
  d3.select("#next").attr("disabled", sceneNum >= 3 ? true : null);

  if (sceneNum === 3) {
    d3.select("body").append("div")
      .attr("id", "instructions")
      .style("margin-top", "20px")
      .style("color", "#444")
      .style("font-size", "15px")
      .style("font-style", "italic")
      .text("🔍 Explore: Hover over points or filter by Make to explore the data yourself.");
  }

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  g.append("g").call(d3.axisLeft(y));

  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 45)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Average City MPG");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Average Highway MPG");

  let sceneData = data;
  if (sceneNum === 3) {
    const selectedMake = makeSelect.property("value");
    if (selectedMake !== "All") {
      sceneData = data.filter(d => d.Make === selectedMake);
    }
  }

  const dots = g.selectAll("circle")
    .data(sceneData)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.city))
    .attr("cy", d => y(d.highway))
    .attr("r", 5)
    .attr("fill", d => getColor(sceneNum, d))
    .attr("opacity", 0.8)
    .attr("stroke", "#333");

  dots.on("mouseover", function (event, d) {
    tooltip.style("display", "block")
      .html(`<strong>${d.Make}</strong><br/>City: ${d.city} MPG<br/>Highway: ${d.highway} MPG`);
  }).on("mousemove", function (event) {
    tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
  }).on("mouseout", function () {
    tooltip.style("display", "none");
  });

  renderAnnotation(sceneNum);
}

function getColor(sceneNum, d) {
  if (sceneNum === 1 && (d.Fuel === "Electricity" || d.Fuel.includes("Hybrid"))) return "#00c853"; // bright green
  if (sceneNum === 2 && d.cylinders >= 8) return "#d62728"; // red
  return "#999"; // gray
}

function renderAnnotation(sceneNum) {
  const annotations = [];

  if (sceneNum === 0) {
    annotations.push({
      note: { title: "Most Cars", label: "Follow a trend where highway MPG > city MPG" },
      x: x(20),
      y: y(30),
      dx: 60,
      dy: -40
    });
  } else if (sceneNum === 1) {
    annotations.push({
      note: { title: "High MPG Vehicles", label: "Electric and Hybrid cars shine in city driving" },
      x: x(60),
      y: y(80),
      dx: 100,
      dy: -30
    });
  } else if (sceneNum === 2) {
    annotations.push({
      note: { title: "Low MPG Cars", label: "8+ Cylinder cars are less efficient" },
      x: x(12),
      y: y(15),
      dx: 80,
      dy: 40
    });
  }

  const makeAnnotations = d3.annotation().annotations(annotations);
  g.append("g").call(makeAnnotations);
}
