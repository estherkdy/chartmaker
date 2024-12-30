/*
 * ScatterPlot JavaScript source code
 *
 * Author: Esther Kim
 * Version: 1.0
 */

import './ScatterPlot.css';
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from "@mui/system";

const ScatterPlot = (props) => {
    const myReference = useRef();
    const [tooltip, setTooltip] = useState({ display: false, data: {}, color: '', position: { left: 0, top: 0 } });

    let dataset = props.data;

    const settings = {
        margin: { top: 40, right: 30, bottom: 60, left: 60 },
    };

    const init = () => {
        let container = d3.select(myReference.current);
        container.selectAll("svg").remove();

        const svg = container
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("preserveAspectRatio", "none");

        return svg;
    };

const paint = () => {
  const svg = init();

  const chartWidth = svg.node().getBoundingClientRect().width;
  const chartHeight = svg.node().getBoundingClientRect().height;

  let xScale;

  // data scales
  xScale = d3.scaleBand()
    .domain(dataset.map((d, i) => i))  // Domain based on the index
    .range([settings.margin.left, chartWidth - settings.margin.right])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.y) + 1])  // Max value from the data for y
    .range([chartHeight - settings.margin.bottom, settings.margin.top]);

  // Add circles for the scatter plot points
  svg
    .append("g")
    .attr("class", "dots")
    .selectAll("circle")
    .data(dataset.map((datum, i) => ({ ...datum, i })))
    .enter()
    .append("circle")
    .attr("cx", (d, i) => xScale(i))  // Use the index for positioning
    .attr("cy", (d) => yScale(d.y))  // Use y value for y position
    .attr("r", 5)
    .attr("fill", (d, i) => {
        return props.selectedItems.includes(i) ? "red" : "dodgerblue";
    })
    .on("click", function (event, d) {
        props.handleClick(d.i);
        const currentColor = d3.select(this).attr("fill");
        // use opposite color on click for now, since mousemove isn't triggered yet to properly update the color
        updateTooltip(event, d, currentColor === "red" ? "dodgerblue" : "red");
    })
    .on("mousemove", function (event, d) {
        const color = d3.select(this).attr("fill");
        updateTooltip(event, d, color);
    })
    .on("mouseout", () => {
        setTooltip({ display: false, data: {}, color: '', position: {} });
    });

  // Add X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${chartHeight - settings.margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("transform", "translate(0,5)");

  // Add Y Axis
  svg
    .append("g")
    .attr("transform", `translate(${settings.margin.left},0)`)
    .call(d3.axisLeft(yScale));

  // Add title
  svg
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", settings.margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .text(props.title);

  // Add X-axis title
  svg
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text(props.labels[0]);

  // Add Y-axis title (rotated to align with the y-axis)
  svg
    .append("text")
    .attr("x", -chartHeight / 2)
    .attr("y", settings.margin.left / 3)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text(props.labels[1]);
};

  
    

    // Tooltip update logic
    const updateTooltip = (mouseEvent, scatterData, tooltipColor) => {
        const svgBounds = myReference.current.getBoundingClientRect();
      
        const tooltipText = (
            <div className='tooltip-text'>
                {`${props.title} (${scatterData.x},${scatterData.y})`}
            </div>
        );
    
        setTooltip({
            display: true,
            data: { value: tooltipText,
             },
            position: { left: mouseEvent.clientX - 50, top: mouseEvent.clientY + 290 },
            color: tooltipColor
        });
    };

    useEffect(() => {
        paint();
    }, [props.data, props.title, props.labels, props.selectedItems]);

    // Base element for the svg to draw onto, plus tooltip drawing based on tooltip specs in state
    return (
        <Box ref={myReference} width="100%" height="100%">
            {tooltip.display && tooltip.position && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.position.left,
                        top: tooltip.position.top,
                        backgroundColor: tooltip.color, 
                        border: '1px solid #ccc',
                        padding: '5px',
                        color: '#fff', 
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                >
                    {tooltip.data.value} 
                </div>
            )}
        </Box>
    );
};

export default ScatterPlot;
