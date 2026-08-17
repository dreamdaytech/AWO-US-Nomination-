/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const parseLocalDateTime = (isoString: string | undefined): Date => {
  if (!isoString) return new Date();
  try {
    const trimmed = isoString.trim();
    // Normalize space to T
    const normalized = trimmed.replace(" ", "T");
    
    // Check if it's already an ISO UTC string (ends with Z or has offset)
    if (normalized.endsWith("Z") || normalized.includes("+") || (normalized.includes("-") && normalized.split("-").length > 3)) {
      const d = new Date(normalized);
      if (!isNaN(d.getTime())) return d;
    }
    
    // Manual local parts extraction
    const parts = normalized.split("T");
    const dateParts = parts[0].split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(":");
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
      if (timeParts[2]) {
        seconds = parseInt(timeParts[2].split(".")[0], 10) || 0;
      }
    }
    
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const d = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d.getTime())) return d;
    }
    
    // Ultimate fallback
    const dFallback = new Date(normalized);
    if (!isNaN(dFallback.getTime())) return dFallback;
    return new Date();
  } catch (e) {
    const dErr = new Date(isoString || "");
    if (!isNaN(dErr.getTime())) return dErr;
    return new Date();
  }
};

/**
 * Parses a date-time string in "YYYY-MM-DDTHH:MM:SS" (or similar) local format
 * and returns a formatted string without any timezone shift issues.
 */
export const formatDateTime = (
  isoString: string | undefined,
  formatType: "full" | "short" | "time" | "datetime" = "full"
): string => {
  if (!isoString) return "";
  try {
    // "2026-09-05T18:00:00" -> ["2026-09-05", "18:00:00"]
    const parts = isoString.split("T");
    const dateParts = parts[0].split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    let hours = 0;
    let minutes = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(":");
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
    }
    
    const d = new Date(year, month, day, hours, minutes);
    
    if (formatType === "short") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } else if (formatType === "time") {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (formatType === "datetime") {
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      return `${dateStr} at ${timeStr}`;
    } else {
      return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
  } catch (e) {
    return isoString;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF EXPORT UTILITIES
// Uses browser's native print dialog to produce a PDF – no extra deps needed.
// ─────────────────────────────────────────────────────────────────────────────

const PDF_BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', Arial, sans-serif;
    background: #fff;
    color: #1a1a1a;
    font-size: 11px;
    line-height: 1.5;
    padding: 32px 40px;
  }
  .report-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 3px solid #f59e0b;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand-badge {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #000;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 6px;
    display: inline-block;
  }
  .report-title { font-size: 22px; font-weight: 900; color: #1a1a1a; }
  .report-subtitle { font-size: 10px; color: #666; margin-top: 2px; }
  .meta-box { text-align: right; font-size: 9px; color: #888; line-height: 1.7; }
  .meta-box strong { color: #333; font-size: 10px; }
  .section-heading {
    background: linear-gradient(90deg, #f59e0b22, transparent);
    border-left: 4px solid #f59e0b;
    padding: 6px 12px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #7c3f00;
    margin: 20px 0 10px;
    border-radius: 0 6px 6px 0;
  }
  table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px; }
  th {
    background: #f8f8f8;
    border: 1px solid #e5e5e5;
    padding: 6px 10px;
    text-align: left;
    font-weight: 700;
    color: #444;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  td {
    border: 1px solid #ebebeb;
    padding: 6px 10px;
    vertical-align: top;
    color: #222;
  }
  tr:nth-child(even) td { background: #fafafa; }
  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 20px;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .badge-approved { background: #dcfce7; color: #166534; }
  .badge-pending  { background: #fef9c3; color: #854d0e; }
  .badge-declined { background: #fee2e2; color: #991b1b; }
  .badge-gold     { background: linear-gradient(90deg,#f59e0b,#d97706); color:#000; }
  .rank { font-weight: 900; color: #d97706; font-size: 12px; min-width: 24px; }
  .progress-wrap { background:#e5e7eb; border-radius:4px; height:8px; width:100%; }
  .progress-bar  { height:8px; border-radius:4px; background:linear-gradient(90deg,#f59e0b,#fbbf24); }
  .nominee-photo {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f59e0b;
    display: block;
  }
  .nominee-initial {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #000;
    font-weight: 900;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .nominee-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .footer {
    margin-top: 40px;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    font-size: 9px;
    color: #aaa;
    display: flex;
    justify-content: space-between;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .summary-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 14px;
    text-align: center;
  }
  .summary-card .sc-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; }
  .summary-card .sc-value { font-size: 20px; font-weight: 900; color: #d97706; }
  .summary-card .sc-sub   { font-size: 8px; color: #aaa; }
  @media print {
    body { padding: 16px 20px; }
    @page { margin: 14mm; size: A4; }
    button { display: none !important; }
  }
`;

const PDF_PRINT_SCRIPT = `
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 600);
  });
`;

/** Opens a new tab with a printable Nominations Report and triggers the print dialog. */
export function exportNominationsPDF(
  nominations: { id: string; nomineeName: string; categoryId: number; nominatorName: string; nominatorEmail: string; rationale: string; submittedAt: string; approved: boolean; declined?: boolean }[],
  categories: { id: number; name: string }[],
  generatedBy: string
): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const approvedCount = nominations.filter(n => n.approved).length;
  const pendingCount  = nominations.filter(n => !n.approved && !n.declined).length;
  const declinedCount = nominations.filter(n => n.declined).length;
  const total = nominations.length;

  // Group by category for the report
  const grouped: Record<number, typeof nominations> = {};
  nominations.forEach(n => {
    if (!grouped[n.categoryId]) grouped[n.categoryId] = [];
    grouped[n.categoryId].push(n);
  });

  const catBlocks = categories
    .filter(cat => grouped[cat.id] && grouped[cat.id].length > 0)
    .map(cat => {
      const noms = [...grouped[cat.id]].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      const rows = noms.map((n, i) => {
        const badgeClass = n.approved ? "badge-approved" : n.declined ? "badge-declined" : "badge-pending";
        const badgeLabel = n.approved ? "Approved" : n.declined ? "Declined" : "Pending";
        const submitted = new Date(n.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        return `
          <tr>
            <td class="rank">#${i + 1}</td>
            <td><strong>${escapeHtml(n.nomineeName)}</strong></td>
            <td>${escapeHtml(n.nominatorName)}<br/><span style="color:#888;font-size:9px">${escapeHtml(n.nominatorEmail)}</span></td>
            <td>${escapeHtml(n.rationale || "—")}</td>
            <td>${submitted}</td>
            <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
          </tr>`;
      }).join("");
      return `
        <div class="section-heading">${escapeHtml(cat.name)} — ${noms.length} Submission${noms.length !== 1 ? "s" : ""}</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nominee</th>
              <th>Nominated By</th>
              <th>Rationale</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Nominations Report — AWOL America Awards</title>
  <style>${PDF_BASE_STYLES}</style>
</head>
<body>
  <div class="report-header">
    <div>
      <span class="brand-badge">AWOL America Awards</span>
      <div class="report-title">Nominations Report</div>
      <div class="report-subtitle">Complete record of all user-submitted nominations</div>
    </div>
    <div class="meta-box">
      <strong>Generated On</strong><br/>${dateStr} at ${timeStr}<br/>
      <strong>Generated By</strong><br/>${escapeHtml(generatedBy)}<br/>
      <strong>Confidential — Admin Only</strong>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="sc-label">Total Submissions</div>
      <div class="sc-value">${total}</div>
    </div>
    <div class="summary-card">
      <div class="sc-label">Approved</div>
      <div class="sc-value" style="color:#166534">${approvedCount}</div>
    </div>
    <div class="summary-card">
      <div class="sc-label">Pending</div>
      <div class="sc-value" style="color:#854d0e">${pendingCount}</div>
    </div>
    <div class="summary-card">
      <div class="sc-label">Declined</div>
      <div class="sc-value" style="color:#991b1b">${declinedCount}</div>
    </div>
  </div>

  ${catBlocks || '<p style="color:#888;text-align:center;padding:40px">No nominations to display.</p>'}

  <div class="footer">
    <span>AWOL America Awards — Nomination Report</span>
    <span>${dateStr} • Confidential</span>
  </div>
  <script>${PDF_PRINT_SCRIPT}</script>
</body>
</html>`;

  openPrintWindow(html, "AWOL-Nominations-Report.pdf");
}

/** Opens a new tab with a printable Final List & Approved Nominations Report and triggers the print dialog. */
export function exportFinalListPDF(
  nominees: { id: string; name: string; categoryId: number; listType?: "final" | "approved"; avatarUrl?: string }[],
  categories: { id: number; name: string }[],
  generatedBy: string
): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const finalCount = nominees.filter(n => n.listType === "final" || (!n.listType && !n.id.startsWith("custom-nom-"))).length;
  const approvedCount = nominees.filter(n => n.listType === "approved" || (!n.listType && n.id.startsWith("custom-nom-"))).length;
  const total = nominees.length;

  const grouped: Record<number, typeof nominees> = {};
  nominees.forEach(n => {
    if (!grouped[n.categoryId]) grouped[n.categoryId] = [];
    grouped[n.categoryId].push(n);
  });

  const catBlocks = categories
    .filter(cat => grouped[cat.id] && grouped[cat.id].length > 0)
    .map(cat => {
      const catNominees = [...grouped[cat.id]].sort((a, b) => a.name.localeCompare(b.name));
      const rows = catNominees.map((n, i) => {
        const isFinal = n.listType === "final" || (!n.listType && !n.id.startsWith("custom-nom-"));
        const badgeClass = isFinal ? "badge-approved" : "badge-pending";
        const badgeLabel = isFinal ? "Final List" : "Approved";
        
        const photoHtml = n.avatarUrl
          ? `<img src="${n.avatarUrl}" class="nominee-photo" alt="${escapeHtml(n.name)}" crossorigin="anonymous" />`
          : `<div class="nominee-initial">${escapeHtml(n.name.charAt(0).toUpperCase())}</div>`;
        return `
          <tr>
            <td class="rank">#${i + 1}</td>
            <td>
              <div class="nominee-cell">
                ${photoHtml}
                <strong>${escapeHtml(n.name)}</strong>
              </div>
            </td>
            <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
          </tr>`;
      }).join("");
      return `
        <div class="section-heading">${escapeHtml(cat.name)} — ${catNominees.length} Nominee${catNominees.length !== 1 ? 's' : ''}</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Nominee</th>
              <th style="width: 150px;">List Type</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Final List & Approved Nominations Report — AWOL America Awards</title>
  <style>${PDF_BASE_STYLES}</style>
</head>
<body>
  <div class="report-header">
    <div>
      <span class="brand-badge">AWOL America Awards</span>
      <div class="report-title">Final List &amp; Approved Nominations</div>
      <div class="report-subtitle">Official list of all candidates available for voting</div>
    </div>
    <div class="meta-box">
      <strong>Generated On</strong><br/>${dateStr} at ${timeStr}<br/>
      <strong>Generated By</strong><br/>${escapeHtml(generatedBy)}<br/>
      <strong>Confidential — Admin Only</strong>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="sc-label">Total Nominees</div>
      <div class="sc-value">${total}</div>
    </div>
    <div class="summary-card">
      <div class="sc-label">Final List (Manual)</div>
      <div class="sc-value" style="color:#166534">${finalCount}</div>
    </div>
    <div class="summary-card">
      <div class="sc-label">Approved Nominations</div>
      <div class="sc-value" style="color:#d97706">${approvedCount}</div>
    </div>
  </div>

  ${catBlocks || '<p style="text-align:center;color:#888;padding:40px;">No nominees found.</p>'}

  <div class="footer">
    <span>AWOL America Awards — Final List &amp; Approved Nominations Report</span>
    <span>${dateStr} • Confidential</span>
  </div>
  <script>${PDF_PRINT_SCRIPT}</script>
</body>
</html>`;

  openPrintWindow(html, "AWOL-Final-List-Approved-Nominations.pdf");
}

/** Opens a new tab with a printable Vote Standings Report and triggers the print dialog. */
export function exportVotesPDF(
  nominees: { id: string; name: string; categoryId: number; votes: number; organization?: string; avatarUrl?: string }[],
  categories: { id: number; name: string }[],
  generatedBy: string
): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const totalVotes = nominees.reduce((s, n) => s + n.votes, 0);
  const topNominee = nominees.reduce((best, n) => n.votes > (best?.votes ?? -1) ? n : best, nominees[0] ?? null);

  const catBlocks = categories
    .map(cat => {
      const catNominees = nominees
        .filter(n => n.categoryId === cat.id)
        .sort((a, b) => b.votes - a.votes);
      if (catNominees.length === 0) return "";
      const catTotal = catNominees.reduce((s, n) => s + n.votes, 0);
      const rows = catNominees.map((n, i) => {
        const pct = catTotal > 0 ? ((n.votes / catTotal) * 100).toFixed(1) : "0.0";
        const isWinner = i === 0 && n.votes > 0;
        const photoHtml = n.avatarUrl
          ? `<img src="${n.avatarUrl}" class="nominee-photo" alt="${escapeHtml(n.name)}" crossorigin="anonymous" />`
          : `<div class="nominee-initial">${escapeHtml(n.name.charAt(0).toUpperCase())}</div>`;
        return `
          <tr>
            <td class="rank">${isWinner ? "🥇" : `#${i + 1}`}</td>
            <td>
              <div class="nominee-cell">
                ${photoHtml}
                <div>
                  <strong>${escapeHtml(n.name)}</strong>
                  ${n.organization ? `<br/><span style="color:#888;font-size:9px">${escapeHtml(n.organization)}</span>` : ""}
                </div>
              </div>
            </td>
            <td style="text-align:right;font-weight:700;color:#d97706">${n.votes.toLocaleString()}</td>
            <td style="text-align:right;color:#666">${pct}%</td>
            <td style="width:140px">
              <div class="progress-wrap">
                <div class="progress-bar" style="width:${pct}%"></div>
              </div>
            </td>
            <td>
              ${isWinner ? '<span class="badge badge-gold">Leading</span>' : ""}
            </td>
          </tr>`;
      }).join("");
      return `
        <div class="section-heading">${escapeHtml(cat.name)} — ${catTotal.toLocaleString()} total votes</div>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Nominee</th>
              <th style="text-align:right">Votes</th>
              <th style="text-align:right">Share %</th>
              <th>Distribution</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Vote Standings Report — AWOL America Awards</title>
  <style>${PDF_BASE_STYLES}</style>
</head>
<body>
  <div class="report-header">
    <div>
      <span class="brand-badge">AWOL America Awards</span>
      <div class="report-title">Ballot &amp; Vote Standings Report</div>
      <div class="report-subtitle">Live vote distribution across all award categories</div>
    </div>
    <div class="meta-box">
      <strong>Generated On</strong><br/>${dateStr} at ${timeStr}<br/>
      <strong>Generated By</strong><br/>${escapeHtml(generatedBy)}<br/>
      <strong>Confidential — Admin Only</strong>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="sc-label">Total Votes Cast</div>
      <div class="sc-value">${totalVotes.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="sc-label">Categories</div>
      <div class="sc-value">${categories.length}</div>
    </div>
    <div class="summary-card">
      <div class="sc-label">Total Nominees</div>
      <div class="sc-value">${nominees.length}</div>
    </div>
    <div class="summary-card">
      <div class="sc-label">Overall Leader</div>
      <div class="sc-value" style="font-size:12px;padding-top:4px">${topNominee ? escapeHtml(topNominee.name) : "—"}</div>
      <div class="sc-sub">${topNominee ? topNominee.votes.toLocaleString() + " votes" : ""}</div>
    </div>
  </div>

  ${catBlocks || '<p style="color:#888;text-align:center;padding:40px">No vote data to display.</p>'}

  <div class="footer">
    <span>AWOL America Awards — Ballot &amp; Vote Standings Report</span>
    <span>${dateStr} • Confidential</span>
  </div>
  <script>${PDF_PRINT_SCRIPT}</script>
</body>
</html>`;

  openPrintWindow(html, "AWOL-Vote-Standings-Report.pdf");
}

function escapeHtml(str: string): string {
  return (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function openPrintWindow(html: string, _filename: string): void {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Popup blocked. Please allow popups for this site to export PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
