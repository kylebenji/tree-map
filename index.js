const treeHeight = 600;
const treeWidth = 1000;

const format = new Intl.NumberFormat("en-US");

const moviesFile =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const fader = function (color) {
  return d3.interpolateRgb(color, "#fff")(0.2);
};

const color = d3.scaleOrdinal().range(
  // Recreate .schemeCategory20
  [
    "#324376",
    "#72556A",
    "#B2675E",
    "#558C8C",
    "#98AFB6",
    "#DBD2E0",
    "#F5DD90",
  ].map(fader)
);

//creating svg
const svg = d3
  .select("svg")
  .attr("height", treeHeight)
  .attr("width", treeWidth);

//tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

const treemap = d3.treemap().size([treeWidth, treeHeight]).paddingInner(2);
// Load external data and boot
d3.json(moviesFile).then((movies) => {
  console.log(movies);

  const root = d3
    .hierarchy(movies)
    .eachBefore((d) => {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum((d) => d.value);

  treemap(root);

  const cell = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "group")
    .attr("transform", (d) => {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    });

  cell
    .append("rect")
    .attr("id", (d) => d.data.id)
    .attr("class", "tile")
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .attr("data-name", function (d) {
      return d.data.name;
    })
    .attr("data-category", function (d) {
      return d.data.category;
    })
    .attr("data-value", function (d) {
      return d.data.value;
    })
    .attr("fill", (d) => color(d.data.category))
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 0.9).attr("data-value", d.value);
      tooltip
        .html(
          `<p>Name: ${d.data.name}</p><p>Genre: ${
            d.data.category
          }</p><p>Sales: ${format.format(d.value)}</p>`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(500);
      tooltip.style("opacity", 0);
    });

  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/ /g))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", function (d, i) {
      return 13 + i * 10;
    })
    .text((d) => d);

  //legend
  const categories = movies.children.map((category) => category.name);
  console.log(categories);

  const legendWidth = 500;
  const LEGEND_OFFSET = 10;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_H_SPACING = 150;
  const LEGEND_V_SPACING = 10;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  const legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

  const legend = d3.select("#legend");

  legend.attr("width", legendWidth);

  const legendElem = legend
    .append("g")
    .attr("transform", "translate(60," + LEGEND_OFFSET + ")")
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return (
        "translate(" +
        (i % legendElemsPerRow) * LEGEND_H_SPACING +
        "," +
        (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
          LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
        ")"
      );
    });

  legendElem
    .append("rect")
    .attr("width", LEGEND_RECT_SIZE)
    .attr("height", LEGEND_RECT_SIZE)
    .attr("class", "legend-item")
    .attr("fill", function (d) {
      return color(d);
    });

  legendElem
    .append("text")
    .attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
    .attr("y", LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
    .text(function (d) {
      return d;
    });
});
