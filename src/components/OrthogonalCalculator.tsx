import { useState, useEffect, lazy, Suspense } from 'react';
import { findMatchingFamily, getDefaultParams, CurveFamily } from '@/lib/orthogonal';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';

const Plot = createPlotlyComponent(Plotly);

declare global {
  interface Window {
    MathJax: any;
  }
}

const OrthogonalCalculator = () => {
  const [equation, setEquation] = useState('x^2 + y^2 = C');
  const [matchedFamily, setMatchedFamily] = useState<CurveFamily | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load MathJax
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
      
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']]
        }
      };
    }
  }, []);

  useEffect(() => {
    // Re-render MathJax when steps change
    if (window.MathJax?.typeset) {
      setTimeout(() => window.MathJax.typeset(), 100);
    }
  }, [matchedFamily]);

  const handleCalculate = () => {
    const family = findMatchingFamily(equation);
    if (family) {
      setMatchedFamily(family);
      setError('');
    } else {
      setMatchedFamily(null);
      setError('Equation not recognized. Try: x^2 + y^2 = C, y = Cx^2, xy = C, y = Ce^x, or y = Cx');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const params = getDefaultParams();
  
  const plotData: any[] = [];
  
  if (matchedFamily) {
    // Original curves (blue)
    const originalCurves = matchedFamily.generateOriginal(params.original);
    originalCurves.forEach((curve, i) => {
      if (curve.x.length > 0) {
        plotData.push({
          x: curve.x,
          y: curve.y,
          type: 'scatter',
          mode: 'lines',
          line: { color: '#3b82f6', width: 2 },
          name: i === 0 ? 'Original Family' : '',
          showlegend: i === 0,
          hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<extra>Original</extra>'
        });
      }
    });
    
    // Orthogonal trajectories (red)
    const orthogonalCurves = matchedFamily.generateOrthogonal(params.orthogonal);
    orthogonalCurves.forEach((curve, i) => {
      if (curve.x.length > 0) {
        plotData.push({
          x: curve.x,
          y: curve.y,
          type: 'scatter',
          mode: 'lines',
          line: { color: '#ef4444', width: 2 },
          name: i === 0 ? 'Orthogonal Trajectories' : '',
          showlegend: i === 0,
          hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<extra>Orthogonal</extra>'
        });
      }
    });
  }

  const examples = [
    'x^2 + y^2 = C',
    'y = Cx^2',
    'xy = C',
    'y = Ce^x',
    'y = Cx'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Orthogonal Trajectory Calculator
          </h1>
          <p className="text-lg text-purple-200/80">
            Enter a family of curves to see its orthogonal trajectories
          </p>
        </header>

        {/* Input Card */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Enter equation with parameter C:
              </label>
              <input
                type="text"
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder="e.g., x^2 + y^2 = C"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCalculate}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Example buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-white/60 text-sm">Try:</span>
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setEquation(ex)}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white/80 rounded-lg transition-all"
              >
                {ex}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
              {error}
            </div>
          )}
        </div>

        {matchedFamily && (
          <>
            {/* Results Summary */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="glass-card rounded-xl p-5">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Original Family
                </h3>
                <p className="text-white text-xl font-mono">{matchedFamily.original}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Orthogonal Trajectories
                </h3>
                <p className="text-white text-xl font-mono">{matchedFamily.orthogonal}</p>
              </div>
            </div>

            {/* Graph */}
            <div className="glass-card rounded-2xl p-4 mb-8 overflow-hidden">
              <h2 className="text-xl font-semibold text-white mb-4">Interactive Graph</h2>
              <div className="bg-slate-900/50 rounded-xl overflow-hidden">
                <Plot
                  data={plotData}
                  layout={{
                    autosize: true,
                    height: 500,
                    margin: { l: 50, r: 30, t: 30, b: 50 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(15,23,42,0.8)',
                    xaxis: {
                      gridcolor: 'rgba(148,163,184,0.2)',
                      zerolinecolor: 'rgba(148,163,184,0.5)',
                      tickcolor: 'rgba(255,255,255,0.5)',
                      tickfont: { color: 'rgba(255,255,255,0.7)' },
                      range: [-10, 10]
                    },
                    yaxis: {
                      gridcolor: 'rgba(148,163,184,0.2)',
                      zerolinecolor: 'rgba(148,163,184,0.5)',
                      tickcolor: 'rgba(255,255,255,0.5)',
                      tickfont: { color: 'rgba(255,255,255,0.7)' },
                      range: [-10, 10],
                      scaleanchor: 'x',
                      scaleratio: 1
                    },
                    legend: {
                      x: 0.02,
                      y: 0.98,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      font: { color: 'white' }
                    },
                    dragmode: 'pan'
                  }}
                  config={{
                    responsive: true,
                    scrollZoom: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d']
                  }}
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-white/60 text-sm mt-3 text-center">
                💡 Scroll to zoom • Drag to pan • Hover for coordinates
              </p>
            </div>

            {/* Step-by-step Solution */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Step-by-Step Solution</h2>
              <div className="space-y-4">
                {matchedFamily.steps.map((step, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-white/90 text-lg overflow-x-auto">
                        {'\\(' + step + '\\)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-8 glass-card rounded-xl p-5 border-l-4 border-purple-500">
              <h3 className="text-purple-300 font-semibold mb-2">What are Orthogonal Trajectories?</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Two families of curves are orthogonal trajectories of each other if every curve of one family 
                intersects every curve of the other family at right angles (90°). They are found by replacing 
                the slope dy/dx with its negative reciprocal -dx/dy in the differential equation.
              </p>
            </div>
          </>
        )}

        {/* Supported Equations */}
        {!matchedFamily && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Supported Equation Types</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { eq: 'x² + y² = C', desc: 'Circles → Lines' },
                { eq: 'y = Cx²', desc: 'Parabolas → Ellipses' },
                { eq: 'xy = C', desc: 'Hyperbolas → Hyperbolas' },
                { eq: 'y = Ce^x', desc: 'Exponentials → Parabolas' },
                { eq: 'y = Cx', desc: 'Lines → Circles' }
              ].map((item) => (
                <div key={item.eq} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white font-mono text-lg">{item.eq}</p>
                  <p className="text-purple-300/70 text-sm mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrthogonalCalculator;
