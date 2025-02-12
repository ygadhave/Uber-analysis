import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import dataFile from '../data/music_data.csv';

export function ChordDiagram() {
  const svgRef = useRef();
  const [dimensions] = useState({ width: 600, height: 600 });

  useEffect(() => {
    d3.csv(dataFile).then((data) => {
      // Create popularity ranges
      const popularityRanges = ['0-25', '26-50', '51-75', '76-100'];
      const genres = Array.from(new Set(data.map(d => d.Genre)));

      // Create the matrix
      const matrix = createMatrix(data, genres, popularityRanges);
      const radius = Math.min(dimensions.width, dimensions.height) * 0.4;

      const svg = d3.select(svgRef.current)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
        .append('g')
        .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`);

      const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

      const chordData = chord(matrix);

      const colorScale = d3.scaleOrdinal()
        .domain([...genres, ...popularityRanges])
        .range([...d3.schemeSet3, ...d3.schemeSet2]);

      // Create group elements for arcs
      const group = svg.append('g')
        .selectAll('g')
        .data(chordData.groups)
        .join('g');

      // Arcs with transition
      group.append('path')
        .attr('d', d3.arc()
          .innerRadius(radius - 20)
          .outerRadius(radius))
        .style('fill', d => colorScale(getLabel(d.index, genres, popularityRanges)))
        .style('opacity', 0.8)
        .on('mouseover', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .style('stroke', '#000')
            .style('stroke-width', 1.5);
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 0.8)
            .style('stroke', 'none');
        });

      // Labels with transition
      group.append('text')
        .attr('dy', '.35em')
        .attr('transform', d => {
          const angle = (d.startAngle + d.endAngle) / 2;
          const rotation = (angle * 180 / Math.PI - 90);
          return `rotate(${rotation}) translate(${radius + 10}) ${rotation > 90 ? 'rotate(180)' : ''}`;
        })
        .attr('text-anchor', d => {
          const angle = (d.startAngle + d.endAngle) / 2;
          return (angle * 180 / Math.PI - 90) > 90 ? 'end' : 'start';
        })
        .text(d => getLabel(d.index, genres, popularityRanges))
        .style('font-size', '12px')
        .style('opacity', 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .style('opacity', 1);

      // Ribbons with animation
      svg.append('g')
        .selectAll('path')
        .data(chordData)
        .join('path')
        .attr('d', d3.ribbon().radius(radius - 20))
        .style('fill', d => colorScale(getLabel(d.source.index, genres, popularityRanges)))
        .style('opacity', 0)
        .style('stroke', '#333')
        .style('stroke-width', 0.5)
        .on('mouseover', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .style('stroke', '#000')
            .style('stroke-width', 1);
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 0.7)
            .style('stroke', '#333')
            .style('stroke-width', 0.5);
        })
        .transition()
        .duration(1000)
        .style('opacity', 0.7);
    });
  }, []);

  function getLabel(index, genres, popularityRanges) {
    return index < genres.length ? genres[index] : popularityRanges[index - genres.length];
  }

  function createMatrix(data, genres, popularityRanges) {
    const size = genres.length + popularityRanges.length;
    const matrix = Array(size).fill().map(() => Array(size).fill(0));

    data.forEach(song => {
      const genreIndex = genres.indexOf(song.Genre);
      const popularity = parseInt(song.Popularity);
      const popularityIndex = genres.length + Math.floor(popularity / 25);

      matrix[genreIndex][popularityIndex]++;
      matrix[popularityIndex][genreIndex]++;
    });

    return matrix;
  }

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
}
