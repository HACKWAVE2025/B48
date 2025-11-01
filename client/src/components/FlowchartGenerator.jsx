import React, { useState } from 'react';
import { Send, Sparkles, Download, RefreshCw, Copy, Check } from 'lucide-react';
import mermaid from 'mermaid';

const FlowchartGenerator = ({ sessionId }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [flowchartCode, setFlowchartCode] = useState('');
  const [flowchartSvg, setFlowchartSvg] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Initialize mermaid
  React.useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }, []);

  const getBackendUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  };

  const renderFlowchart = async (code) => {
    try {
      // Clean the code before rendering
      let cleanCode = code.trim();
      
      // Remove any BOM or invisible characters
      cleanCode = cleanCode.replace(/^\uFEFF/, '');
      
      const uniqueId = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(uniqueId, cleanCode);
      setFlowchartSvg(svg);
      setError('');
    } catch (err) {
      console.error('Error rendering flowchart:', err);
      
      // Provide more detailed error message
      let errorMessage = 'Failed to render flowchart. ';
      if (err.message && err.message.includes('Parse error')) {
        errorMessage += 'The AI generated invalid syntax. Please try regenerating with a simpler question.';
      } else {
        errorMessage += 'Please try again or rephrase your question.';
      }
      
      setError(errorMessage);
      setFlowchartSvg('');
    }
  };

  const handleGenerateFlowchart = async (e, isRetry = false) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    setLoading(true);
    if (!isRetry) {
      setError('');
      setFlowchartSvg('');
      setFlowchartCode('');
    }

    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/gemini/generate-flowchart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question.trim(),
          sessionId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flowchart');
      }

      if (data.success && data.flowchart) {
        setFlowchartCode(data.flowchart);
        
        // Try to render the flowchart
        try {
          await renderFlowchart(data.flowchart);
        } catch (renderErr) {
          // If rendering fails, show error but keep the code visible
          console.error('Rendering error:', renderErr);
          throw new Error('The flowchart was generated but contains syntax errors. Please try regenerating.');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error generating flowchart:', err);
      setError(err.message || 'Failed to generate flowchart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSvg = () => {
    if (!flowchartSvg) return;

    const blob = new Blob([flowchartSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowchart-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = async () => {
    if (!flowchartSvg) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgBlob = new Blob([flowchartSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `flowchart-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
        });
      };

      img.src = url;
    } catch (err) {
      console.error('Error downloading PNG:', err);
      setError('Failed to download PNG. Please try SVG format instead.');
    }
  };

  const handleCopyCode = () => {
    if (!flowchartCode) return;
    
    navigator.clipboard.writeText(flowchartCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (question.trim()) {
      handleGenerateFlowchart({ preventDefault: () => {} }, true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#E8FFD7]/30 to-white">
      {/* Header */}
      <div className="p-6 border-b border-[#93DA97]/30 bg-[#E8FFD7]/50">
        <h3 className="text-2xl font-bold text-[#3E5F44] mb-2 flex items-center space-x-2">
          <Sparkles className="w-6 h-6" />
          <span>AI Flowchart Generator</span>
        </h3>
        <p className="text-[#557063]">
          Describe a process, concept, or algorithm, and AI will generate a visual flowchart for you.
        </p>
      </div>

      {/* Input Section */}
      <div className="p-6 border-b border-[#93DA97]/30 bg-white">
        <form onSubmit={handleGenerateFlowchart} className="space-y-4">
          <div>
            <label className="block text-[#3E5F44] font-medium mb-2">
              What would you like to visualize?
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: How does photosynthesis work? Or explain the process of solving a quadratic equation..."
              className="w-full bg-white border border-[#93DA97]/30 rounded-lg px-4 py-3 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] resize-none"
              rows="4"
              disabled={loading}
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all disabled:cursor-not-allowed shadow-sm font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Flowchart</span>
                </>
              )}
            </button>
            
            {flowchartSvg && !loading && (
              <button
                type="button"
                onClick={handleRegenerate}
                className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 border border-[#93DA97] rounded-lg text-[#3E5F44] transition-all shadow-sm font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 text-sm font-medium mb-2">{error}</p>
                <p className="text-red-500 text-xs">
                  Tip: Try asking simpler questions like "How does photosynthesis work?" or "Explain the if-else statement"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flowchart Display */}
      {flowchartSvg && (
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border border-[#93DA97]/30 shadow-sm">
            {/* Actions Bar */}
            <div className="p-4 border-b border-[#93DA97]/30 flex items-center justify-between bg-[#E8FFD7]/30">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[#3E5F44] font-medium text-sm">Generated Flowchart</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-[#93DA97] rounded-lg text-[#3E5F44] transition-all text-sm"
                  title="Copy Mermaid Code"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-[#93DA97] rounded-lg text-[#3E5F44] transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>SVG</span>
                </button>
                <button
                  onClick={handleDownloadPng}
                  className="flex items-center space-x-2 px-3 py-2 bg-[#5E936C] hover:bg-[#3E5F44] rounded-lg text-white transition-all text-sm shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>PNG</span>
                </button>
              </div>
            </div>

            {/* Flowchart SVG */}
            <div className="p-6 overflow-auto bg-gradient-to-br from-blue-50 to-purple-50">
              <div 
                className="mermaid-container flex items-center justify-center min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: flowchartSvg }}
                style={{
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif'
                }}
              />
            </div>

            {/* Code Section (Collapsible) */}
            {flowchartCode && (
              <details className="border-t border-[#93DA97]/30">
                <summary className="p-4 cursor-pointer hover:bg-[#E8FFD7]/20 transition-colors text-[#3E5F44] font-medium">
                  View Mermaid Code
                </summary>
                <div className="p-4 bg-gray-50">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{flowchartCode}</code>
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!flowchartSvg && !loading && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#E8FFD7] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-[#5E936C]" />
            </div>
            <h4 className="text-xl font-semibold text-[#3E5F44] mb-2">
              No Flowchart Yet
            </h4>
            <p className="text-[#557063] mb-4">
              Enter a question or describe a process above to generate a visual flowchart using AI.
            </p>
            <div className="bg-[#E8FFD7]/50 rounded-lg p-4 text-left">
              <p className="text-[#3E5F44] font-medium mb-2 text-sm">Example questions:</p>
              <ul className="text-[#557063] text-sm space-y-1 list-disc list-inside">
                <li>Explain the water cycle</li>
                <li>Show the process of cellular respiration</li>
                <li>How does a for loop work in programming?</li>
                <li>Steps to solve a system of equations</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowchartGenerator;
