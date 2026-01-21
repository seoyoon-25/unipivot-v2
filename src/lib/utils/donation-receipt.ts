import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface ReceiptData {
  donationId: string
  receiptNumber: string
  donorName: string
  donorEmail?: string
  amount: number
  donationType: string
  donationDate: Date
  organizationName: string
  organizationAddress: string
  organizationContact: string
  organizationRegistrationNumber: string
}

/**
 * 영수증 번호 생성
 */
export function generateReceiptNumber(donationId: string): string {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString(36).toUpperCase()
  const shortId = donationId.slice(-6).toUpperCase()
  return `${year}-${timestamp}-${shortId}`
}

/**
 * 기부금 영수증 PDF 생성
 */
export async function generateDonationReceiptPDF(data: ReceiptData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 size in points

  // Font setup (using Helvetica as substitute since Korean fonts need embedding)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const { width, height } = page.getSize()
  const margin = 50

  // Colors
  const primaryColor = rgb(1, 0.42, 0.21) // #FF6B35
  const textColor = rgb(0.1, 0.1, 0.1)
  const lightGray = rgb(0.9, 0.9, 0.9)

  // Header
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: primaryColor,
  })

  page.drawText('DONATION RECEIPT', {
    x: margin,
    y: height - 60,
    size: 28,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText('Gibuguem Yeongsujeung', {
    x: margin,
    y: height - 85,
    size: 12,
    font: helvetica,
    color: rgb(1, 1, 1),
  })

  // Receipt Number
  page.drawText(`Receipt No: ${data.receiptNumber}`, {
    x: width - margin - 180,
    y: height - 60,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1),
  })

  page.drawText(`Issue Date: ${new Date().toLocaleDateString('ko-KR')}`, {
    x: width - margin - 180,
    y: height - 75,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1),
  })

  // Body content
  let yPosition = height - 150

  // Donor Information Section
  page.drawText('Donor Information', {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: primaryColor,
  })

  yPosition -= 30

  // Info rows
  const drawInfoRow = (label: string, value: string, y: number) => {
    page.drawText(label, {
      x: margin,
      y: y,
      size: 11,
      font: helveticaBold,
      color: textColor,
    })
    page.drawText(value, {
      x: margin + 150,
      y: y,
      size: 11,
      font: helvetica,
      color: textColor,
    })
  }

  drawInfoRow('Donor Name:', data.donorName, yPosition)
  yPosition -= 25

  if (data.donorEmail) {
    drawInfoRow('Email:', data.donorEmail, yPosition)
    yPosition -= 25
  }

  yPosition -= 20

  // Donation Details Section
  page.drawText('Donation Details', {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: primaryColor,
  })

  yPosition -= 30

  // Amount box
  page.drawRectangle({
    x: margin,
    y: yPosition - 40,
    width: width - margin * 2,
    height: 60,
    color: lightGray,
    borderColor: primaryColor,
    borderWidth: 2,
  })

  page.drawText('Donation Amount', {
    x: margin + 20,
    y: yPosition - 5,
    size: 12,
    font: helvetica,
    color: textColor,
  })

  const formattedAmount = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(data.amount)

  page.drawText(formattedAmount, {
    x: margin + 20,
    y: yPosition - 30,
    size: 24,
    font: helveticaBold,
    color: primaryColor,
  })

  yPosition -= 80

  drawInfoRow('Donation Type:', data.donationType, yPosition)
  yPosition -= 25
  drawInfoRow('Donation Date:', data.donationDate.toLocaleDateString('ko-KR'), yPosition)
  yPosition -= 50

  // Organization Information Section
  page.drawText('Receiving Organization', {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: primaryColor,
  })

  yPosition -= 30

  drawInfoRow('Organization:', data.organizationName, yPosition)
  yPosition -= 25
  drawInfoRow('Registration No:', data.organizationRegistrationNumber, yPosition)
  yPosition -= 25
  drawInfoRow('Address:', data.organizationAddress, yPosition)
  yPosition -= 25
  drawInfoRow('Contact:', data.organizationContact, yPosition)
  yPosition -= 60

  // Certification text
  page.drawRectangle({
    x: margin,
    y: yPosition - 60,
    width: width - margin * 2,
    height: 80,
    color: lightGray,
  })

  const certText = 'This receipt certifies that the above donation has been received.'
  page.drawText(certText, {
    x: margin + 20,
    y: yPosition - 20,
    size: 11,
    font: helvetica,
    color: textColor,
  })

  const certText2 = 'This document may be used for tax deduction purposes in accordance'
  page.drawText(certText2, {
    x: margin + 20,
    y: yPosition - 35,
    size: 11,
    font: helvetica,
    color: textColor,
  })

  const certText3 = 'with applicable laws and regulations.'
  page.drawText(certText3, {
    x: margin + 20,
    y: yPosition - 50,
    size: 11,
    font: helvetica,
    color: textColor,
  })

  yPosition -= 100

  // Signature area
  page.drawText('Authorized Signature', {
    x: width - margin - 150,
    y: yPosition,
    size: 10,
    font: helvetica,
    color: textColor,
  })

  page.drawLine({
    start: { x: width - margin - 200, y: yPosition - 15 },
    end: { x: width - margin, y: yPosition - 15 },
    thickness: 1,
    color: textColor,
  })

  page.drawText(data.organizationName, {
    x: width - margin - 180,
    y: yPosition - 35,
    size: 10,
    font: helveticaBold,
    color: textColor,
  })

  // Footer
  page.drawLine({
    start: { x: margin, y: 60 },
    end: { x: width - margin, y: 60 },
    thickness: 1,
    color: lightGray,
  })

  page.drawText('Thank you for your generous support!', {
    x: width / 2 - 100,
    y: 40,
    size: 10,
    font: helvetica,
    color: textColor,
  })

  page.drawText(`Document ID: ${data.donationId}`, {
    x: margin,
    y: 25,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  })

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * 기부금 영수증 생성 (데이터 조회 포함)
 */
export async function createDonationReceipt(donationId: string) {
  // Note: This function should be called from a server action
  // that has access to prisma and environment variables
  const receiptNumber = generateReceiptNumber(donationId)

  return {
    receiptNumber,
    issueDate: new Date(),
  }
}
