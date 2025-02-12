import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import musicData from "../data/music_data.csv";

const StreamGraph = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    // Load data
    d3.csv(musicData).then((rawData) => {
      const parsedData = rawData.map((d) => ({
        year: +d.Year,
        genre: d.Genre,
        popularity: +d.Popularity,
      }));
      setData(parsedData);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 150, bottom: 50, left: 50 };

    // Prepare the data for the stream graph
    const genres = Array.from(new Set(data.map((d) => d.genre)));
    const years = Array.from(new Set(data.map((d) => d.year))).sort();

    const stackedData = d3
      .stack()
      .keys(genres)
      .value((d, key) => d[key] || 0)(
        years.map((year) => {
          const yearData = data.filter((d) => d.year === year);
          const genreValues = genres.reduce((acc, genre) => {
            acc[genre] = d3.sum(
              yearData.filter((d) => d.genre === genre),
              (d) => d.popularity
            );
            return acc;
          }, {});
          return { year, ...genreValues };
        })
      );

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(years))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1]))])
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(genres)
      .range(d3.schemeCategory10);

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid #ccc");

    svg.selectAll("*").remove();

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("visibility", "hidden")
      .style("box-shadow", "0px 4px 6px rgba(0, 0, 0, 0.1)");

    // Draw layers with animation
    const areaGenerator = d3
      .area()
      .x((d) => xScale(d.data.year))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveBasis);

    const paths = svg
      .selectAll("path")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("fill", (d) => colorScale(d.key))
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(
            `<strong>Genre:</strong> ${d.key}<br/>
             <strong>Year Range:</strong> ${d3.min(years)} - ${d3.max(years)}`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY + 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Animate the layers
    paths
      .attr("d", (d) =>
        areaGenerator(
          d.map((point) => ({
            ...point,
            [0]: yScale.domain()[0],
            [1]: yScale.domain()[0],
          }))
        )
      )
      .transition()
      .duration(2000)
      .attr("d", areaGenerator);

    // Add axes
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"));
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Add Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    genres.forEach((genre, i) => {
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(genre));

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 12)
        .text(genre)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });
  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default StreamGraph;
