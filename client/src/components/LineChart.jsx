import { useEffect } from 'react'
import Chart from 'chart.js/auto'

const LineChart = ({ label, data }) => {
  useEffect(() => {
    let graphData = {
      labels: label,
      datasets: [
        {
          label: 'My First Dataset',
          data: data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.5,
        },
      ],
    }

    const ctx = document.getElementById('ping').getContext('2d')
    var myChart = new Chart(ctx, {
      type: 'line',
      data: graphData,
    })

    return () => {
      myChart.destroy()
    }
  }, [])

  return (
    <div style={{ width: '1000px', display: 'flex', justifyContent: 'center' }}>
      <canvas id='ping'></canvas>
    </div>
  )
}

export default LineChart
