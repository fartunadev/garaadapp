import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  size?: string | null;
  color?: string | null;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(0, 95, 115); // Teal color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TanaShop', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE', pageWidth - 50, 20);
  doc.text(data.orderNumber, pageWidth - 50, 28);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', 20, 55);
  doc.text('Order Number:', 20, 62);
  
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(data.orderDate), 'MMM d, yyyy'), 70, 55);
  doc.text(data.orderNumber, 70, 62);
  
  // Billing/Shipping info
  let yPos = 80;
  
  if (data.shippingAddress) {
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    
    if (data.customerName) {
      doc.text(data.customerName, 20, yPos);
      yPos += 5;
    }
    doc.text(data.shippingAddress, 20, yPos);
    yPos += 5;
    
    if (data.shippingCity || data.shippingCountry) {
      doc.text(`${data.shippingCity || ''}${data.shippingCity && data.shippingCountry ? ', ' : ''}${data.shippingCountry || ''}`, 20, yPos);
      yPos += 5;
    }
    
    if (data.shippingPhone) {
      doc.text(`Phone: ${data.shippingPhone}`, 20, yPos);
      yPos += 5;
    }
  }
  
  // Items table
  yPos += 10;
  
  const tableData = data.items.map(item => [
    item.product_name + (item.size ? ` (${item.size})` : '') + (item.color ? ` - ${item.color}` : ''),
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${item.total.toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 95, 115],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    }
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const summaryX = pageWidth - 80;
  let summaryY = finalY;
  
  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(`$${data.subtotal.toFixed(2)}`, summaryX + 50, summaryY, { align: 'right' });
  summaryY += 7;
  
  if (data.shippingCost !== undefined) {
    doc.text('Shipping:', summaryX, summaryY);
    doc.text(data.shippingCost === 0 ? 'FREE' : `$${data.shippingCost.toFixed(2)}`, summaryX + 50, summaryY, { align: 'right' });
    summaryY += 7;
  }
  
  if (data.tax && data.tax > 0) {
    doc.text('Tax:', summaryX, summaryY);
    doc.text(`$${data.tax.toFixed(2)}`, summaryX + 50, summaryY, { align: 'right' });
    summaryY += 7;
  }
  
  if (data.discount && data.discount > 0) {
    doc.setTextColor(0, 150, 0);
    doc.text('Discount:', summaryX, summaryY);
    doc.text(`-$${data.discount.toFixed(2)}`, summaryX + 50, summaryY, { align: 'right' });
    summaryY += 7;
    doc.setTextColor(0, 0, 0);
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX, summaryY, summaryX + 50, summaryY);
  summaryY += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', summaryX, summaryY);
  doc.text(`$${data.total.toFixed(2)}`, summaryX + 50, summaryY, { align: 'right' });
  
  // Payment info
  summaryY += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  if (data.paymentMethod) {
    doc.text(`Payment Method: ${data.paymentMethod}`, 20, summaryY);
  }
  
  if (data.paymentStatus) {
    doc.text(`Payment Status: ${data.paymentStatus}`, 20, summaryY + 5);
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for shopping with TanaShop!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('For questions, contact support@tanashop.com', pageWidth / 2, footerY + 5, { align: 'center' });
  
  // Download
  doc.save(`Invoice-${data.orderNumber}.pdf`);
};
