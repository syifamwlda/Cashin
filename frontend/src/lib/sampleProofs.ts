/**
 * Sample SVG Data URIs representing Proof of Work / Deliverables
 * Used as defaults and instant test previews when creating invoices.
 */

export const SAMPLE_PROOFS = [
  {
    title: "Pratinjau Mockup UI Mobile & Design System",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#0f172a"/>
        <rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <circle cx="50" cy="50" r="14" fill="#10b981"/>
        <text x="80" y="55" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="16">DELIVERABLE 01 • FINAL UI/UX SCREENS</text>
        <rect x="50" y="90" width="150" height="250" rx="14" fill="#090d16" stroke="#10b981" stroke-width="2"/>
        <rect x="70" y="110" width="110" height="18" rx="4" fill="#334155"/>
        <circle cx="125" cy="170" r="30" fill="#10b981" opacity="0.8"/>
        <rect x="70" y="220" width="110" height="12" rx="4" fill="#64748b"/>
        <rect x="70" y="240" width="80" height="10" rx="4" fill="#475569"/>
        <rect x="70" y="280" width="110" height="30" rx="8" fill="#f97316"/>
        
        <rect x="225" y="90" width="150" height="250" rx="14" fill="#090d16" stroke="#38bdf8" stroke-width="2"/>
        <rect x="245" y="110" width="110" height="18" rx="4" fill="#334155"/>
        <rect x="245" y="150" width="110" height="60" rx="8" fill="#1e293b"/>
        <rect x="245" y="230" width="110" height="12" rx="4" fill="#64748b"/>
        <rect x="245" y="280" width="110" height="30" rx="8" fill="#10b981"/>

        <rect x="400" y="90" width="150" height="250" rx="14" fill="#090d16" stroke="#a855f7" stroke-width="2"/>
        <circle cx="475" cy="140" r="26" fill="#a855f7" opacity="0.8"/>
        <rect x="420" y="185" width="110" height="12" rx="4" fill="#64748b"/>
        <rect x="420" y="210" width="70" height="10" rx="4" fill="#475569"/>
        <rect x="420" y="280" width="110" height="30" rx="8" fill="#6366f1"/>
        <text x="50" y="365" fill="#94a3b8" font-family="monospace" font-size="11">✓ VERIFIED ASSET HASH: 0x8a92f0...34bc</text>
      </svg>
    `),
  },
  {
    title: "Laporan Hasil Uji QA & Checklist Fitur",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#0f172a"/>
        <rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <circle cx="50" cy="50" r="14" fill="#f97316"/>
        <text x="80" y="55" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="16">DELIVERABLE 02 • QA AUDIT & ACCEPTANCE</text>
        <rect x="50" y="90" width="500" height="45" rx="8" fill="#090d16" stroke="#334155"/>
        <text x="70" y="118" fill="#10b981" font-family="monospace" font-size="14">✔ 42/42 Unit Tests Passed (100% Coverage)</text>
        
        <rect x="50" y="150" width="500" height="45" rx="8" fill="#090d16" stroke="#334155"/>
        <text x="70" y="178" fill="#10b981" font-family="monospace" font-size="14">✔ Responsive Mobile & Desktop Layout Validated</text>
        
        <rect x="50" y="210" width="500" height="45" rx="8" fill="#090d16" stroke="#334155"/>
        <text x="70" y="238" fill="#10b981" font-family="monospace" font-size="14">✔ Web3 Wallet Integration: MetaMask & Base Sepolia</text>
        
        <rect x="50" y="270" width="500" height="45" rx="8" fill="#090d16" stroke="#334155"/>
        <text x="70" y="298" fill="#10b981" font-family="monospace" font-size="14">✔ Cross-Browser Compatibility (Chrome, Safari, Brave)</text>
        
        <text x="50" y="355" fill="#94a3b8" font-family="monospace" font-size="11">DITANDATANGANI SECARA DIGITAL OLEH KLIEN & FREELANCER</text>
      </svg>
    `),
  },
  {
    title: "Surat Berita Acara Serah Terima (BAST)",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#f8fafc"/>
        <rect x="20" y="20" width="560" height="360" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="50" y="50" width="220" height="20" rx="4" fill="#0f172a"/>
        <rect x="50" y="80" width="380" height="12" rx="3" fill="#64748b"/>
        <line x1="50" y1="110" x2="550" y2="110" stroke="#e2e8f0" stroke-width="2"/>
        
        <text x="50" y="145" fill="#0f172a" font-family="sans-serif" font-weight="bold" font-size="14">BERITA ACARA SERAH TERIMA PEKERJAAN (BAST)</text>
        <text x="50" y="175" fill="#475569" font-family="sans-serif" font-size="12">Pekerjaan telah diserahkan dengan rincian kode repositori dan aset final.</text>
        <text x="50" y="195" fill="#475569" font-family="sans-serif" font-size="12">Klien menyatakan pekerjaan selesai sesuai spesifikasi kontrak kerja.</text>
        
        <rect x="50" y="240" width="180" height="80" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="4"/>
        <text x="65" y="270" fill="#64748b" font-family="monospace" font-size="10">PARAF DIGITAL FREELANCER</text>
        <text x="65" y="295" fill="#059669" font-family="monospace" font-size="13" font-weight="bold">✓ 0xf39F...2266</text>
        
        <rect x="370" y="240" width="180" height="80" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="4"/>
        <text x="385" y="270" fill="#64748b" font-family="monospace" font-size="10">PARAF DIGITAL KLIEN</text>
        <text x="385" y="295" fill="#2563eb" font-family="monospace" font-size="13" font-weight="bold">✓ 0x7099...79C8</text>
        
        <circle cx="510" cy="140" r="32" fill="#ef4444" opacity="0.15" stroke="#ef4444" stroke-width="2"/>
        <text x="490" y="145" fill="#b91c1c" font-family="sans-serif" font-weight="900" font-size="11">SAH</text>
      </svg>
    `),
  },
  {
    title: "Tangkapan Layar Repositori & Commit Git",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#090d16"/>
        <rect x="20" y="20" width="560" height="360" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
        <circle cx="45" cy="45" r="6" fill="#ef4444"/>
        <circle cx="65" cy="45" r="6" fill="#f59e0b"/>
        <circle cx="85" cy="45" r="6" fill="#10b981"/>
        
        <text x="120" y="50" fill="#94a3b8" font-family="monospace" font-size="13">git log --oneline -n 4</text>
        <line x1="20" y1="70" x2="580" y2="70" stroke="#1e293b" stroke-width="1.5"/>
        
        <text x="45" y="115" fill="#38bdf8" font-family="monospace" font-size="13">c9f82a1</text>
        <text x="125" y="115" fill="#f1f5f9" font-family="monospace" font-size="13">feat: finalize invoice financing escrow contracts</text>
        
        <text x="45" y="165" fill="#38bdf8" font-family="monospace" font-size="13">7d3b019</text>
        <text x="125" y="165" fill="#f1f5f9" font-family="monospace" font-size="13">feat: add ERC-721 invoice minting and transfer events</text>
        
        <text x="45" y="215" fill="#38bdf8" font-family="monospace" font-size="13">4e112d8</text>
        <text x="125" y="215" fill="#f1f5f9" font-family="monospace" font-size="13">test: complete anti-double funding attack scenarios</text>
        
        <text x="45" y="265" fill="#38bdf8" font-family="monospace" font-size="13">1a89c32</text>
        <text x="125" y="265" fill="#f1f5f9" font-family="monospace" font-size="13">docs: update documentation and handover deliverables</text>
        
        <rect x="45" y="310" width="510" height="40" rx="6" fill="#1e293b"/>
        <text x="65" y="335" fill="#10b981" font-family="monospace" font-size="12">✓ REPOSITORY SIGN-OFF: main branch merged & tagged v1.0.0</text>
      </svg>
    `),
  },
];
