import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import dataFile from "../data/music_data.csv";

const WaveformChart = () => {
  const svgRef = useRef();
  const legendRef = useRef();
  const [attribute, setAttribute] = useState("Popularity");

  useEffect(() => {
    d3.csv(dataFile).then((data) => {
      const formattedData = data.map((d) => ({
        year: +d.Year,
        value: +d[attribute] || 0,
      }));

      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };

      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height);

      svg.selectAll("*").remove();

      // Scales
      const xScale = d3
        .scaleBand()
        .domain(formattedData.map((d) => d.year))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(formattedData, (d) => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const colorScale = d3
        .scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(formattedData, (d) => d.value)]);

      // Add bars with transitions
      svg
        .selectAll("rect")
        .data(formattedData)
        .join("rect")
        .attr("x", (d) => xScale(d.year))
        .attr("y", height - margin.bottom) // Start from the bottom
        .attr("width", xScale.bandwidth())
        .attr("height", 0) // Start with no height
        .attr("fill", (d) => colorScale(d.value))
        .transition() // Animate the bars
        .duration(1000)
        .delay((d, i) => i * 10) // Staggered animation
        .attr("y", (d) => yScale(d.value))
        .attr("height", (d) => yScale(0) - yScale(d.value));

      // Axes
      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
          d3.axisBottom(xScale).tickValues(
            xScale.domain().filter((d, i) => !(i % 10)) // Show ticks every 10 years
          )
        )
        .attr("font-size", "12px");

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .attr("font-size", "12px");

      // Add color legend
      const legendWidth = 300;
      const legendHeight = 10;
      const legendSvg = d3
        .select(legendRef.current)
        .attr("width", legendWidth)
        .attr("height", legendHeight + 40);

      legendSvg.selectAll("*").remove();

      const legendScale = d3
        .scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale).ticks(5);

      const defs = legendSvg.append("defs");
      const linearGradient = defs
        .append("linearGradient")
        .attr("id", "legend-gradient");

      linearGradient
        .selectAll("stop")
        .data(
          colorScale.ticks().map((t, i, n) => ({
            offset: `${(100 * i) / n.length}%`,
            color: colorScale(t),
          }))
        )
        .enter()
        .append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color);

      legendSvg
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

      legendSvg
        .append("g")
        .attr("transform", `translate(0,${legendHeight})`)
        .call(legendAxis)
        .attr("font-size", "12px");
    });
  }, [attribute]);

  return (
    <div className="chart-container">
      <label>
        Select Attribute:
        <select value={attribute} onChange={(e) => setAttribute(e.target.value)}>
          <option value="Popularity">Popularity</option>
          <option value="Danceability">Danceability</option>
          <option value="Energy">Energy</option>
          {/* Add other attributes as needed */}
        </select>
      </label>
      <svg ref={svgRef}></svg>
      <svg ref={legendRef} className="legend-svg"></svg>
    </div>
  );
};

export default WaveformChart;
