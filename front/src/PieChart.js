/* 
 * PieChart component JavaScript source code
 *
 * Author: Esther Kim
 * Version: 1.0
 */

import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Box } from "@mui/system";

const PieChart = (props) => {
  const myReference = useRef();
  const [tooltip, setTooltip] = useState({
    display: false,
    data: {},
    color: "",
    position: { left: 0, top: 0 },
  });
  let dataset = props.data;

  let settings = {
    viewBox: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
    title: {
      x: 0,
      y: 0,
      width: 100,
      height: 10,
      baseline: 5,
    },
    radius: 40,
    innerRadius: 0,
    data: {
      min: 0,
    },
  };

  let svg = null;

  // Clear svg and initialize
  const init = () => {
    let container = d3.select(myReference.current);
    container.selectAll("svg").remove();
    svg = container
      .append("svg")
      .attr(
        "viewBox",
        settings.viewBox.x +
          " " +
          settings.viewBox.y +
          " " +
          settings.viewBox.width +
          " " +
          settings.viewBox.height
      )
      .attr("preserveAspectRatio", "none");
  };

  // Draw the chart
  const paint = () => {
    svg.selectAll("*").remove();

    // Title
    svg
      .append("g")
      .attr("id", "title")
      .append("text")
      .attr("x", settings.viewBox.width / 2)
      .attr(
        "y",
        settings.title.y + settings.title.height - settings.title.baseline
      )
      .style("text-anchor", "middle")
      .text(props.title);

    // Only draw if there is data
    if (dataset.length > 0) paintData();
  };

  const paintData = () => {
    // Define the pie chart layout
    const pie = d3
      .pie()
      .value((d) => d.y) // value based on y data
      .sort(null); // Use original data order

    // Define arc generator
    const arc = d3
      .arc()
      .innerRadius(settings.innerRadius)
      .outerRadius(settings.radius);

    // Draw the pie slices
    const pieSlices = svg
      .append("g")
      .attr("id", "pieSlices")
      .attr(
        "transform",
        `translate(${settings.viewBox.width / 2}, ${
          settings.viewBox.height / 2
        })`
      );

    const slices = pieSlices
      .selectAll("path")
      .data(pie(dataset))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => {
          return props.selectedItems.includes(i) ? "red" : "dodgerblue";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.06)
      .on("click", function (event, d) {
        props.handleClick(d.index);
        const currentColor = d3.select(this).attr("fill");
        // use opposite color on click for now, since mousemove isn't triggered yet to properly update the color
        updateTooltip(event, d, currentColor === "red" ? "dodgerblue" : "red");
      })
      .on("mousemove", function (event, d) {
        const color = d3.select(this).attr("fill"); // Get the color of the current slice
        updateTooltip(event, d, color);
      })
      .on("mouseout", () => {
        setTooltip({ display: false, data: {}, color: "", position: {} });
      });

    // labels for slices, layout adjustment too 
    pieSlices
      .selectAll("text")
      .data(pie(dataset))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`) //positions the label text to be at the centroid
      .attr("dy", "0.35em")  
      .style("text-anchor", "middle") 
      .style("font-size", "13%")  
      .style("fill", "#000")
      .text((d) => d.data.x);

    const updateTooltip = (mouseEvent, sliceData, tooltipColor) => {
      const tooltipText = (
        <div className="tooltip-text">
          {`${props.title} (${sliceData.data.x},${sliceData.data.y})`}
        </div>
      );

      setTooltip({
        display: true,
        data: { value: tooltipText },
        position: {
          left: mouseEvent.clientX - 50,
          top: mouseEvent.clientY + 290,
        },
        color: tooltipColor,
      });
    };
  };

  useEffect(() => {
    init();
    paint();
  }, [props.data, props.title, props.labels, props.selectedItems]);

  // Base element for the svg to draw onto, plus tooltip drawing based on tooltip specs in state
  return (
    <Box ref={myReference} width="100%" height="100%">
      {tooltip.display && tooltip.position && ( 
        <div
          style={{
            position: "absolute",
            left: tooltip.position.left,
            top: tooltip.position.top,
            backgroundColor: tooltip.color,  
            border: "1px solid #ccc",
            padding: "5px",
            color: "#fff",  
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {tooltip.data.value}
        </div>
      )}
    </Box>
  );
};

export default PieChart;
