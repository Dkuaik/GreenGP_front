import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';
import { Upload, LineChart, GitCompare } from 'lucide-react';
import Papa from 'papaparse';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

type TabType = 'evolution' | 'comparison';

function App() {
  const [xValues, setXValues] = useState<number[]>([]);
  const [yValues, setYValues] = useState<number[]>([]);
  const [functionExpression, setFunctionExpression] = useState<string>('');
  const [generations, setGenerations] = useState<Array<{ generation: number, fitness: number }>>([]);
  const [selectedIndividuals, setSelectedIndividuals] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('evolution');
  const [latexExpression, setLatexExpression] = useState<string>('f(x) = x^2');

  const handleFileUpload = (e: React.ChangeEvent<HTMLTextAreaElement>, type: 'x' | 'y') => {
    const content = e.target.value;
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        if (type === 'x') setXValues(parsed);
        else setYValues(parsed);
      }
    } catch {
      // If JSON parsing fails, try CSV
      const results = Papa.parse(content, { skipEmptyLines: true });
      const values = results.data.flat().map(Number).filter(n => !isNaN(n));
      if (type === 'x') setXValues(values);
      else setYValues(values);
    }
  };

  const handleSubmit = async () => {
    // Simulate API call - replace with your actual API endpoint
    const mockGenerations = Array.from({ length: 10 }, (_, i) => ({
      generation: i + 1,
      fitness: Math.random() * 100
    }));
    setGenerations(mockGenerations);
    // Update LaTeX expression based on the function
    setLatexExpression(`f(x) = ${functionExpression.replace('=>', '\\mapsto')}`);
  };

  const toggleIndividual = (generation: number) => {
    const newSelected = new Set(selectedIndividuals);
    if (newSelected.has(generation)) {
      newSelected.delete(generation);
    } else {
      newSelected.add(generation);
    }
    setSelectedIndividuals(newSelected);
  };

  const evolutionChartData = {
    labels: generations.map(g => `Gen ${g.generation}`),
    datasets: [
      {
        label: 'Fitness Evolution',
        data: generations
          .filter(g => !selectedIndividuals.has(g.generation))
          .map(g => g.fitness),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const comparisonChartData = {
    datasets: [
      {
        label: 'Input Data',
        data: xValues.map((x, i) => ({ x, y: yValues[i] || 0 })),
        backgroundColor: 'rgb(75, 192, 192)',
        pointRadius: 4
      },
      {
        label: 'Generated Data',
        data: xValues.map((x) => ({ 
          x, 
          y: Math.random() * 100 // Replace with your actual generated data
        })),
        backgroundColor: 'rgb(255, 99, 132)',
        pointRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: activeTab === 'evolution' ? 'Evolutionary Algorithm Progress' : 'Data Comparison'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: activeTab === 'evolution' ? 'Fitness' : 'Y Value'
        }
      },
      x: {
        title: {
          display: true,
          text: activeTab === 'evolution' ? 'Generation' : 'X Value'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Evolutionary Algorithm Visualization</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X Values (JSON or CSV)
            </label>
            <textarea
              className="w-full h-32 p-2 border rounded-md"
              onChange={(e) => handleFileUpload(e, 'x')}
              placeholder="Enter X values in JSON array or CSV format"
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y Values (JSON or CSV)
            </label>
            <textarea
              className="w-full h-32 p-2 border rounded-md"
              onChange={(e) => handleFileUpload(e, 'y')}
              placeholder="Enter Y values in JSON array or CSV format"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Function Expression
            </label>
            <textarea
              className="w-full h-32 p-2 border rounded-md"
              value={functionExpression}
              onChange={(e) => setFunctionExpression(e.target.value)}
              placeholder="Enter your function expression (e.g., x => Math.sin(x))"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Generate Evolution
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('evolution')}
              className={`flex items-center px-6 py-3 ${
                activeTab === 'evolution'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LineChart className="w-5 h-5 mr-2" />
              Evolution Progress
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center px-6 py-3 ${
                activeTab === 'comparison'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <GitCompare className="w-5 h-5 mr-2" />
              Data Comparison
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'comparison' && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Function Expression (LaTeX)
                </label>
                <div className="bg-white p-4 rounded border text-lg">
                  <InlineMath math={latexExpression} />
                </div>
              </div>
            )}
            <div className="h-[400px]">
              {activeTab === 'evolution' ? (
                <Line data={evolutionChartData} options={chartOptions} />
              ) : (
                <Scatter data={comparisonChartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {generations.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Individual Controls</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {generations.map((gen) => (
                <button
                  key={gen.generation}
                  onClick={() => toggleIndividual(gen.generation)}
                  className={`p-2 rounded-md text-sm ${
                    selectedIndividuals.has(gen.generation)
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-green-100 text-green-700 border-green-300'
                  } border`}
                >
                  Gen {gen.generation}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;