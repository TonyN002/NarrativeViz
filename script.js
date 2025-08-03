let scene = 0;
let data;
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 80, right: 40, bottom: 60, left: 70 };

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().range([0, innerWidth]);
const y = d3.scaleLinear().range([innerHeight, 0]);

const tooltip = d3.select("body").append("div")
  .style("position", "absolute")
  .style("padding", "8px")
  .style("background", "#333")
  .style("color", "#fff")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("display", "none");

d3.csv("https://flunky.github.io/cars2017.csv").then(raw => {
  // Step 1: Filter for valid data and gasoline only
const filtered = raw.filter(d =>
  +d.AverageCityMPG > 0 &&
  +d.AverageHighwayMPG > 0
);

// Step 2: Group by Make + Fuel
const grouped = d3.rollups(
  filtered,
  v => ({
    city: d3.mean(v, d => +d.AverageCityMPG),
    highway: d3.mean(v, d => +d.AverageHighwayMPG)
  }),
  d => d.Make
);

// Step 3: Convert grouped data to array of objects
data = grouped.map(([make, mpg]) => {
  return {
    Make: make,
    city: Math.round(mpg.city),
    highway: Math.round(mpg.highway)
  };
});

  x.domain([0, d3.max(data, d => d.city) + 5]);
  y.domain([0, d3.max(data, d => d.highway) + 5]);

  d3.select("#next").on("click", () => {
    scene++;
    renderScene(scene);
  });

  renderScene(scene);
});

function renderScene(sceneNum) {
  g.selectAll("*").remove(); // Clear previous scene

  // Title and subtitle for each scene
  const titles = [
    { title: "Gasoline Fuel Efficiency Overview by Make", subtitle: "City MPG vs. Highway MPG" },
    { title: "High-Efficiency Gasoline Cars", subtitle: "Highlighting Vehicles in Green" },
    { title: "Low-Efficiency Gasoline Cars", subtitle: "Highlighting Gas Guzzlers in Red" },
    { title: "Conclusion/Exploration", subtitle: "Explore the Data!" }
  ];
  if (sceneNum < 4) {
    svg.selectAll(".scene-title").remove();
    svg.append("text")
      .attr("class", "scene-title")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .text(titles[sceneNum].title);

    svg.append("text")
      .attr("class", "scene-title")
      .attr("x", width / 2)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#666")
      .text(titles[sceneNum].subtitle);
  }

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y));

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

  const dots = g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.city))
    .attr("cy", d => y(d.highway))
    .attr("r", 5)
    .attr("fill", d => getColor(sceneNum, d))
    .attr("opacity", 0.8)
    .attr("stroke", "#333");

  if (sceneNum >= 3) {
    dots.on("mouseover", function (event, d) {
    tooltip
      .style("display", "block")
      .html(`<strong>${d.Make}</strong><br/>City: ${Math.round(d.city)} MPG<br/>Highway: ${Math.round(d.highway)} MPG`);
  }).on("mousemove", function (event) {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  }).on("mouseout", function () {
    tooltip.style("display", "none");
  });
}

  renderAnnotation(sceneNum);
}

function getColor(sceneNum, d) {
  if (sceneNum === 1 && (d.city >= 40)) return "#32CD32"; // green
  if (sceneNum === 2 && d.city <= 15) return "#d62728"; // red
  return "#999"; // gray
}

function renderAnnotation(sceneNum) {
  const annotations = [];

  if (sceneNum === 0) {
    annotations.push({
      note: { title: "Fuel Efficiency Overview by Make", label: "City MPG vs. Highway MPG" },
      x: x(20),
      y: y(30),
      dx: 60,
      dy: -40
    });
  } else if (sceneNum === 1) {
    annotations.push({
      note: { title: "High-Efficiency Gasoline Cars", label: "Highlighting Vehicles in Green" },
      x: x(60),
      y: y(80),
      dx: 100,
      dy: -30
    });
  } else if (sceneNum === 2) {
    annotations.push({
      note: { title: "Low-Efficiency Gasoline Cars", label: "Highlighting Gas Guzzlers in Red" },
      x: x(12),
      y: y(15),
      dx: 80,
      dy: 40
    });
  } else if (sceneNum === 3) {
    annotations.push({
      note: { title: "Conclusion/Exploration", label: "Explore the Data!" },
      x: x(12),
      y: y(15),
      dx: 80,
      dy: 40
    });
  }

  const makeAnnotations = d3.annotation().annotations(annotations);
  g.append("g").call(makeAnnotations);
}