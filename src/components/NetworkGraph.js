import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import musicData from "../data/music_data.csv";

const NetworkGraph = () => {
  const svgRef = useRef();
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    // Load the dataset and extract genres
    d3.csv(musicData).then((data) => {
      const uniqueGenres = [...new Set(data.map((d) => d.Genre))];
      setGenres(uniqueGenres);

      // Initialize the graph with the first genre
      setSelectedGenre(uniqueGenres[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedGenre) return;

    // Load the dataset and filter based on the selected genre
    d3.csv(musicData).then((data) => {
      const nodes = [];
      const links = [];

      // Create tooltip
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

      // Filter data for the selected genre
      const filteredData = data.filter((d) => d.Genre === selectedGenre);

      // Add the selected genre as a node
      nodes.push({
        id: selectedGenre,
        type: "Genre",
        popularity: filteredData.length,
        fx: 500,
        fy: 400,
      });

      // Add artists and links
      filteredData.forEach((row) => {
        const artistNode = nodes.find((node) => node.id === row.Artist);
        if (!artistNode) {
          nodes.push({
            id: row.Artist,
            type: "Artist",
            collaborations: 1,
            tempo: row.Tempo,
            key: row.Key,
          });
        }

        links.push({ source: row.Artist, target: row.Genre, weight: 1 });

        // Increment collaborations for existing artist nodes
        const existingArtistNode = nodes.find((node) => node.id === row.Artist);
        if (existingArtistNode) {
          existingArtistNode.collaborations += 1;
        }
      });

      // Set SVG dimensions
      const width = 800;
      const height = 800;

      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .style("border", "1px solid #ccc");

      svg.selectAll("*").remove();

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(200)
            .strength(0.5)
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .force(
          "collision",
          d3.forceCollide().radius((d) => (d.type === "Genre" ? 40 : 20))
        );

      // Draw links
      const link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", (d) => Math.sqrt(d.weight));

      // Draw nodes
      const node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", (d) => (d.type === "Genre" ? 30 : 10))
        .attr("fill", (d) => (d.type === "Genre" ? "#69b3a2" : "#ff6f61"))
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible");
          tooltip.html(
            `<strong>${d.type}</strong><br/>
            <strong>Name:</strong> ${d.id}<br/>
            ${
              d.type === "Genre"
                ? `<strong>Popularity:</strong> ${d.popularity}`
                : ""
            }
            ${
              d.type === "Artist"
                ? `<strong>Collaborations:</strong> ${d.collaborations}<br/>
            <strong>Tempo:</strong> ${d.tempo || "N/A"}<br/>
            <strong>Key:</strong> ${d.key || "N/A"}`
                : ""
            }`
          );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY + 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        })
        .call(
          d3
            .drag()
            .on("start", (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              if (d.type !== "Genre") {
                d.fx = null;
                d.fy = null;
              }
            })
            .on("drag", (event, d) => {
              if (d.type !== "Genre") {
                d.fx = event.x;
                d.fy = event.y;
              }
            })
            .on("end", (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              if (d.type !== "Genre") {
                d.fx = null;
                d.fy = null;
              }
            })
        );

      // Add labels
      const label = svg
        .append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .text((d) => (d.type === "Genre" ? d.id : ""))
        .attr("text-anchor", "middle") // Center-align text
        .attr("x", (d) => d.fx) // Ensure the label is centered for fixed genre nodes
        .attr("y", (d) => (d.fy ? d.fy + 5 : d.y + 5)) // Align text slightly below the node
        .style("font-size", "14px")
        .style("fill", "#fff")
        .style("pointer-events", "none");

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        label.attr("x", (d) => d.fx || d.x).attr("y", (d) => (d.fy || d.y) + 5);
      });

      // Restart the simulation to fix the genre node
      simulation.alpha(1).restart();
    });
  }, [selectedGenre]);

  return (
    <div>
      <select
        onChange={(e) => setSelectedGenre(e.target.value)}
        value={selectedGenre || ""}
      >
        <option value="" disabled>
          Select a Genre
        </option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default NetworkGraph;
