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
    <div className="h-full flex flex-col bg-gradient-to-br from-[#E8FFD7]/30 to-white overflow-hidden">
      {/* Compact Header */}
      <div className="p-2 border-b border-[#93DA97]/30 bg-[#E8FFD7]/50 flex-shrink-0">
        <h3 className="text-base font-bold text-[#3E5F44] flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>AI Flowchart Generator</span>
        </h3>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Input Section */}
        <div className="w-80 border-r border-[#93DA97]/30 bg-white flex flex-col flex-shrink-0">
          <div className="p-3 flex-1 overflow-y-auto">
            <form onSubmit={handleGenerateFlowchart} className="space-y-3 h-full flex flex-col">
              <div className="flex-1">
                <label className="block text-[#3E5F44] font-medium mb-2 text-sm">
                  What would you like to visualize?
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Example: How does photosynthesis work? Or explain the process of solving a quadratic equation..."
                  className="w-full h-full bg-white border border-[#93DA97]/30 rounded-lg px-3 py-2 text-[#3E5F44] placeholder-[#557063]/50 focus:outline-none focus:border-[#5E936C] resize-none text-sm"
                  disabled={loading}
                  style={{ minHeight: '200px' }}
                />
              </div>
              
              <div className="space-y-2 flex-shrink-0">
                <button
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#5E936C] to-[#93DA97] hover:from-[#3E5F44] hover:to-[#5E936C] disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Flowchart</span>
                    </>
                  )}
                </button>
                
                {flowchartSvg && !loading && (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-[#93DA97] rounded-lg text-[#3E5F44] transition-all shadow-sm font-medium text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>

              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
                  <div className="flex items-start space-x-2">
                    <X className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-600 text-xs font-medium mb-1">{error}</p>
                      <p className="text-red-500 text-xs">
                        Try simpler questions like "How does photosynthesis work?"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Code Section at Bottom */}
          {flowchartCode && (
            <details className="border-t border-[#93DA97]/30 flex-shrink-0 bg-gray-50">
              <summary className="p-2 cursor-pointer hover:bg-[#E8FFD7]/20 transition-colors text-[#3E5F44] font-medium text-xs">
                View Mermaid Code
              </summary>
              <div className="p-2 bg-gray-50 max-h-32 overflow-auto">
                <pre className="bg-gray-900 text-gray-100 p-2 rounded-lg overflow-x-auto text-xs">
                  <code>{flowchartCode}</code>
                </pre>
              </div>
            </details>
          )}
        </div>

        {/* Right Side - Flowchart Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {flowchartSvg ? (
            <>
              {/* Actions Bar */}
              <div className="p-2 border-b border-[#93DA97]/30 flex items-center justify-between bg-[#E8FFD7]/30 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-[#3E5F44] font-medium text-sm">Generated Flowchart</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-[#93DA97] rounded-lg text-[#3E5F44] transition-all text-xs"
                    title="Copy Mermaid Code"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadSvg}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-[#93DA97] rounded-lg text-[#3E5F44] transition-all text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>SVG</span>
                  </button>
                  <button
                    onClick={handleDownloadPng}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#5E936C] hover:bg-[#3E5F44] rounded-lg text-white transition-all text-xs shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>
                </div>
              </div>

              {/* Flowchart SVG - Full Height Scrollable */}
              <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="p-6">
                  <div 
                    className="mermaid-container bg-white rounded-lg shadow-lg p-6 inline-block min-w-full"
                    dangerouslySetInnerHTML={{ __html: flowchartSvg }}
                    style={{
                      fontSize: '16px',
                      fontFamily: 'Arial, sans-serif'
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-[#E8FFD7] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-[#5E936C]" />
                </div>
                <h4 className="text-lg font-semibold text-[#3E5F44] mb-2">
                  No Flowchart Yet
                </h4>
                <p className="text-[#557063] mb-3 text-sm">
                  Enter a question in the left panel to generate a visual flowchart using AI.
                </p>
                <div className="bg-[#E8FFD7]/50 rounded-lg p-3 text-left">
                  <p className="text-[#3E5F44] font-medium mb-2 text-xs">Example questions:</p>
                  <ul className="text-[#557063] text-xs space-y-1 list-disc list-inside">
                    <li>Explain the water cycle</li>
                    <li>Show cellular respiration process</li>
                    <li>How does a for loop work?</li>
                    <li>Steps to solve equations</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowchartGenerator;
