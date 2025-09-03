import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import DejaVuSansRegularUrl from '@/assets/fonts/dejavu/DejaVuSans.ttf'
import DejaVuSansBoldUrl from '@/assets/fonts/dejavu/DejaVuSans-Bold.ttf'
import { format } from 'date-fns'

interface CompanyInfo {
  name?: string
  logo?: string
}

interface ClientComplianceData {
  complianceTypeName: string
  period: string
  frequency: string
  clients: Array<{
    name: string
    branchName?: string
    status: string
    completionDate?: string
    completionMethod?: string
    notes?: string
  }>
  stats: {
    totalClients: number
    completedClients: number
    completionRate: number
  }
}

export async function generateClientCompliancePDF(data: ClientComplianceData, company?: CompanyInfo) {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  // Fonts
  const regularBytes = await fetch(DejaVuSansRegularUrl).then(r => r.arrayBuffer())
  const boldBytes = await fetch(DejaVuSansBoldUrl).then(r => r.arrayBuffer())
  const font = await doc.embedFont(new Uint8Array(regularBytes), { subset: true })
  const boldFont = await doc.embedFont(new Uint8Array(boldBytes), { subset: true })

  // Try to embed company logo once (optional)
  let embeddedLogo: any | undefined
  if (company?.logo) {
    try {
      const logoBytes = await fetch(company.logo).then(r => r.arrayBuffer())
      try {
        embeddedLogo = await doc.embedPng(logoBytes)
      } catch {
        embeddedLogo = await doc.embedJpg(logoBytes)
      }
    } catch {
      embeddedLogo = undefined
    }
  }

  // Layout constants
  const marginX = 48
  const marginTop = 64
  const marginBottom = 56
  const lineHeight = 16
  const sectionGap = 10
  const pageWidth = () => page.getWidth()
  const contentWidth = () => pageWidth() - marginX * 2

  // Colors
  const textColor = rgb(0, 0, 0)
  const subtle = rgb(0.6, 0.6, 0.6)
  const divider = rgb(0.85, 0.85, 0.85)
  const accent = rgb(0.2, 0.55, 0.95)
  const sectionBg = rgb(0.96, 0.97, 0.99)

  // Page state
  let page = doc.addPage()
  let y = page.getHeight() - marginTop
  let pageIndex = 1

  // Date formatter (dd/MM/yyyy)
  const formatDateDmy = (s?: string) => {
    if (!s) return ''
    const d = new Date(s)
    return isNaN(d.getTime()) ? s : format(d, 'dd/MM/yyyy')
  }

  const drawHeader = () => {
    const headerHeight = embeddedLogo ? 120 : 100
    // Header background
    page.drawRectangle({ x: 0, y: page.getHeight() - headerHeight, width: page.getWidth(), height: headerHeight, color: rgb(0.98, 0.98, 0.985) })

    const centerX = page.getWidth() / 2
    let cursorY = page.getHeight() - 16

    // Logo (centered)
    if (embeddedLogo) {
      const logoW = 56
      const logoH = (embeddedLogo.height / embeddedLogo.width) * logoW
      const logoX = centerX - logoW / 2
      const logoY = page.getHeight() - headerHeight + headerHeight - logoH - 8
      page.drawImage(embeddedLogo, { x: logoX, y: logoY, width: logoW, height: logoH })
      cursorY = logoY - 6
    }

    // Company name (centered)
    const companyName = company?.name || 'Company'
    const companySize = 13
    const companyWidth = boldFont.widthOfTextAtSize(companyName, companySize)
    page.drawText(companyName, { x: centerX - companyWidth / 2, y: cursorY - companySize, size: companySize, font: boldFont, color: textColor })
    cursorY -= companySize + 2

    // Report title (centered)
    const title = 'Client Compliance Report'
    const titleSize = 12
    const titleWidth = boldFont.widthOfTextAtSize(title, titleSize)
    page.drawText(title, { x: centerX - titleWidth / 2, y: cursorY - titleSize - 2, size: titleSize, font: boldFont, color: textColor })
    cursorY -= titleSize + 8

    // Compliance type and period (centered)
    const periodText = `${data.complianceTypeName} - ${data.period}`
    const periodSize = 11
    const periodWidth = font.widthOfTextAtSize(periodText, periodSize)
    page.drawText(periodText, { x: centerX - periodWidth / 2, y: cursorY - periodSize, size: periodSize, font, color: subtle })

    // Divider
    page.drawRectangle({ x: marginX, y: page.getHeight() - headerHeight - 1, width: page.getWidth() - marginX * 2, height: 1, color: divider })

    // Reset content Y just below header
    y = page.getHeight() - headerHeight - 16
  }

  const drawFooter = () => {
    const footerY = marginBottom - 24
    page.drawRectangle({ x: marginX, y: footerY + 12, width: page.getWidth() - marginX * 2, height: 1, color: divider })
    const footerText = `Page ${pageIndex}`
    page.drawText(footerText, { x: marginX, y: footerY, size: 10, font, color: subtle })
  }

  const ensureSpace = (needed: number) => {
    if (y - needed < marginBottom) {
      drawFooter()
      page = doc.addPage()
      pageIndex += 1
      drawHeader()
    }
  }

  const drawSectionTitle = (title: string) => {
    const pad = 6
    const h = 24
    ensureSpace(h + 6)
    page.drawRectangle({ x: marginX, y: y - h + pad, width: contentWidth(), height: h, color: sectionBg })
    page.drawText(title, { x: marginX + 10, y: y - h + pad + 6, size: 12, font: boldFont, color: textColor })
    y -= h + 6
  }

  const drawDivider = () => {
    ensureSpace(10)
    page.drawRectangle({ x: marginX, y: y - 2, width: contentWidth(), height: 1, color: accent })
    y -= 10
  }

  const wrapText = (text: string, width: number, f = font, size = 11) => {
    const words = (text || '').split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (f.widthOfTextAtSize(test, size) <= width) line = test
      else { if (line) lines.push(line); line = w }
    }
    if (line) lines.push(line)
    return lines.length ? lines : ['']
  }

  const drawKeyVal = (label: string, value?: string) => {
    const labelText = `${label}: `
    const labelSize = 11
    const labelWidth = boldFont.widthOfTextAtSize(labelText, labelSize)
    const maxValWidth = contentWidth() - labelWidth
    const lines = wrapText(String(value ?? ''), maxValWidth, font, labelSize)

    ensureSpace(lineHeight * Math.max(1, lines.length))
    // Label
    page.drawText(labelText, { x: marginX, y: y - lineHeight, size: labelSize, font: boldFont, color: textColor })
    // First value line on same line as label
    if (lines.length) {
      page.drawText(lines[0], { x: marginX + labelWidth, y: y - lineHeight, size: labelSize, font, color: textColor })
    }
    y -= lineHeight
    // Remaining lines
    for (let i = 1; i < lines.length; i++) {
      ensureSpace(lineHeight)
      page.drawText(lines[i], { x: marginX + labelWidth, y: y - lineHeight, size: labelSize, font, color: textColor })
      y -= lineHeight
    }
  }

  // Initialize first page header
  drawHeader()

  // Summary Information Section
  drawSectionTitle('Compliance Summary')
  drawKeyVal('Compliance Type', data.complianceTypeName)
  drawKeyVal('Period', data.period)
  drawKeyVal('Frequency', data.frequency)
  drawKeyVal('Total Clients', data.stats.totalClients.toString())
  drawKeyVal('Compliant Clients', data.stats.completedClients.toString())
  drawKeyVal('Completion Rate', `${data.stats.completionRate.toFixed(1)}%`)
  drawDivider()

  // Client Status Section
  drawSectionTitle('Client Status Details')

  // Table headers
  const tableX = marginX
  const colClient = 180
  const colBranch = 120
  const colStatus = 80
  const colDate = 80
  const colMethod = 100

  const baseRowHeight = 20
  const cellPadX = 6
  const cellPadY = 4

  const drawTableHeader = () => {
    const headerHeight = 24
    ensureSpace(headerHeight)
    page.drawRectangle({
      x: tableX,
      y: y - headerHeight + 4,
      width: contentWidth(),
      height: headerHeight,
      color: sectionBg,
    })

    let currentX = tableX + cellPadX
    page.drawText('Client Name', { x: currentX, y: y - headerHeight + 8, size: 10, font: boldFont, color: textColor })
    currentX += colClient

    page.drawText('Branch', { x: currentX, y: y - headerHeight + 8, size: 10, font: boldFont, color: textColor })
    currentX += colBranch

    page.drawText('Status', { x: currentX, y: y - headerHeight + 8, size: 10, font: boldFont, color: textColor })
    currentX += colStatus

    page.drawText('Date', { x: currentX, y: y - headerHeight + 8, size: 10, font: boldFont, color: textColor })
    currentX += colDate

    page.drawText('Method', { x: currentX, y: y - headerHeight + 8, size: 10, font: boldFont, color: textColor })

    y -= headerHeight
    // Border line
    page.drawRectangle({ x: tableX, y: y, width: contentWidth(), height: 1, color: divider })
    y -= 2
  }

  drawTableHeader()

  data.clients.forEach((client, index) => {
    ensureSpace(baseRowHeight + 4)

    const rowY = y - baseRowHeight + 4
    
    // Alternate row background
    if (index % 2 === 0) {
      page.drawRectangle({ 
        x: tableX, 
        y: rowY, 
        width: contentWidth(), 
        height: baseRowHeight, 
        color: rgb(0.98, 0.98, 0.99) 
      })
    }

    let currentX = tableX + cellPadX
    const textY = rowY + baseRowHeight / 2 - 4

    // Client Name
    const clientName = client.name.length > 25 ? client.name.substring(0, 25) + '...' : client.name
    page.drawText(clientName, { x: currentX, y: textY, size: 9, font, color: textColor })
    currentX += colClient

    // Branch
    const branchName = (client.branchName || 'Unassigned').length > 18 ? (client.branchName || 'Unassigned').substring(0, 18) + '...' : (client.branchName || 'Unassigned')
    page.drawText(branchName, { x: currentX, y: textY, size: 9, font, color: textColor })
    currentX += colBranch

    // Status
    const statusText = client.status === 'completed' ? 'Compliant' : 
                      client.status === 'overdue' ? 'Overdue' : 'Due'
    const statusColor = client.status === 'completed' ? rgb(0.2, 0.6, 0.3) :
                       client.status === 'overdue' ? rgb(0.8, 0.2, 0.2) : rgb(0.8, 0.6, 0.2)
    page.drawText(statusText, { x: currentX, y: textY, size: 9, font: boldFont, color: statusColor })
    currentX += colStatus

    // Completion Date
    if (client.completionDate) {
      page.drawText(formatDateDmy(client.completionDate), { x: currentX, y: textY, size: 9, font, color: textColor })
    }
    currentX += colDate

    // Completion Method
    if (client.completionMethod) {
      const method = client.completionMethod === 'spotcheck' ? 'Spot Check' : client.completionMethod
      page.drawText(method, { x: currentX, y: textY, size: 9, font, color: textColor })
    }

    y -= baseRowHeight + 2

    // Bottom border for each row
    page.drawRectangle({ x: tableX, y: y, width: contentWidth(), height: 1, color: rgb(0.92, 0.92, 0.92) })
  })

  // Final footer
  drawFooter()

  // Save & download
  const bytes = await doc.save()
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  
  const currentDate = new Date()
  const filename = `${data.complianceTypeName} ${data.period} Client Compliance Report.pdf`
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const downloadClientCompliancePDF = async (data: ClientComplianceData, company?: CompanyInfo) => {
  await generateClientCompliancePDF(data, company);
};