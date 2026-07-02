"""
Markdown to PDF converter with table support and Uzbek (Latin) characters.
Uses reportlab Platypus for clean, professional output.
"""
import re
import sys
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Unicode fonts that support Uzbek Latin (o', g', etc.)
WIN_FONTS = Path("C:/Windows/Fonts")
try:
    pdfmetrics.registerFont(TTFont("DejaVuSans", str(WIN_FONTS / "DejaVuSans.ttf")))
    pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", str(WIN_FONTS / "DejaVuSans-Bold.ttf")))
    BASE_FONT = "DejaVuSans"
    BOLD_FONT = "DejaVuSans-Bold"
except Exception:
    try:
        pdfmetrics.registerFont(TTFont("Calibri", str(WIN_FONTS / "calibri.ttf")))
        pdfmetrics.registerFont(TTFont("Calibri-Bold", str(WIN_FONTS / "calibrib.ttf")))
        BASE_FONT = "Calibri"
        BOLD_FONT = "Calibri-Bold"
    except Exception:
        BASE_FONT = "Helvetica"
        BOLD_FONT = "Helvetica-Bold"


def inline_format(text):
    """Convert inline markdown to reportlab markup."""
    # Code (inline) — backticks
    text = re.sub(r"`([^`]+)`", r'<font name="Courier" backColor="#f0f0f0">\1</font>', text)
    # Bold
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    # Italic
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    # Emoji passthrough (already unicode)
    return text


def build_styles():
    styles = getSampleStyleSheet()

    # Override default to use unicode font
    styles["Normal"].fontName = BASE_FONT
    styles["Normal"].fontSize = 10
    styles["Normal"].leading = 14
    styles["Normal"].spaceAfter = 6

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName=BOLD_FONT,
        fontSize=24,
        leading=30,
        alignment=TA_CENTER,
        spaceAfter=20,
        textColor=colors.HexColor("#1a1a2e"),
    )

    h1 = ParagraphStyle(
        "H1",
        parent=styles["Normal"],
        fontName=BOLD_FONT,
        fontSize=18,
        leading=24,
        spaceBefore=18,
        spaceAfter=10,
        textColor=colors.HexColor("#0f3460"),
        borderPadding=6,
    )

    h2 = ParagraphStyle(
        "H2",
        parent=styles["Normal"],
        fontName=BOLD_FONT,
        fontSize=14,
        leading=18,
        spaceBefore=14,
        spaceAfter=8,
        textColor=colors.HexColor("#16213e"),
    )

    h3 = ParagraphStyle(
        "H3",
        parent=styles["Normal"],
        fontName=BOLD_FONT,
        fontSize=12,
        leading=16,
        spaceBefore=10,
        spaceAfter=6,
        textColor=colors.HexColor("#0f3460"),
    )

    h4 = ParagraphStyle(
        "H4",
        parent=styles["Normal"],
        fontName=BOLD_FONT,
        fontSize=11,
        leading=14,
        spaceBefore=8,
        spaceAfter=4,
        textColor=colors.HexColor("#333333"),
    )

    body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName=BASE_FONT,
        fontSize=10,
        leading=14,
        alignment=TA_LEFT,
        spaceAfter=6,
    )

    bullet = ParagraphStyle(
        "Bullet",
        parent=body,
        leftIndent=18,
        bulletIndent=6,
        spaceAfter=3,
    )

    code = ParagraphStyle(
        "Code",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=9,
        leading=12,
        leftIndent=12,
        backColor=colors.HexColor("#f5f5f5"),
        borderColor=colors.HexColor("#e0e0e0"),
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=10,
    )

    quote = ParagraphStyle(
        "Quote",
        parent=body,
        fontName=BASE_FONT,
        fontSize=10,
        leftIndent=16,
        textColor=colors.HexColor("#555555"),
        borderColor=colors.HexColor("#cccccc"),
        spaceAfter=8,
    )

    return {
        "title": title_style,
        "h1": h1,
        "h2": h2,
        "h3": h3,
        "h4": h4,
        "body": body,
        "bullet": bullet,
        "code": code,
        "quote": quote,
    }


def parse_table(lines, start_idx):
    """Parse a markdown table starting at start_idx. Returns (table_data, next_idx)."""
    rows = []
    i = start_idx
    while i < len(lines) and lines[i].strip().startswith("|"):
        row = lines[i].strip()
        # Skip separator row (|---|---|)
        if re.match(r"^\|[\s:\-|]+\|$", row):
            i += 1
            continue
        cells = [c.strip() for c in row.strip("|").split("|")]
        rows.append(cells)
        i += 1
    return rows, i


def make_table_flowable(rows, styles):
    """Convert table rows to a reportlab Table flowable."""
    if not rows:
        return None

    # Convert each cell to a Paragraph for wrapping
    cell_style = ParagraphStyle(
        "Cell",
        fontName=BASE_FONT,
        fontSize=9,
        leading=11,
        alignment=TA_LEFT,
    )
    header_style = ParagraphStyle(
        "CellHeader",
        fontName=BOLD_FONT,
        fontSize=9,
        leading=11,
        alignment=TA_LEFT,
        textColor=colors.white,
    )

    data = []
    for i, row in enumerate(rows):
        formatted_row = []
        for cell in row:
            cell_text = inline_format(cell)
            style = header_style if i == 0 else cell_style
            formatted_row.append(Paragraph(cell_text, style))
        data.append(formatted_row)

    # Calculate column widths based on column count
    n_cols = len(rows[0])
    page_width = A4[0] - 4 * cm  # left+right margins
    col_width = page_width / n_cols

    table = Table(data, colWidths=[col_width] * n_cols, repeatRows=1)
    table.setStyle(TableStyle([
        # Header row
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), BOLD_FONT),
        ("ALIGN", (0, 0), (-1, 0), "LEFT"),
        # Body
        ("FONTNAME", (0, 1), (-1, -1), BASE_FONT),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        # Grid
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cccccc")),
        # Alternating row color
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
        # Padding
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def parse_code_block(lines, start_idx):
    """Parse fenced code block. Returns (code_text, next_idx)."""
    code_lines = []
    i = start_idx + 1  # skip opening fence
    while i < len(lines) and not lines[i].strip().startswith("```"):
        code_lines.append(lines[i])
        i += 1
    return "\n".join(code_lines), i + 1  # skip closing fence


def md_to_flowables(md_text, styles):
    """Convert markdown text to a list of reportlab flowables."""
    flowables = []
    lines = md_text.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Empty line
        if not stripped:
            i += 1
            continue

        # Horizontal rule
        if re.match(r"^-{3,}$|^\*{3,}$|^_{3,}$", stripped):
            flowables.append(Spacer(1, 8))
            from reportlab.platypus import HRFlowable
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc")))
            flowables.append(Spacer(1, 8))
            i += 1
            continue

        # Code fence
        if stripped.startswith("```"):
            code_text, next_i = parse_code_block(lines, i)
            # Escape special chars for paragraph
            escaped = code_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            escaped = escaped.replace("\n", "<br/>")
            flowables.append(Paragraph(f'<font name="Courier">{escaped}</font>', styles["code"]))
            i = next_i
            continue

        # Table
        if stripped.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s:\-|]+\|$", lines[i + 1].strip()):
            rows, next_i = parse_table(lines, i)
            table = make_table_flowable(rows, styles)
            if table:
                flowables.append(KeepTogether(table) if len(rows) < 8 else table)
                flowables.append(Spacer(1, 10))
            i = next_i
            continue

        # Headings
        if stripped.startswith("# "):
            text = inline_format(stripped[2:].strip())
            flowables.append(Paragraph(text, styles["title"]))
            i += 1
            continue
        if stripped.startswith("## "):
            text = inline_format(stripped[3:].strip())
            flowables.append(Paragraph(text, styles["h1"]))
            i += 1
            continue
        if stripped.startswith("### "):
            text = inline_format(stripped[4:].strip())
            flowables.append(Paragraph(text, styles["h2"]))
            i += 1
            continue
        if stripped.startswith("#### "):
            text = inline_format(stripped[5:].strip())
            flowables.append(Paragraph(text, styles["h3"]))
            i += 1
            continue

        # Blockquote
        if stripped.startswith("> "):
            text = inline_format(stripped[2:].strip())
            flowables.append(Paragraph(f"<i>{text}</i>", styles["quote"]))
            i += 1
            continue

        # Bullet list
        if re.match(r"^[\-\*\+]\s+", stripped):
            text = inline_format(re.sub(r"^[\-\*\+]\s+", "", stripped))
            flowables.append(Paragraph(f"• {text}", styles["bullet"]))
            i += 1
            continue

        # Numbered list
        if re.match(r"^\d+\.\s+", stripped):
            text = inline_format(re.sub(r"^\d+\.\s+", "", stripped))
            num = re.match(r"^(\d+)\.", stripped).group(1)
            flowables.append(Paragraph(f"{num}. {text}", styles["bullet"]))
            i += 1
            continue

        # Regular paragraph (may span multiple lines until blank)
        para_lines = [stripped]
        j = i + 1
        while j < len(lines) and lines[j].strip() and not (
            lines[j].strip().startswith("#") or
            lines[j].strip().startswith("|") or
            lines[j].strip().startswith("```") or
            lines[j].strip().startswith(">") or
            re.match(r"^[\-\*\+]\s+", lines[j].strip()) or
            re.match(r"^\d+\.\s+", lines[j].strip()) or
            re.match(r"^-{3,}$", lines[j].strip())
        ):
            para_lines.append(lines[j].strip())
            j += 1
        text = inline_format(" ".join(para_lines))
        flowables.append(Paragraph(text, styles["body"]))
        i = j

    return flowables


def add_page_number(canvas, doc):
    """Add page numbers."""
    canvas.saveState()
    canvas.setFont(BASE_FONT, 8)
    canvas.setFillColor(colors.HexColor("#888888"))
    page_num = canvas.getPageNumber()
    text = f"Sahifa {page_num}"
    canvas.drawCentredString(A4[0] / 2, 1 * cm, text)
    # Footer line
    canvas.setStrokeColor(colors.HexColor("#cccccc"))
    canvas.setLineWidth(0.3)
    canvas.line(2 * cm, 1.4 * cm, A4[0] - 2 * cm, 1.4 * cm)
    canvas.restoreState()


def convert(md_path, pdf_path):
    md_text = Path(md_path).read_text(encoding="utf-8")
    styles = build_styles()

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="Claude Code — To'liq Qo'llanma",
        author="Farruxbek",
    )

    flowables = md_to_flowables(md_text, styles)
    doc.build(flowables, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF yaratildi: {pdf_path}")


if __name__ == "__main__":
    md = sys.argv[1] if len(sys.argv) > 1 else "claude-code-guide.md"
    pdf = sys.argv[2] if len(sys.argv) > 2 else "claude-code-guide.pdf"
    convert(md, pdf)
