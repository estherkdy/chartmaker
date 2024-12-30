/*
 * BarChart JavaScript source code
 *
 * Author: Esther Kim
 * Version: 1.0
 */

import "./BarChart.css";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Box } from "@mui/system";

const BarChart = (props) => {
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
    xLabels: {
      x: 5,
      y: 90,
      width: 95,
      height: 5,
      baseline: 2,
    },
    yLabels: {
      x: 3,
      y: 10,
      width: 5,
      height: 90,
      baseline: 9.5,
    },
    lines: {
      margin: 1.5,
    },
    bars: {
      x: 5,
      y: 10,
      width: 95,
      height: 85,
      ratio: 0.7,
    },
    data: {
      min: 0,
      // step: 0.5
    },
  };
  let svg = null;
  // clear svg
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

  // draw the chart
  const paint = () => {
    svg.selectAll("*").remove();

    // title
    svg
      .append("g")
      .attr("id", "title")
      .append("text")
      .attr("x", (settings.title.x + settings.title.width) / 2)
      .attr(
        "y",
        settings.title.y + settings.title.height - settings.title.baseline
      )
      .text(props.title);

    // x label text
    svg
      .append("g")
      .attr("id", "xLabel")
      .append("text")
      .attr(
        "x",
        (settings.title.x + settings.title.width) / 2 +
          settings.yLabels.width / 2
      )
      .attr(
        "y",
        settings.xLabels.y +
          settings.xLabels.height -
          settings.xLabels.baseline +
          5
      )
      .text(props.labels[0]);

    // y label text
    svg
      .append("g")
      .attr("id", "yLabel")
      .append("text")
      .attr("x", settings.yLabels.x / 2)
      .attr("y", settings.viewBox.height / 2)
      .text(props.labels[1])
      .attr(
        "transform",
        `rotate(-90, ${settings.yLabels.x / 2}, ${settings.viewBox.height / 2})`
      );

    // only draw if there is data
    if (dataset.length > 0) paintData();
  };
  const paintData = () => {
    // y axis line increment, initialize at 1
    let step = 1.0;

    //get the max value to use for our range and step calculation
    let yArray = dataset.map((item) =>
      isNaN(parseFloat(item.y)) ? 0 : parseFloat(item.y)
    );
    let max = Math.max(...yArray);

    let lineCount;
    let dataRange;

    // calculate the number of lines with current step value
    // cut the step in half until there are more than 20 lines
    // then double it until there are more than 20 lines
    do {
      max = step - (max % step) + max;
      dataRange = max - settings.data.min;
      lineCount = dataRange / step;
    } while (lineCount < 20 && (step /= 2));
    do {
      max = step - (max % step) + max;
      dataRange = max - settings.data.min;
      lineCount = dataRange / step;
    } while (lineCount > 20 && (step *= 2));

    // draw the lines
    svg
      .append("g")
      .attr("id", "lines")
      .selectAll("line")
      .data(d3.range(lineCount))
      .enter()
      .append("line")
      .attr("x1", settings.yLabels.x + settings.yLabels.width)
      .attr(
        "x2",
        settings.yLabels.x +
          settings.yLabels.width +
          settings.bars.width -
          settings.lines.margin
      )
      .attr("y1", (item, index) => {
        return settings.xLabels.y - (index * settings.bars.height) / lineCount;
      })
      .attr("y2", (item, index) => {
        return settings.xLabels.y - (index * settings.bars.height) / lineCount;
      });

    // draw the bars
    svg
      .append("g")
      .attr("id", "bars")
      .selectAll("rect")
      .data(dataset.map((datum, i) => ({ ...datum, i })))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("fill", (d, i) => {
        return props.selectedItems.includes(i) ? "red" : "dodgerblue";
      })
      .on("click", function (event, d) {
        props.handleClick(d.i);
        const currentColor = d3.select(this).attr("fill");
        updateTooltip(event, d, currentColor === "red" ? "dodgerblue" : "red");
      })
      .attr("x", (item, index) => {
        // calculate x position from data index
        return (
          settings.bars.x +
          ((1 - settings.bars.ratio + index) * settings.bars.width) /
            (dataset.length + 1 - settings.bars.ratio)
        );
      })
      .attr("y", (item, index) => {
        // calculate y position from data item (0 for NaN)
        return (
          settings.xLabels.y -
          (((isNaN(Object.values(item)[1]) ? 0 : Object.values(item)[1]) -
            settings.data.min) *
            settings.bars.height) /
            dataRange
        );
      })
      // calc width based on dataset size
      .attr(
        "width",
        (settings.bars.ratio * settings.bars.width) /
          (dataset.length + 1 - settings.bars.ratio)
      )
      .attr("height", (item, index) => {
        // calculate height from data item (0 for NaN)
        return (
          (((isNaN(Object.values(item)[1]) ? 0 : Object.values(item)[1]) -
            settings.data.min) *
            settings.bars.height) /
          dataRange
        );
      })
      // enable tooltip on hover
      .on("mousemove", function (event, d) {
        const color = d3.select(this).attr("fill"); // Get the color of the current bar
        updateTooltip(event, d, color);
      })
      .on("mouseout", () => {
        setTooltip({ display: false, data: {}, color: "", position: {} });
      });

    // Add x-values on top of each bar (after bars are drawn)
    svg
      .append("g")
      .attr("id", "xValues")
      .selectAll("text")
      .data(dataset)
      .enter()
      .append("text")
      .attr("x", (item, index) => {
        return (
          settings.bars.x +
          ((1 - settings.bars.ratio + index + settings.bars.ratio / 2) *
            settings.bars.width) /
            (dataset.length + 1 - settings.bars.ratio)
        );
      })
      .attr("y", (item, index) => {
        return (
          settings.xLabels.y -
          (isNaN(Object.values(item)[1]) ? 0 : Object.values(item)[1]) -
            settings.data.min 
        ); // Position text just above the bar
      })

      
      .style("text-anchor", "middle") // Center the text horizontally
      .style("font-size", "13%") // Set font size
      .style("fill", "#000") // Set text color
      .text((item, index) => {
        return item.x; // Assuming you want to show the x-value from dataset
      });

    // define tooltip specs
    const updateTooltip = (mouseEvent, barData, tooltipColor) => {
      const tooltipText = (
        <div className="tooltip-text">
          {`${props.title} (${barData.x},${barData.y})`}
        </div>
      );
      setTooltip({
        display: true,
        data: { value: tooltipText },
        position: { left: mouseEvent.clientX, top: mouseEvent.clientY - 50 },
        color: tooltipColor,
      });
    };

    // x labels with similar calculations to bar X positions
    let xLabels = svg.append("g").attr("id", "xLabels");
    xLabels
      .selectAll("text")
      .data(dataset)
      .enter()
      .append("text")
      .attr("x", (item, index) => {
        return (
          settings.xLabels.x +
          ((1 - settings.bars.ratio + index + settings.bars.ratio / 2) *
            settings.bars.width) /
            (dataset.length + 1 - settings.bars.ratio)
        );
      })
      .attr(
        "y",
        settings.xLabels.y + settings.xLabels.height - settings.xLabels.baseline
      )
      .text((item, index) => {
        return index; // Set the label text (or use item.x for specific data values)
      })
      .attr("fill", "black"); // Make the text black

    // y labels at increments based on line count
    svg
      .append("g")
      .attr("id", "yLabels")
      .selectAll("text")
      .data(d3.range(lineCount))
      .enter()
      .append("text")
      .attr("x", settings.yLabels.x + settings.yLabels.width / 2)
      .attr("y", (item, index) => {
        return (
          settings.yLabels.y +
          settings.yLabels.height -
          settings.yLabels.baseline -
          (index * settings.bars.height) / lineCount
        );
      })
      .text((item, index) => {
        return (settings.data.min + item * step).toFixed(1);
      });
  };

  useEffect(() => {
    init();
    paint();
  }, [props.data, props.title, props.labels, props.selectedItems]);

  // base element for the svg to draw onto, plus tooltip drawing based on tooltip specs in state
  return (
    <Box ref={myReference} width="100%" height="100%">
      {tooltip.display && tooltip.position && (
        <div
          style={{
            position: "absolute",
            left: tooltip.position.left,
            top: tooltip.position.top,
            backgroundColor: tooltip.color, // Use the bar's color
            border: "1px solid #ccc",
            padding: "5px",
            color: "#fff", // Text color
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

export default BarChart;
