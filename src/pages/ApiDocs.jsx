import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, Copy, ExternalLink, Menu } from 'lucide-react';
import brandIconImage from '../assets/elgny.webp';

const withoutTrailingSlash = (value) => String(value || '').trim().replace(/\/+$/, '');

// The B2B variable is the complete canonical URL. The fallback accepts the
// application /api base (and tolerates an already-canonical value) before
// appending the canonical path exactly once.
const deriveCanonicalB2bBase = (apiBase) => {
  let base = withoutTrailingSlash(apiBase);
  if (!base) return '/client/api';

  while (/\/(?:api\/)?client\/api$/i.test(base)) {
    base = base.replace(/\/(?:api\/)?client\/api$/i, '');
  }
  base = base.replace(/\/api$/i, '');
  return `${base || ''}/client/api`;
};

const configuredB2bApiBase = withoutTrailingSlash(import.meta.env.VITE_B2B_API_BASE_URL);
const apiBaseUrl = configuredB2bApiBase || deriveCanonicalB2bBase(import.meta.env.VITE_API_BASE_URL);

const navigation = [
  ['introduction', 'Introduction'],
  ['base-url', 'Base URL'],
  ['authentication', 'Authentication'],
  ['profile', 'Profile'],
  ['products', 'Products'],
  ['content', 'Content / Categories'],
  ['create-order', 'Create Order'],
  ['check-orders', 'Check Orders'],
  ['statuses', 'Status Values'],
  ['errors', 'Error Codes'],
  ['examples', 'Code Examples'],
  ['legacy', 'Legacy Compatibility'],
];

const CopyButton = ({ value, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // The code remains selectable when clipboard access is unavailable.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-amber-200/20 bg-white/5 font-semibold text-slate-200 transition hover:border-amber-300/65 hover:bg-amber-300/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300/70 ${compact ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm'}`}
      aria-label={`Copy ${value}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const CodeBlock = ({ children, label = 'Example' }) => {
  const value = String(children).trim().replace(/\n\+(?=\s+-[A-Za-z])/g, '\n');
  return (
    <div dir="ltr" className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#090b16] text-left shadow-inner shadow-black/20">
      <div className="flex items-center justify-between gap-3 border-b border-slate-700/80 bg-slate-900/70 px-3 py-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span>
        <CopyButton value={value} compact />
      </div>
      <pre className="max-w-full overflow-x-auto p-4 text-left font-mono text-xs leading-6 text-slate-100 [direction:ltr] sm:text-[13px]"><code>{value}</code></pre>
    </div>
  );
};

const EndpointCard = ({ method, path, description, children }) => (
  <article className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/40">
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/70 bg-slate-900/50 px-4 py-3">
      <span className={`rounded-md px-2 py-1 font-mono text-xs font-bold tracking-wide ${method === 'POST' ? 'bg-amber-500/20 text-amber-100' : 'bg-cyan-500/15 text-cyan-100'}`}>{method}</span>
      <code className="min-w-0 break-all font-mono text-sm font-semibold text-white [direction:ltr]">{path}</code>
    </div>
    <div className="space-y-4 p-4">
      {description ? <p className="text-sm leading-6 text-slate-300">{description}</p> : null}
      {children}
    </div>
  </article>
);

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24 rounded-2xl border border-slate-700/70 bg-[#121021] p-5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.14)] sm:p-7">
    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h2>
    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">{children}</div>
  </section>
);

const DocsNavigation = ({ activeSection, onNavigate, mobile = false }) => (
  <nav aria-label="API documentation sections" className={mobile ? 'grid gap-1 p-3' : 'space-y-1'}>
    {navigation.map(([id, label]) => (
      <a key={id} href={`#${id}`} onClick={onNavigate} className={`block rounded-lg px-3 py-2 text-sm transition ${activeSection === id ? 'bg-amber-300/15 font-semibold text-amber-100' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
        {label}
      </a>
    ))}
  </nav>
);

const ApiDocs = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-18% 0px -72% 0px', threshold: 0 });

    navigation.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const closeMobileNavigation = (event) => event.currentTarget.closest('details')?.removeAttribute('open');

  return (
    <main dir="ltr" className="min-h-screen bg-[#090713] text-left text-slate-100 [direction:ltr]">
      <header className="sticky top-0 z-40 border-b border-amber-200/10 bg-[#0d0a18]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="El-Jasser Card home">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-200/20 bg-amber-200/10">
              <img src={brandIconImage} alt="El-Jasser Card" className="h-7 w-7 object-contain" />
            </span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold tracking-wide text-white sm:text-base">El-Jasser Card</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">API Documentation</span></span>
          </Link>
          <Link to="/developers/api" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/20 sm:text-sm">
            API Management <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <details className="mb-5 rounded-xl border border-slate-700/70 bg-[#121021] lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden"><Menu className="h-4 w-4 text-amber-200" /> Browse sections</summary>
          <div className="border-t border-slate-700/70"><DocsNavigation activeSection={activeSection} onNavigate={closeMobileNavigation} mobile /></div>
        </details>

        <div className="grid items-start gap-8 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden lg:block"><div className="sticky top-24 rounded-xl border border-slate-700/70 bg-[#121021]/80 p-3"><p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">On this page</p><DocsNavigation activeSection={activeSection} onNavigate={() => {}} /></div></aside>

          <div className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-amber-300/20 bg-[#151126] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-100"><BookOpen className="h-4 w-4" /> Canonical B2B API</div>
              <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">Integrate with El-Jasser Card.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">Use your account API token with the canonical B2B endpoint. Product pricing, wallet checks, order processing, and status values are enforced by the server.</p>
              <div className="mt-6 rounded-xl border border-slate-700/80 bg-[#090b16] p-3 sm:flex sm:items-center sm:justify-between sm:gap-4"><div className="min-w-0"><p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Base URL</p><code className="block overflow-x-auto whitespace-nowrap font-mono text-sm text-amber-100 [direction:ltr]">{apiBaseUrl}</code></div><div className="mt-3 sm:mt-0"><CopyButton value={apiBaseUrl} /></div></div>
            </section>

            <Section id="introduction" title="Introduction"><p>All canonical product and category identifiers are numeric compatibility IDs. Do not use MongoDB IDs in B2B requests.</p></Section>
            <Section id="base-url" title="Base URL"><p>This base already includes <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-slate-100">/client/api</code>. Append endpoint paths only once.</p><CodeBlock label="Canonical base URL">{apiBaseUrl}</CodeBlock></Section>
            <Section id="authentication" title="Authentication"><p>Send this header with every canonical request:</p><CodeBlock label="Request header">api-token: YOUR_API_TOKEN</CodeBlock><p>Keep API tokens on your server or another secure environment. Do not expose them in browser code.</p></Section>

            <Section id="profile" title="Profile"><EndpointCard method="GET" path="/profile" description="Returns the authenticated account's spendable balance and currency."><CodeBlock label="Request">{`GET ${apiBaseUrl}/profile\napi-token: YOUR_API_TOKEN`}</CodeBlock><CodeBlock label="Response example">{'{\n  "balance": "150",\n  "email": "user@example.com",\n  "currency": "USD"\n}'}</CodeBlock></EndpointCard></Section>

            <Section id="products" title="Products"><EndpointCard method="GET" path="/products" description="Lists products available to the authenticated API account. products_id filters known numeric IDs; base=1 requests the base-compatible view."><CodeBlock label="Requests">{`GET ${apiBaseUrl}/products\nGET ${apiBaseUrl}/products?products_id=1000,1001\nGET ${apiBaseUrl}/products?base=1`}</CodeBlock><CodeBlock label="Response item">{'{\n  "id": 1000,\n  "name": "Example product",\n  "price": 1.5,\n  "currency": "USD",\n  "available": true,\n  "qty_values": null,\n  "params": ["Player ID"],\n  "fields": [{ "key": "player_id", "label": "Player ID", "type": "text", "required": true, "options": [] }]\n}'}</CodeBlock></EndpointCard><p><code className="font-mono text-slate-100">params</code> is retained for legacy label compatibility. Use structured <code className="font-mono text-slate-100">fields</code> to build order input forms.</p></Section>

            <Section id="content" title="Content / Categories"><EndpointCard method="GET" path="/content/:parentId" description="Returns categories and products beneath a numeric compatibility category ID. Use 0 for root content."><CodeBlock label="Requests">{`GET ${apiBaseUrl}/content/0\nGET ${apiBaseUrl}/content/:parentId`}</CodeBlock><CodeBlock label="Response envelope">{'{\n  "status": "OK",\n  "data": { "categories": [], "products": [] }\n}'}</CodeBlock></EndpointCard></Section>

            <Section id="create-order" title="Create Order"><EndpointCard method="POST" path="/orders" description="Creates an order using the existing EL-JASSER pricing, wallet, validation, and fulfillment flow."><CodeBlock label="Request">{`POST ${apiBaseUrl}/orders\napi-token: YOUR_API_TOKEN\nContent-Type: application/json\n\n{\n  "product_id": 1000,\n  "qty": 1,\n  "order_uuid": "client-generated-idempotency-key",\n  "params": { "player_id": "123456789" }\n}`}</CodeBlock><CodeBlock label="Response example">{'{\n  "status": "OK",\n  "data": {\n    "order_id": "ID_...",\n    "order_uuid": "client-generated-idempotency-key",\n    "status": "wait",\n    "price": 1.5,\n    "currency": "USD"\n  }\n}'}</CodeBlock></EndpointCard><p><code className="font-mono text-slate-100">order_uuid</code> is required and idempotent per authenticated account. Reuse it only to safely retrieve the original order.</p></Section>

            <Section id="check-orders" title="Check Orders"><EndpointCard method="GET" path="/check" description="Returns only orders owned by the authenticated API account. Every returned order includes order_uuid."><CodeBlock label="Requests">{`GET ${apiBaseUrl}/check?orders=ID_1,ID_2\nGET ${apiBaseUrl}/check?orders=uuid1,uuid2&uuid=1\nGET ${apiBaseUrl}/check?uuids=uuid1,uuid2`}</CodeBlock></EndpointCard></Section>

            <Section id="statuses" title="Status Values"><div className="grid gap-3 sm:grid-cols-3">{[['accept', 'Completed'], ['wait', 'Pending, processing, manual review, partial, or another in-flight state'], ['reject', 'Failed or cancelled']].map(([status, meaning]) => <div key={status} className="rounded-xl border border-slate-700/70 bg-slate-950/35 p-4"><code className="font-mono font-bold text-amber-100">{status}</code><p className="mt-2 text-xs leading-5 text-slate-400">{meaning}</p></div>)}</div></Section>

            <Section id="errors" title="Error Codes"><CodeBlock label="Canonical compatibility codes">{'100 insufficient balance   105 quantity unavailable   106 invalid quantity\n109 product not found      110 unavailable            111 rate limited\n112 quantity too small     113 quantity too large     114 business/order rule error\n120 token required         121 invalid token          122 API disabled/account inactive\n123 IP not allowed          124 validation error       130 maintenance\n500 internal server error'}</CodeBlock><p>Rate-limited requests return HTTP 429 with code 111. Maintenance blocks order creation only and returns HTTP 503 with code 130.</p></Section>

            <Section id="examples" title="Code Examples"><CodeBlock label="cURL">{`curl -X POST ${apiBaseUrl}/orders \\\n+  -H "api-token: YOUR_API_TOKEN" \\\n+  -H "Content-Type: application/json" \\\n+  -d '{"product_id":1000,"qty":1,"order_uuid":"uuid-1","params":{"player_id":"123"}}'`}</CodeBlock><CodeBlock label="JavaScript">{`await fetch("${apiBaseUrl}/orders", {\n  method: "POST",\n  headers: { "api-token": "YOUR_API_TOKEN", "Content-Type": "application/json" },\n  body: JSON.stringify(payload),\n});`}</CodeBlock></Section>

            <Section id="legacy" title="Legacy Compatibility"><EndpointCard method="GET" path="/newOrder/:productId/params" description="Retained for existing integrations. New integrations should use POST /orders."><CodeBlock label="Legacy request">{`GET ${apiBaseUrl}/newOrder/:productId/params`}</CodeBlock></EndpointCard></Section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ApiDocs;
