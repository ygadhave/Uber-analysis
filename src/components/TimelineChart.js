import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import dataFile from "../data/music_data.csv";

const TimelineChart = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [genreData, setGenreData] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("Blues");

  useEffect(() => {
    // Load and format data
    d3.csv(dataFile).then((loadedData) => {
      const formattedData = loadedData.map((d) => ({
        year: +d.Year,
        genre: d.Genre,
        popularity: +d.Popularity,
      }));
      setGenreData(formattedData);
    });
  }, []);

  useEffect(() => {
    if (genreData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Filter data based on selected genre
    const filteredData = genreData
      .filter((d) => d.genre === selectedGenre)
      .sort((a, b) => a.year - b.year);

    // Define scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(filteredData, (d) => d.year))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.popularity) * 1.1])
      .range([height, 0]);

    // Define line and area
    const line = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.popularity))
      .curve(d3.curveMonotoneX);

    const area = d3.area()
      .x((d) => xScale(d.year))
      .y0(height)
      .y1((d) => yScale(d.popularity))
      .curve(d3.curveMonotoneX);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define gradient for area fill
    const gradient = chartGroup
      .append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#6a91e6")
      .attr("stop-opacity", 0.7);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#d1e3fa")
      .attr("stop-opacity", 0);

    // Append area path
    chartGroup
      .append("path")
      .datum(filteredData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Append line path
    chartGroup
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "#4a78e3")
      .attr("stroke-width", 3)
      .attr("d", line)
      .style("filter", "drop-shadow(0px 0px 5px rgba(74, 120, 227, 0.6))");

    // Append points with onMouseOver and onMouseOut for tooltips
    chartGroup
      .selectAll(".point")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.popularity))
      .attr("r", 4)
      .attr("fill", "#4a78e3")
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .attr("r", 6)
          .attr("fill", "#ff6b6b");

        d3.select(tooltipRef.current)
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 30}px`)
          .html(`
            <div><strong>Year:</strong> ${d.year}</div>
            <div><strong>Popularity:</strong> ${d.popularity}</div>
          `);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .transition()
          .attr("r", 4)
          .attr("fill", "#4a78e3");

        d3.select(tooltipRef.current).style("display", "none");
      });

    // Add X axis
    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d")))
      .attr("font-size", "12px")
      .attr("color", "#333");

    // Add Y axis
    chartGroup
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("font-size", "12px")
      .attr("color", "#333");
  }, [genreData, selectedGenre]);

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  return (
    <div>
      <label>Select Genre: </label>
      <select onChange={handleGenreChange} value={selectedGenre}>
        {Array.from(new Set(genreData.map((d) => d.genre))).map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
      <svg ref={svgRef} width="800" height="400"></svg>
      <div ref={tooltipRef} className="tooltip"></div>
    </div>
  );
};

export default TimelineChart;
