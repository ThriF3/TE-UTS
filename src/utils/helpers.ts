import jsPDF from "jspdf";



export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const generateNoTransaksi = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX/${y}${m}${d}/${rand}`;
};

export const generateNoPKS = (seq: number): string => {
  const y = new Date().getFullYear();
  return `PKS/${y}/${String(seq).padStart(3, '0')}`;
};

export const getContractStatusBadge = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'badge-gray', review: 'badge-orange', active: 'badge-green',
    expired: 'badge-red', completed: 'badge-blue', renewed: 'badge-purple', terminated: 'badge-red'
  };
  return map[status] || 'badge-gray';
};

export const getOrderStatusBadge = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'badge-gray', pending: 'badge-orange', approved: 'badge-green',
    rejected: 'badge-red', paid: 'badge-blue', cancelled: 'badge-red'
  };
  return map[status] || 'badge-gray';
};

export const getReturnStatusBadge = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'badge-gray', pending: 'badge-orange', approved: 'badge-green',
    rejected: 'badge-red', completed: 'badge-blue'
  };
  return map[status] || 'badge-gray';
};

export const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'Draft', review: 'Review', active: 'Aktif', expired: 'Kadaluarsa',
    completed: 'Selesai', renewed: 'Diperbarui', terminated: 'Dihentikan',
    pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', paid: 'Lunas', cancelled: 'Dibatalkan',
    open: 'Terbuka', refunded: 'Dikembalikan', success: 'Berhasil', failed: 'Gagal',
    cash: 'Tunai', debit: 'Kartu Debit', credit: 'Kartu Kredit', digital: 'Uang Digital',
    booking_lapangan: 'Booking Lapangan', order_barang: 'Order Barang',
    order_suplai: 'Order Suplai', layanan_tambahan: 'Layanan Tambahan',
    retur_barang: 'Retur Barang', pembatalan_booking: 'Batal Booking', koreksi_transaksi: 'Koreksi Transaksi',
    TOP: 'Tempo (TOP)', 'partial': 'Parsial', 'full': 'Penuh',
  };
  return map[status] || status;
};

/**
 * Safely extract an array from nested API response structures.
 * Handles: ApiResponse<{ data: T[] }> | ApiResponse<{ data: { data: T[] } }>
 * Returns the innermost array found, or an empty array.
 */
export function extractList<T = any>(apiData: any): T[] {
  if (!apiData) return [];
  // ApiResponse.data is the payload
  const payload = apiData.data;
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  // payload.data could be T[] or { data: T[], total }
  const inner = payload.data;
  if (!inner) return [];
  if (Array.isArray(inner)) return inner;
  if (inner.data && Array.isArray(inner.data)) return inner.data;
  return [];
}

type AnyRecord = Record<string, unknown>;

export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (value instanceof Date) return value.toLocaleString("id-ID");

  if (Array.isArray(value)) return value.map(formatValue).join(", ");

  if (typeof value === "string") {
    const isISODateTime = /^\d{4}-\d{2}-\d{2}T/.test(value);
    const isISODateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (isISODateTime || isISODateOnly) {
      const d = new Date(isISODateTime ? value : `${value}T00:00:00`);
      if (!Number.isNaN(d.getTime())) {
        return isISODateOnly
          ? d.toLocaleDateString("id-ID")
          : d.toLocaleString("id-ID");
      }
    }

    return value;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const labelize = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

type PdfField = {
  key: string;
  label?: string;
  span?: 1 | 2;
  format?: (value: unknown, data: AnyRecord) => string;
};

type PdfSection = {
  title: string;
  fields: PdfField[];
};

const drawSection = (
  doc: jsPDF,
  section: PdfSection,
  data: AnyRecord,
  yStart: number
) => {
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  const colGap = 6;
  const colWidth = (contentWidth - colGap) / 2;

  const lineHeight = 5.5;
  const labelColor = 80;
  const valueColor = 20;

  let y = yStart;

  const ensureSpace = (needed: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 18;
    }
  };

  ensureSpace(12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text(section.title, margin, y);
  y += 3;

  doc.setDrawColor(210);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);
  y += 8;

  for (let i = 0; i < section.fields.length; i += 2) {
    const left = section.fields[i];
    const right = section.fields[i + 1];

    const leftValue = left
      ? formatFieldValue(left, data)
      : "";
    const rightValue = right
      ? formatFieldValue(right, data)
      : "";

    const leftLabel = left ? (left.label ?? labelize(left.key)) : "";
    const rightLabel = right ? (right.label ?? labelize(right.key)) : "";

    const leftLines = doc.splitTextToSize(String(leftValue), colWidth - 2);
    const rightLines = right
      ? doc.splitTextToSize(String(rightValue), colWidth - 2)
      : [];

    const rowHeight = Math.max(
      left ? 10 + leftLines.length * lineHeight : 0,
      right ? 10 + rightLines.length * lineHeight : 0
    );

    ensureSpace(rowHeight + 4);

    // Left box
    if (left) {
      doc.setDrawColor(225);
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(margin, y, colWidth, rowHeight, 2, 2, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(labelColor);
      doc.text(leftLabel, margin + 3, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(valueColor);
      doc.text(leftLines, margin + 3, y + 11);
    }

    // Right box
    if (right) {
      const x = margin + colWidth + colGap;

      doc.setDrawColor(225);
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(x, y, colWidth, rowHeight, 2, 2, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(labelColor);
      doc.text(rightLabel, x + 3, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(valueColor);
      doc.text(rightLines, x + 3, y + 11);
    }

    y += rowHeight + 4;
  }

  return y;
};

const formatFieldValue = (field: PdfField, data: AnyRecord) => {
  const raw = data[field.key];
  return field.format ? field.format(raw, data) : formatValue(raw);
};

export const exportContractPdf = (contract: AnyRecord) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DOKUMEN KONTRAK / PKS", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Detail data kontrak yang diekspor dari sistem", margin, 20);

  let y = 38;

  // Meta block
  doc.setTextColor(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`No. PKS: ${formatValue(contract.no_pks)}`, margin, y);
  doc.text(`Status: ${formatValue(contract.status)}`, pageWidth - margin - 55, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`ID: ${formatValue(contract.id)}`, margin, y);
  doc.text(`Dibuat: ${formatValue(contract.created_at)}`, pageWidth - margin - 70, y);
  y += 10;

  const sections: PdfSection[] = [
    {
      title: "Informasi Umum",
      fields: [
        { key: "title", label: "Judul", span: 2 },
        { key: "object_contract", label: "Objek Kontrak", span: 2 },
      ],
    },
    {
      title: "Para Pihak",
      fields: [
        { key: "party_first", label: "Pihak Pertama" },
        { key: "party_second", label: "Pihak Kedua" },
        { key: "party_third", label: "Pihak Ketiga" },
      ],
    },
    {
      title: "Detail Kontrak",
      fields: [
        { key: "quantity", label: "Kuantitas" },
        { key: "unit", label: "Unit" },
        {
          key: "price",
          label: "Harga",
          format: (v) =>
            typeof v === "number"
              ? new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(v)
              : formatValue(v),
        },
        { key: "payment_type", label: "Tipe Pembayaran" },
        { key: "top_days", label: "Hari Tempo" },
      ],
    },
    {
      title: "Periode Kontrak",
      fields: [
        { key: "start_date", label: "Tanggal Mulai" },
        { key: "end_date", label: "Tanggal Akhir" },
      ],
    },
    {
      title: "Catatan",
      fields: [
        { key: "return_policy", label: "Kebijakan Retur", span: 2 },
        { key: "notes", label: "Catatan", span: 2 },
      ],
    },
    {
      title: "Persetujuan",
      fields: [
        { key: "created_by", label: "Dibuat Oleh" },
        { key: "reviewed_by", label: "Diperiksa Oleh" },
        { key: "approved_by", label: "Disetujui Oleh" },
        { key: "updated_at", label: "Diperbarui" },
      ],
    },
  ];

  for (const section of sections) {
    y = drawSection(doc, section, contract, y);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(210);
  doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(
    `Dokumen ini dibuat otomatis pada ${new Date().toLocaleString("id-ID")}`,
    margin,
    pageHeight - 10
  );

  const safeName = `PKS-${formatValue(contract.no_pks) || formatValue(contract.id)}.pdf`
    .replace(/[^\w.-]+/g, "_");

  doc.save(safeName);
};

export const exportTableToPdf = <T extends AnyRecord>(
  rows: T[],
  title: string,
  filename: string
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const margin = 12;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 8;

  if (rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Tidak ada data", margin, y);
    doc.save(filename);
    return;
  }

  const keys = Object.keys(rows[0]).filter(
    (k) => !["id", "createdAt", "updatedAt", "password", "ktp_file"].includes(k)
  );

  const headerText = keys.map(labelize);
  const maxWidths = keys.map((key) => {
    const colValues = [key, ...rows.map((r) => String(r[key] ?? ""))];
    return Math.min(maxWidth, Math.max(...colValues.map((v) => doc.getTextWidth(v))));
  });

  const headerLineHeight = 6;
  const rowLineHeight = 6;
  const totalHeight = headerLineHeight + rows.length * rowLineHeight;

  if (y + totalHeight > 285) {
    doc.addPage();
    y = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  const headerY = y;
  let currentX = margin;

  headerText.forEach((label, i) => {
    const w = maxWidths[i] + 4;
    doc.setFillColor(230, 230, 230);
    doc.rect(currentX, headerY, w, headerLineHeight, "F");
    doc.rect(currentX, headerY, w, headerLineHeight, "S");
    doc.text(label, currentX + 2, headerY + 4);
    currentX += w;
  });

  y += headerLineHeight + 1;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  rows.forEach((row, rowIndex) => {
    if (y + rowLineHeight > 285) {
      doc.addPage();
      y = 16;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      currentX = margin;
      headerText.forEach((label, i) => {
        const w = maxWidths[i] + 4;
        doc.setFillColor(230, 230, 230);
        doc.rect(currentX, y, w, headerLineHeight, "F");
        doc.rect(currentX, y, w, headerLineHeight, "S");
        doc.text(label, currentX + 2, y + 4);
        currentX += w;
      });
      y += headerLineHeight + 1;
    }

    currentX = margin;

    keys.forEach((key, i) => {
      const w = maxWidths[i] + 4;
      const v = formatValue(row[key]);
      const lines = doc.splitTextToSize(v, w - 4);
      doc.setFillColor(rowIndex % 2 === 0 ? 255 : 245, 255, 255);
      doc.rect(currentX, y, w, rowLineHeight, "F");
      doc.rect(currentX, y, w, rowLineHeight, "S");
      doc.text(lines, currentX + 2, y + 4);
      currentX += w;
    });

    y += rowLineHeight;
  });

  doc.save(filename);
};