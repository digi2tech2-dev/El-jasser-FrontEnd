import React, { useMemo } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import './AdminNeonGlow.css';

const ProfitTrendChart = ({ points, isArabic, formatMoney }) => {
  const total = useMemo(
    () => points.reduce((sum, point) => sum + point.value, 0),
    [points]
  );
  const candles = useMemo(() => points.map((point, index) => {
    const open = index ? points[index - 1].value : 0;
    const close = point.value;
    const spread = Math.max(Math.abs(close - open) * 0.18, close * 0.08, 0.25);
    return { ...point, open, close, high: Math.max(open, close) + spread, low: Math.max(0, Math.min(open, close) - spread), isUp: close >= open };
  }), [points]);
  const scale = useMemo(() => {
    const high = Math.max(...candles.map((candle) => candle.high), 1);
    const low = Math.min(...candles.map((candle) => candle.low), 0);
    return { high, range: Math.max(high - low, 1) };
  }, [candles]);
  const labelStride = points.length > 18 ? Math.ceil(points.length / 6) : 1;

  return (
    <Card variant="premium" className="admin-profit-chart overflow-hidden p-4 sm:p-6">
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-500">
            <span className="admin-profit-chart-icon"><BarChart3 className="h-4 w-4" /></span>
            <p className="text-[11px] font-black uppercase tracking-[0.14em]">
              {isArabic ? 'شموع الأرباح' : 'Profit candles'}
            </p>
          </div>
          <h2 className="mt-2 text-lg font-black text-[var(--color-text)] sm:text-xl">
            {isArabic ? 'الأرباح حسب التاريخ' : 'Profit by date'}
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {isArabic ? 'الأرباح من الطلبات المكتملة خلال الفترة المحددة.' : 'Completed-order profit across the selected date range.'}
          </p>
        </div>

        <div className="admin-profit-chart-total">
          <TrendingUp className="h-4 w-4" />
          <div>
            <p>{isArabic ? 'إجمالي الفترة' : 'Range total'}</p>
            <strong dir="ltr">{formatMoney(total, 'USD')}</strong>
          </div>
        </div>
      </div>

      <div className="admin-profit-chart-plot" role="img" aria-label={isArabic ? 'رسم بياني للأرباح اليومية' : 'Daily profit chart'}>
        <div className="admin-profit-chart-grid" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <div className="admin-profit-chart-bars">
          {candles.map((candle, index) => {
            const wickTop = ((scale.high - candle.high) / scale.range) * 100;
            const wickHeight = ((candle.high - candle.low) / scale.range) * 100;
            const bodyTop = ((scale.high - Math.max(candle.open, candle.close)) / scale.range) * 100;
            const bodyHeight = Math.max(2.5, (Math.abs(candle.close - candle.open) / scale.range) * 100);
            const showLabel = index % labelStride === 0 || index === points.length - 1;
            return (
              <div className="admin-profit-chart-column" key={candle.date}>
                <div className="admin-profit-chart-bar-wrap">
                  <span className="admin-profit-chart-tooltip" dir="ltr">{formatMoney(candle.close, 'USD')}</span>
                  <span className={`admin-profit-chart-wick ${candle.isUp ? 'is-up' : 'is-down'}`} style={{ top: `${wickTop}%`, height: `${wickHeight}%` }} />
                  <span className={`admin-profit-chart-candle ${candle.isUp ? 'is-up' : 'is-down'}`} style={{ top: `${bodyTop}%`, height: `${bodyHeight}%` }} />
                </div>
                <span className="admin-profit-chart-label">{showLabel ? candle.label : ''}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ProfitTrendChart;
