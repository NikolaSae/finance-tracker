"use client";
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

export default function ChartComponent({ userId }: { userId: string }) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/transactions?user_id=${userId}`);
      const data = await response.json();

      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map((row: any) => row.date),
            datasets: [{
              label: 'Amount',
              data: data.map((row: any) => row.amount),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    };

    fetchData();
  }, [userId]);

  return <canvas ref={chartRef}></canvas>;
}