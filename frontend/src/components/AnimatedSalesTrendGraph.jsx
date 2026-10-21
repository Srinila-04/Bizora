import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RotateCcw,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

/**
 * Generates a smooth cubic Bezier SVG path through a series of (x, y) coordinates
 */
function buildSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

/**
 * Formats a number in Indian Rupee format (e.g. ₹1,23,456.78)
 */
export function formatINR(val) {
  const num = typeof val === 'number' ? val : parseFloat(val || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(num);
}

export const AnimatedSalesTrendGraph = ({
  trend = [],
  currencySymbol = '₹',
  showComparison = true,
  loading = false,
  error = null,
  onRetry = null,
  granularity = 'daily',
  range = '7d'
}) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  // Trigger smooth line drawing animation when range or data points change
  useEffect(() => {
    setActiveIndex(null);
    setAnimKey((k) => k + 1);
  }, [range, granularity, trend]);

  // Chart Dimensions & Coordinate Math
  const width = 800;
  const height = 300;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baselineY = padding.top + chartHeight;

  // Compute maximum value for scaling Y axis
  const { maxVal, pointsCurrent, pointsComparison, isAllZero } = useMemo(() => {
    if (!trend || trend.length === 0) {
      return { maxVal: 1000, pointsCurrent: [], pointsComparison: [], isAllZero: true };
    }

    let highest = 0;
    let anyNonZero = false;

    for (const item of trend) {
      const cur = Number(item.netSales || 0);
      const prev = showComparison ? Number(item.comparisonSales || 0) : 0;
      if (cur > highest) highest = cur;
      if (prev > highest) highest = prev;
      if (cur > 0 || prev > 0) anyNonZero = true;
    }

    // Give 15% headroom above highest value
    const computedMax = highest === 0 ? 1000 : Math.ceil(highest * 1.15);
    const n = trend.length;

    const currentPts = trend.map((item, i) => {
      const x = n > 1 ? padding.left + (i / (n - 1)) * chartWidth : padding.left + chartWidth / 2;
      const sales = Number(item.netSales || 0);
      const y = baselineY - (sales / computedMax) * chartHeight;
      return { x, y, sales, raw: item };
    });

    const compPts = trend.map((item, i) => {
      const x = n > 1 ? padding.left + (i / (n - 1)) * chartWidth : padding.left + chartWidth / 2;
      const sales = Number(item.comparisonSales || 0);
      const y = baselineY - (sales / computedMax) * chartHeight;
      return { x, y, sales, raw: item };
    });

    return {
      maxVal: computedMax,
      pointsCurrent: currentPts,
      pointsComparison: compPts,
      isAllZero: !anyNonZero
    };
  }, [trend, showComparison, chartWidth, chartHeight, baselineY, padding.left]);

  // Compute SVG Paths
  const currentLinePath = useMemo(() => buildSmoothPath(pointsCurrent), [pointsCurrent]);
  const comparisonLinePath = useMemo(() => buildSmoothPath(pointsComparison), [pointsComparison]);

  const currentAreaPath = useMemo(() => {
    if (pointsCurrent.length < 2) return '';
    const smooth = buildSmoothPath(pointsCurrent);
    const first = pointsCurrent[0];
    const last = pointsCurrent[pointsCurrent.length - 1];
    return `${smooth} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }, [pointsCurrent, baselineY]);

  // Horizontal Grid Lines (4 steps)
  const yTicks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const val = (maxVal / steps) * i;
      const y = baselineY - (val / maxVal) * chartHeight;
      return { val, y };
    });
  }, [maxVal, baselineY, chartHeight]);

  // Active hover/touch handler
  const handlePointerMove = (e) => {
    if (!containerRef.current || pointsCurrent.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (!clientX) return;

    const relativeX = ((clientX - rect.left) / rect.width) * width;

    // Find closest data point
    let closestIdx = 0;
    let minDistance = Infinity;

    pointsCurrent.forEach((pt, i) => {
      const dist = Math.abs(pt.x - relativeX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    });

    setActiveIndex(closestIdx);
  };

  const handlePointerLeave = () => {
    setActiveIndex(null);
  };

  // Identify latest data point for live pulse
  const latestPoint = pointsCurrent.length > 0 ? pointsCurrent[pointsCurrent.length - 1] : null;

  // Selected or active point for tooltip
  const activePt = activeIndex !== null ? pointsCurrent[activeIndex] : null;
  const activeCompPt = activeIndex !== null && showComparison ? pointsComparison[activeIndex] : null;

  // Loading state skeleton
  if (loading) {
    return (
      <div className="w-full h-80 rounded-3xl bg-white/70 border border-[#C6B7E2]/30 p-6 flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 bg-[#F6F1E8] rounded-xl" />
          <div className="h-5 w-28 bg-[#F6F1E8] rounded-xl" />
        </div>
        <div className="flex-1 flex items-end space-x-4 pt-10 pb-4">
          {[40, 65, 30, 85, 55, 70, 95].map((pct, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-[#C6B7E2]/20 to-[#E6B44C]/10 rounded-t-xl"
                style={{ height: `${pct}%` }}
              />
              <div className="w-8 h-3 bg-[#F6F1E8] rounded-md" />
            </div>
          ))}
        </div>
        <div className="h-4 w-52 bg-[#F6F1E8] rounded-lg self-center" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-80 rounded-3xl bg-white border border-rose-200 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-[#3B1C5A]">Unable to Load Sales Trend</h4>
        <p className="text-xs text-[#3B1C5A]/70 max-w-sm mt-1 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#3B1C5A] text-white hover:bg-[#3B1C5A]/90 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  // Empty state (no data points or zero sales across all points)
  if (!trend || trend.length === 0) {
    return (
      <div className="w-full h-80 rounded-3xl bg-white border border-[#C6B7E2]/30 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F6F1E8] text-[#3B1C5A]/50 flex items-center justify-center mb-3">
          <TrendingUp className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-[#3B1C5A]">No Sales Activity In This Period</h4>
        <p className="text-xs text-[#3B1C5A]/60 max-w-sm mt-1">
          No customer orders were recorded for the selected date range. Try switching to a broader date range or promoting your store.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full select-none">
      {/* Dynamic Keyframe & Style definitions for pure SVG+CSS Animation */}
      <style>{`
        @keyframes drawLine {
          from {
            stroke-dashoffset: 2000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeInArea {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.85;
          }
        }
        @keyframes goldPulse {
          0% {
            r: 4;
            opacity: 0.9;
          }
          50% {
            r: 12;
            opacity: 0.3;
          }
          100% {
            r: 16;
            opacity: 0;
          }
        }
        .anim-line-trend {
          stroke-dasharray: 2000;
          animation: drawLine 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-area-trend {
          animation: fadeInArea 1s ease-out forwards;
        }
        .anim-gold-pulse {
          animation: goldPulse 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-line-trend {
            stroke-dasharray: none !important;
            animation: none !important;
          }
          .anim-area-trend {
            animation: none !important;
            opacity: 0.85 !important;
          }
          .anim-gold-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* SVG Container */}
      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onTouchEnd={handlePointerLeave}
        className="w-full relative touch-pan-x cursor-crosshair"
      >
        <svg
          key={animKey}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Soft Lavender Area Gradient */}
            <linearGradient id="lavenderGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C6B7E2" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#C6B7E2" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F6F1E8" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing gold filter for live pulse */}
            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E6B44C" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Horizontal Grid lines and Y-axis labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#E6DEC9"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.7"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[11px] font-semibold fill-[#3B1C5A]/50"
              >
                {tick.val >= 1000 ? `${(tick.val / 1000).toFixed(tick.val % 1000 === 0 ? 0 : 1)}k` : Math.round(tick.val)}
              </text>
            </g>
          ))}

          {/* Area Fill Under Current Period Curve */}
          {currentAreaPath && (
            <path
              d={currentAreaPath}
              fill="url(#lavenderGradient)"
              className="anim-area-trend"
            />
          )}

          {/* Previous Equivalent Period Line (Dashed Soft Lavender) */}
          {showComparison && comparisonLinePath && (
            <path
              d={comparisonLinePath}
              fill="none"
              stroke="#C6B7E2"
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-opacity duration-300 opacity-80"
            />
          )}

          {/* Current Period Main Purple Line */}
          {currentLinePath && (
            <path
              d={currentLinePath}
              fill="none"
              stroke="#3B1C5A"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="anim-line-trend"
            />
          )}

          {/* X-axis tick labels */}
          {pointsCurrent.map((pt, i) => {
            // Label density thinning for large counts (e.g. 30 days or 24 hours)
            const count = pointsCurrent.length;
            let showLabel = true;
            if (count > 15) {
              showLabel = i % Math.ceil(count / 7) === 0 || i === count - 1;
            }

            if (!showLabel) return null;

            return (
              <text
                key={i}
                x={pt.x}
                y={baselineY + 22}
                textAnchor="middle"
                className="text-[10px] sm:text-[11px] font-medium fill-[#3B1C5A]/60"
              >
                {pt.raw.label}
              </text>
            );
          })}

          {/* Golden Pulse on Latest/Current Active Data Point */}
          {latestPoint && (
            <g transform={`translate(${latestPoint.x}, ${latestPoint.y})`}>
              {/* Outer expanding animation ring */}
              <circle
                r="4"
                fill="none"
                stroke="#E6B44C"
                strokeWidth="2.5"
                className="anim-gold-pulse"
              />
              {/* Solid gold central point */}
              <circle
                r="4.5"
                fill="#E6B44C"
                stroke="#3B1C5A"
                strokeWidth="2"
                filter="url(#goldGlow)"
              />
            </g>
          )}

          {/* Interactive Hover Crosshair and Markers */}
          {activePt && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={activePt.x}
                y1={padding.top}
                x2={activePt.x}
                y2={baselineY}
                stroke="#3B1C5A"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                strokeOpacity="0.4"
              />

              {/* Comparison Point Marker */}
              {activeCompPt && (
                <circle
                  cx={activeCompPt.x}
                  cy={activeCompPt.y}
                  r="4"
                  fill="#C6B7E2"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}

              {/* Current Point Marker */}
              <circle
                cx={activePt.x}
                cy={activePt.y}
                r="6"
                fill="#3B1C5A"
                stroke="#E6B44C"
                strokeWidth="2.5"
                filter="url(#goldGlow)"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {activePt && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75 transform -translate-x-1/2"
            style={{
              left: `${(activePt.x / width) * 100}%`,
              top: `${Math.max(0, (activePt.y / height) * 100 - 32)}%`
            }}
          >
            <div className="bg-[#3B1C5A] text-white p-3.5 rounded-2xl shadow-xl border border-[#E6B44C]/40 min-w-[200px] text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                <span className="font-semibold text-white/90 truncate">
                  {activePt.raw.fullDate || activePt.raw.label}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#E6B44C]/20 text-[#E6B44C]">
                  {activePt.raw.orderCount || 0} {(activePt.raw.orderCount === 1) ? 'order' : 'orders'}
                </span>
              </div>

              {/* Current Net Sales */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Net Sales:</span>
                <span className="font-bold text-[#E6B44C] text-sm">
                  {formatINR(activePt.sales)}
                </span>
              </div>

              {/* Comparison Period Info */}
              {showComparison && activeCompPt && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-white/70">
                    <span>Prev Period:</span>
                    <span className="font-semibold text-white">
                      {formatINR(activeCompPt.sales)}
                    </span>
                  </div>

                  {activeCompPt.sales > 0 && (
                    <div className="flex items-center justify-end space-x-1 text-[10px] font-bold">
                      {activePt.sales >= activeCompPt.sales ? (
                        <span className="text-emerald-400 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                          +{(((activePt.sales - activeCompPt.sales) / activeCompPt.sales) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center">
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                          {(((activePt.sales - activeCompPt.sales) / activeCompPt.sales) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend Bar */}
      <div className="flex flex-wrap items-center justify-between pt-4 mt-2 border-t border-[#C6B7E2]/20 text-xs text-[#3B1C5A]/70">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Current Period Legend */}
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-1 bg-[#3B1C5A] rounded-full inline-block" />
            <span className="font-medium text-[#3B1C5A]">Current Period (Net Sales)</span>
          </div>

          {/* Comparison Period Legend */}
          {showComparison && (
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[#C6B7E2] inline-block" />
              <span className="font-medium">Previous Period</span>
            </div>
          )}

          {/* Latest Point Pulse */}
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6B44C] border border-[#3B1C5A] inline-block" />
            <span className="font-medium">Latest Metric</span>
          </div>
        </div>

        <div className="text-[11px] text-[#3B1C5A]/50 mt-2 sm:mt-0 font-medium">
          Values displayed in Indian Rupee (INR)
        </div>
      </div>
    </div>
  );
};

export default AnimatedSalesTrendGraph;

