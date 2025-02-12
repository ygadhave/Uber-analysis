import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import musicData from "../data/music_data.csv";

const BubbleChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    // Load and process the data
    d3.csv(musicData).then((data) => {
      const groupedData = d3.group(data, (d) => d.Genre);
      const bubbleData = Array.from(groupedData).map(([genre, songs]) => ({
        genre,
        songCount: songs.length,
        avgPopularity: d3.mean(songs, (d) => +d.Popularity || 0),
        avgDuration: d3.mean(songs, (d) => +d.Duration || 0),
      }));

      // Sort data by song count and add an index
      bubbleData.sort((a, b) => b.songCount - a.songCount);
      bubbleData.forEach((d, i) => (d.index = i + 1));

      setData(bubbleData);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const width = 800;
    const height = 600;

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid #ccc");

    svg.selectAll("*").remove();

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

    // Create a pack layout
    const pack = d3
      .pack()
      .size([width, height])
      .padding(10);

    // Generate hierarchy
    const root = d3
      .hierarchy({ children: data })
      .sum((d) => d.songCount);

    const nodes = pack(root).leaves();

    // Create bubbles
    svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d3.interpolateCool(d.data.avgPopularity / 100))
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(
            `<strong>Genre:</strong> ${d.data.genre}<br/>
            <strong>Song Count:</strong> ${d.data.songCount}<br/>
            <strong>Avg Popularity:</strong> ${d.data.avgPopularity.toFixed(
              2
            )}<br/>
            <strong>Avg Duration:</strong> ${d.data.avgDuration.toFixed(2)}`
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

    // Add labels (Genre Name)
    svg
      .selectAll(".genre-label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "genre-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y - 5) // Slightly above the center
      .text((d) => d.data.genre)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#333")
      .style("pointer-events", "none");

    // Add labels (Index)
    svg
      .selectAll(".index-label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "index-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 15) // Slightly below the center
      .text((d) => `#${d.data.index}`)
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#555")
      .style("pointer-events", "none");
  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BubbleChart;
