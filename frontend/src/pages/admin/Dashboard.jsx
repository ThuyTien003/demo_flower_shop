import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import {
  getOrderStatsSummary,
  getOrderMonthlyRevenue,
  listAllOrders,
  fetchProducts,
  listAdminUsers,
} from '@/services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly'); // daily | monthly | yearly
  const [fromDate, setFromDate] = useState(''); // YYYY-MM-DD
  const [toDate, setToDate] = useState(''); // YYYY-MM-DD
  const [metrics, setMetrics] = useState({ orders_total: 0, orders_processing: 0, orders_completed: 0, orders_cancelled: 0 });
  const [stock, setStock] = useState({ inStock: 0, outOfStock: 0, totalProducts: 0 });
  const [customers, setCustomers] = useState({ total: 0, newIn30Days: 0 });
  const [SERIES_UNUSED, SET_SERIES_UNUSED] = useState([]); // kept for backward compatibility, unused
  const [multiSeries, setMultiSeries] = useState({ daily: [], monthly: [], yearly: [] });
  const [revenueTotal, setRevenueTotal] = useState(0);

  const formatCurrency = useCallback((n) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n || 0));
    } catch {
      return String(n || 0);
    }
  }, []);

  const tryLoadOrderMetrics = useCallback(async () => {
    try {
      const res = await getOrderStatsSummary();
      const data = res?.data?.data || res?.data || {};
      const total = Number(data.total_orders ?? data.total ?? 0);
      // processing = pending + processing + shipped (nếu có các khóa này)
      const pendingCnt = Number(data.pending_orders ?? data.pending ?? 0);
      const processingCnt = Number(data.processing_orders ?? data.processing ?? 0);
      const shippedCnt = Number(data.shipped_orders ?? data.shipped ?? 0);
      const processing = pendingCnt + processingCnt + shippedCnt;
      // completed = delivered_orders (ưu tiên), hoặc các trường tương đương
      const completed = Number(data.delivered_orders ?? data.completed_orders ?? data.completed ?? data.success ?? 0);
      const cancelled = Number(data.cancelled_orders ?? data.cancelled ?? 0);
      setMetrics({ orders_total: total, orders_processing: processing, orders_completed: completed, orders_cancelled: cancelled });
    } catch (err) {
      console.warn('Failed to load order stats summary, trying fallback from orders list...', err);
      try {
        const resAll = await listAllOrders({ page: 1, limit: 500 });
        const list = resAll?.data?.data || [];
        const total = list.length;
        const processing = list.filter(o => ['processing','pending','confirmed','shipped'].includes(String(o.status || '').toLowerCase())).length;
        const completed = list.filter(o => ['completed','delivered','success'].includes(String(o.status || '').toLowerCase())).length;
        const cancelled = list.filter(o => ['cancelled', 'canceled'].includes(String(o.status || '').toLowerCase())).length;
        setMetrics({ orders_total: total, orders_processing: processing, orders_completed: completed, orders_cancelled: cancelled });
      } catch (err2) {
        console.warn('Fallback orders listing failed', err2);
      }
    }
  }, []);

  const tryLoadStock = useCallback(async () => {
    try {
      const res = await fetchProducts({ page: 1, limit: 500 });
      const items = res?.data?.data || [];
      const inStock = items.filter(p => Number(p.stock_quantity || 0) > 0).length;
      const outOfStock = items.filter(p => Number(p.stock_quantity || 0) <= 0).length;
      setStock({ inStock, outOfStock, totalProducts: items.length });
    } catch {
      setStock({ inStock: 0, outOfStock: 0, totalProducts: 0 });
    }
  }, []);

  const tryLoadCustomers = useCallback(async () => {
    try {
      const res = await listAdminUsers({ page: 1, limit: 1000 });
      const items = res?.data?.data || [];
      const total = items.length;
      let start = null, end = null;
      if (fromDate) start = new Date(fromDate);
      if (toDate) {
        // include end of day
        const e = new Date(toDate);
        e.setHours(23,59,59,999);
        end = e;
      }
      if (!start && !end) {
        const now = new Date();
        const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        start = days30Ago; end = now;
      }
      const newInRange = items.filter(u => {
        const created = u.created_at ? new Date(u.created_at) : null;
        return created && (!start || created >= start) && (!end || created <= end);
      }).length;
      setCustomers({ total, newIn30Days: newInRange });
    } catch {
      setCustomers({ total: 0, newIn30Days: 0 });
    }
  }, []);

  const groupBy = (arr, keyFn) => arr.reduce((acc, x) => { const k = keyFn(x); acc[k] = acc[k] || []; acc[k].push(x); return acc; }, {});

  const computeRevenueFallback = useCallback(async (mode) => {
    // Fallback: derive from orders list total_amount by day/month/year
    try {
      const resAll = await listAllOrders({ page: 1, limit: 1000 });
      const list = resAll?.data?.data || [];
      const rows = list
        .filter(o => ['completed','delivered','success'].includes(String(o.status || '').toLowerCase()))
        .map(o => ({ amount: Number(o.total_amount || o.total || 0), date: o.created_at || o.order_date }));
      // Apply date range filters if provided
      let start = null, end = null;
      if (fromDate) start = new Date(fromDate);
      if (toDate) { const e = new Date(toDate); e.setHours(23,59,59,999); end = e; }
      const filtered = rows.filter(r => {
        const d = r.date ? new Date(r.date) : null;
        return d && (!start || d >= start) && (!end || d <= end);
      });
      const fmt = (d) => {
        const dt = new Date(d);
        if (mode === 'daily') return dt.toISOString().slice(0,10); // YYYY-MM-DD
        if (mode === 'yearly') return String(dt.getUTCFullYear());
        return dt.toISOString().slice(0,7); // YYYY-MM
      };
      const grouped = groupBy(filtered, r => fmt(r.date));
      const series = Object.keys(grouped).sort().map(label => ({ label, value: grouped[label].reduce((s, r) => s + (r.amount || 0), 0) }));
      return series;
    } catch {
      return [];
    }
  }, []);

  const tryLoadRevenue = useCallback(async (mode) => {
    try {
      const params = { period: mode };
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;
      const res = await getOrderMonthlyRevenue(params);
      const data = res?.data?.data || res?.data || [];
      // Accept flexible shapes
      let series = [];
      if (Array.isArray(data)) {
        series = data.map(r => ({
          label: r.label || r.month || r.date || r.period || '',
          value: Number(r.revenue || r.total || r.value || 0),
        })).filter(s => s.label);
      } else if (data?.series) {
        series = (data.series || []).map(r => ({ label: r.label, value: Number(r.value || 0) }));
      }
      if (!series.length) throw new Error('empty');
      return series;
    } catch {
      const fb = await computeRevenueFallback(mode);
      return fb;
    }
  }, [computeRevenueFallback, fromDate, toDate]);

  // Build label domains to make lines continuous even when API returns sparse points
  const buildLabelDomain = useCallback((mode) => {
    const labels = [];
    const end = toDate ? new Date(toDate) : new Date();
    if (mode === 'daily') {
      // last 30 days or constrained by fromDate/toDate
      const start = fromDate ? new Date(fromDate) : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
      const cur = new Date(start);
      while (cur <= end) {
        labels.push(cur.toISOString().slice(0,10));
        cur.setDate(cur.getDate() + 1);
      }
    } else if (mode === 'monthly') {
      // last 12 months
      const cur = new Date(end);
      cur.setDate(1);
      for (let i = 11; i >= 0; i--) {
        const d = new Date(cur.getFullYear(), cur.getMonth() - i, 1);
        labels.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2,'0')}`);
      }
    } else {
      // yearly: last 5 years
      const y = end.getUTCFullYear();
      for (let i = 4; i >= 0; i--) labels.push(String(y - i));
    }
    return labels;
  }, [fromDate, toDate]);

  const normalizeSeries = useCallback((mode, raw) => {
    const domain = buildLabelDomain(mode);
    const m = new Map((raw || []).map(r => [String(r.label), Number(r.value || 0)]));
    return domain.map(l => ({ label: l, value: m.get(l) ?? 0 }));
  }, [buildLabelDomain]);

  const loadAll = useCallback(async (m = period) => {
    setLoading(true);
    await Promise.all([
      tryLoadOrderMetrics(),
      tryLoadStock(),
      tryLoadCustomers(),
    ]);
    // Load revenue for all three modes and update both selected and multiSeries
    const [dailyRaw, monthlyRaw, yearlyRaw] = await Promise.all([
      tryLoadRevenue('daily'),
      tryLoadRevenue('monthly'),
      tryLoadRevenue('yearly'),
    ]);
    const daily = normalizeSeries('daily', dailyRaw || []);
    const monthly = normalizeSeries('monthly', monthlyRaw || []);
    const yearly = normalizeSeries('yearly', yearlyRaw || []);
    setMultiSeries({ daily, monthly, yearly });
    // Keep old series in sync with the selected period
    if (m === 'daily') SET_SERIES_UNUSED(daily);
    else if (m === 'yearly') SET_SERIES_UNUSED(yearly);
    else SET_SERIES_UNUSED(monthly);
    // Compute total from normalized series first
    const selectedArr = m === 'daily' ? daily : (m === 'yearly' ? yearly : monthly);
    let total = (selectedArr || []).reduce((s, r) => s + (Number(r.value) || 0), 0);
    // Fallback: sum from orders list within date range if total is 0
    if (!total) {
      try {
        const resAll = await listAllOrders({ page: 1, limit: 1000 });
        const list = resAll?.data?.data || [];
        const ok = ['completed','delivered','success'];
        // date range
        let start = null, end = null;
        if (fromDate) start = new Date(fromDate);
        if (toDate) { const e = new Date(toDate); e.setHours(23,59,59,999); end = e; }
        const filtered = list.filter(o => {
          const st = String(o.status || '').toLowerCase();
          const d = o.created_at || o.order_date;
          const dt = d ? new Date(d) : null;
          return ok.includes(st) && dt && (!start || dt >= start) && (!end || dt <= end);
        });
        total = filtered.reduce((s, o) => s + (Number(o.total_amount || o.total || 0) || 0), 0);
      } catch (e) {
        console.warn('Fallback revenue total from orders failed', e);
      }
    }
    setRevenueTotal(total || 0);
    setLoading(false);
  }, [period, tryLoadOrderMetrics, tryLoadStock, tryLoadCustomers, tryLoadRevenue, normalizeSeries, fromDate, toDate]);

  useEffect(() => { loadAll(period); }, [loadAll, period]);

  const maxValue = useMemo(() => {
    const all = [...(multiSeries.daily||[]), ...(multiSeries.monthly||[]), ...(multiSeries.yearly||[])];
    return Math.max(0, ...all.map(s => s.value || 0));
  }, [multiSeries]);

  // revenueTotal is computed in loadAll with fallback; keep a memo if needed elsewhere

  const Chart = () => {
    const w = 720, h = 260, pad = 28;
    const scaleY = (v) => {
      if (!maxValue) return h - pad;
      const ratio = v / maxValue;
      return Math.round(h - pad - ratio * (h - pad * 2));
    };
    // Color palette for three series
    const colorMap = { daily: '#2563eb', monthly: '#0ea5e9', yearly: '#7c3aed' };
    const gridYCount = 4;
    // Build line points evenly spaced per series
    const innerW = w - pad * 2;
    const buildPoints = (arr) => {
      const stepX = arr.length > 1 ? innerW / (arr.length - 1) : 0;
      return arr.map((s, i) => {
        const x = pad + (arr.length === 1 ? innerW / 2 : i * stepX);
        const y = scaleY(s.value);
        return { x, y, label: s.label, value: s.value };
      });
    };
    const ptsDaily = buildPoints(multiSeries.daily || []);
    const ptsMonthly = buildPoints(multiSeries.monthly || []);
    const ptsYearly = buildPoints(multiSeries.yearly || []);
    // Build a smooth path using Catmull-Rom -> Bezier conversion
    const smoothPathOf = (pts) => {
      if (!pts || pts.length === 0) return '';
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      const path = [`M ${pts[0].x} ${pts[0].y}`];
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i > 0 ? pts[i - 1] : pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;
        const smoothing = 0.2; // 0..1
        const cp1x = p1.x + (p2.x - p0.x) * smoothing / 6;
        const cp1y = p1.y + (p2.y - p0.y) * smoothing / 6;
        const cp2x = p2.x - (p3.x - p1.x) * smoothing / 6;
        const cp2y = p2.y - (p3.y - p1.y) * smoothing / 6;
        path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
      }
      return path.join(' ');
    };
    return (
      <svg width={w} height={h} style={{ width: '100%', height: h }} aria-label="Revenue chart">
        {/* axes */}
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e5e7eb" />
        {/* horizontal gridlines */}
        {Array.from({ length: gridYCount - 1 }).map((_, i) => {
          const gy = pad + ((i + 1) * (h - pad * 2)) / gridYCount;
          return <line key={i} x1={pad} y1={gy} x2={w - pad} y2={gy} stroke="#f3f4f6" />;
        })}
        {/* daily */}
        {ptsDaily.length > 1 && <path d={smoothPathOf(ptsDaily)} fill="none" stroke={colorMap.daily} strokeWidth={2.5} />}
        {ptsDaily.length === 1 && (
          <line x1={ptsDaily[0].x - 6} y1={ptsDaily[0].y} x2={ptsDaily[0].x + 6} y2={ptsDaily[0].y} stroke={colorMap.daily} strokeWidth={2.5} />
        )}
        {ptsDaily.map((p, i) => <circle key={`d${i}`} cx={p.x} cy={p.y} r={3} fill="#fff" stroke={colorMap.daily} strokeWidth={2} />)}
        {/* monthly */}
        {ptsMonthly.length > 1 && <path d={smoothPathOf(ptsMonthly)} fill="none" stroke={colorMap.monthly} strokeWidth={2.5} />}
        {ptsMonthly.length === 1 && (
          <line x1={ptsMonthly[0].x - 6} y1={ptsMonthly[0].y} x2={ptsMonthly[0].x + 6} y2={ptsMonthly[0].y} stroke={colorMap.monthly} strokeWidth={2.5} />
        )}
        {ptsMonthly.map((p, i) => <circle key={`m${i}`} cx={p.x} cy={p.y} r={3} fill="#fff" stroke={colorMap.monthly} strokeWidth={2} />)}
        {/* yearly */}
        {ptsYearly.length > 1 && <path d={smoothPathOf(ptsYearly)} fill="none" stroke={colorMap.yearly} strokeWidth={2.5} />}
        {ptsYearly.length === 1 && (
          <line x1={ptsYearly[0].x - 6} y1={ptsYearly[0].y} x2={ptsYearly[0].x + 6} y2={ptsYearly[0].y} stroke={colorMap.yearly} strokeWidth={2.5} />
        )}
        {ptsYearly.map((p, i) => <circle key={`y${i}`} cx={p.x} cy={p.y} r={3} fill="#fff" stroke={colorMap.yearly} strokeWidth={2} />)}
        {/* optional x labels: show for monthly series if not too many */}
        {(multiSeries.monthly || []).length <= 16 && buildPoints(multiSeries.monthly || []).map((p, i) => (
          <text key={`xl${i}`} x={p.x} y={h - pad + 14} textAnchor="middle" fontSize="10" fill="#6b7280">{(multiSeries.monthly || [])[i]?.label}</text>
        ))}
        {/* y labels */}
        <text x={pad - 6} y={pad} textAnchor="end" fontSize="10" fill="#6b7280">{formatCurrency(maxValue)}</text>
        <text x={pad - 6} y={h - pad} textAnchor="end" fontSize="10" fill="#6b7280">0</text>
        {/* legend */}
        <g transform={`translate(${w - pad - 180}, ${pad - 10})`}>
          <LegendItem color={colorMap.daily} label={`Theo ngày (${formatCurrency((multiSeries.daily||[]).reduce((s,r)=>s+(r.value||0),0))})`} y={0} />
          <LegendItem color={colorMap.monthly} label={`Theo tháng (${formatCurrency((multiSeries.monthly||[]).reduce((s,r)=>s+(r.value||0),0))})`} y={16} />
          <LegendItem color={colorMap.yearly} label={`Theo năm (${formatCurrency((multiSeries.yearly||[]).reduce((s,r)=>s+(r.value||0),0))})`} y={32} />
        </g>
      </svg>
    );
  };

  return (
    <div>
      <AdminHeader
        title="Admin Dashboard"
        subtitle="Tổng quan doanh thu, đơn hàng, kho và khách hàng mới"
        actions={(
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="daily">Theo ngày</option>
              <option value="monthly">Theo tháng</option>
              <option value="yearly">Theo năm</option>
            </select>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            <button onClick={() => loadAll(period)} disabled={loading}>Áp dụng</button>
          </div>
        )}
      />

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12 }}>
        <AdminCard style={{ background: '#ffffff', cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Tổng số đơn hàng</div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{metrics.orders_total}</div>
        </AdminCard>
        <AdminCard style={{ background: '#ffffff', cursor: 'pointer' }} onClick={() => navigate('/admin/orders?statuses=pending,processing,shipped')}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Đơn đang xử lý</div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{metrics.orders_processing}</div>
        </AdminCard>
        <AdminCard style={{ background: '#ffffff', cursor: 'pointer' }} onClick={() => navigate('/admin/orders?statuses=delivered,completed,success')}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Đơn đã hoàn thành</div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{metrics.orders_completed}</div>
        </AdminCard>
        <AdminCard style={{ background: '#ffffff', cursor: 'pointer' }} onClick={() => navigate('/admin/orders?status=cancelled')}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Đơn đã hủy</div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{metrics.orders_cancelled}</div>
        </AdminCard>
        <AdminCard style={{ background: '#ffffff' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Khách hàng mới (30 ngày)</div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{customers.newIn30Days}</div>
        </AdminCard>
      </div>

      {/* Revenue total only */}
      <AdminCard title={`Tổng doanh thu (${period === 'daily' ? 'theo ngày' : period === 'yearly' ? 'theo năm' : 'theo tháng'})`}>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, color: '#6b7280' }}>Tổng</div>
          <div style={{ fontWeight: 900, fontSize: 24 }}>
            {formatCurrency(revenueTotal)}
          </div>
        </div>
      </AdminCard>

      {/* Stock and customers summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <AdminCard title="Tồn kho sản phẩm">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Donut inValue={stock.inStock} outValue={stock.outOfStock} />
            <div style={{ display: 'grid', gap: 8 }}>
              <Badge color="#065f46" label="Còn hàng" value={stock.inStock} />
              <Badge color="#991b1b" label="Hết hàng" value={stock.outOfStock} />
              <Badge color="#1f2937" label="Tổng sản phẩm" value={stock.totalProducts} />
            </div>
          </div>
        </AdminCard>
        <AdminCard title="Khách hàng">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge color="#0f52ba" label="Tổng KH" value={customers.total} />
            <Badge color="#0f3524" label="Mới 30 ngày" value={customers.newIn30Days} />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

function Badge({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 12, padding: '8px 10px', background: '#fff' }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 900 }}>{value}</span>
    </div>
  );
}

function Donut({ inValue = 0, outValue = 0, size = 140, stroke = 20 }) {
  const total = Math.max(0, Number(inValue || 0)) + Math.max(0, Number(outValue || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const inRatio = total ? Math.max(0, Number(inValue || 0)) / total : 0;
  const inLen = circumference * inRatio;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none"
          stroke="#065f46"
          strokeWidth={stroke}
          strokeDasharray={`${inLen} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
      </g>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="16" fontWeight="700">{total}</text>
      <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="11" fill="#6b7280">Tổng</text>
    </svg>
  );
}

function LegendItem({ color, label, y = 0 }) {
  return (
    <g transform={`translate(0, ${y})`}>
      <rect x={0} y={-8} width={12} height={3} fill={color} rx={2} />
      <text x={16} y={-8} dominantBaseline="hanging" fontSize="11" fill="#6b7280">{label}</text>
    </g>
  );
}
