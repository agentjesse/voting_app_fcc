import React, { Component } from 'react'
import Chart from 'chart.js'
const randomColor = require('randomcolor')

class MyChart extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  //never rerender this component
  shouldComponentUpdate() { return false }

  //the refs system will call this function when the element has rendered. and this will occur before lifecycle methods: componentDidMount/componentDidUpdate
  makeChart(canvas) {
    // const myDoughnutChart = new Chart( canvas, { //no need to save to variable
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: ['option1','option2','option3','option4','option5','option6'],
        datasets: [
          {
            data: [10, 10, 10, 10, 20, 40],
            backgroundColor: randomColor( {luminosity: 'light', count:6} ) //returns array of 6 colors
          }
        ]
      }
      
    })
  }

  //ref system used to save a direct refrence to a dom element to be used with the chart js library that manipulates the canvas element from the dom
  render() {
    return (
      <div style={ {position: 'relative', width:'100%' } }>
        <canvas ref={ canvas => this.makeChart(canvas) }></canvas>
      </div>
    )
  }
  
}

export default MyChart
