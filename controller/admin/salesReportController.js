const Order = require('../../model/orderModel');
const fs = require('fs');
const path = require('path');
const pdfMake = require('pdfmake/build/pdfmake');
const ExcelJS = require('exceljs');

// function to generate and render the sales report page
const salesReport = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        console.log(startDate, endDate);

        let matchQuery = {};

        // Define date range based on filter type
        if (filterType === 'daily') {
            matchQuery.createdAt = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
        } else if (filterType === 'weekly') {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            matchQuery.createdAt = { $gte: startOfWeek };
        } else if (filterType === 'monthly') {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            matchQuery.createdAt = { $gte: startOfMonth };
        } else if (filterType === 'custom' && startDate && endDate) {
            matchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const salesData = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    totalSales: { $sum: '$totalAmount' },
                    totalDiscount: { $sum: '$discount' },
                    totalCouponDiscount: { $sum: '$couponDiscount' },
                    orderCount: { $sum: 1 },
                    totalItemsSold: { $sum: { $sum: '$products.quantity' } } // Adjusted to sum quantities
                }
            },
            { $sort: { _id: -1 } } // Sort by date descending
        ]);

        // Calculate overall totals
        const overallTotals = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                    totalDiscount: { $sum: '$discount' },
                    totalCouponDiscount: { $sum: '$couponDiscount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // Get the first element for totals
        const totals = overallTotals.length > 0 ? overallTotals[0] : { totalSales: 0, totalDiscount: 0, totalCouponDiscount: 0, totalOrders: 0 };

        res.render('admin/sales', {
            salesReport: salesData,
            totalSales: totals.totalSales,
            totalOrders: totals.totalOrders,
            totalDiscount: totals.totalDiscount,
            currentPage: 1, // Adjust based on your pagination logic
            filterType,
            startDate,
            endDate,
            activePage: 'sales'
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};
// function to generate and download the sales report as a PDF
const downloadSalesReportPdf = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const salesReportData = await getSalesReportData(filterType, startDate, endDate);

        console.log('Sales Report Data:', salesReportData);

        const logoPath = path.join(__dirname, '../../', 'public', 'image', 'admin', 'WATCH.png');
        const imageBuffer = fs.readFileSync(logoPath);
        const logoBase64 = imageBuffer.toString('base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;

        const docDefinition = {
            content: [

                {
                    stack: [
                        { image: logoDataUrl, width: 100, margin: [0, 0, 0, 10] },
                        { text: 'watchly', style: 'siteName' },
                        { text: 'Email: watchlysupport@gmail.com', style: 'siteEmail' },
                        { text: 'Website: www.WATCHLY.com', style: 'siteUrl' }
                    ],
                    alignment: 'left',
                    margin: [0, 0, 0, 20]
                },
                {
                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 1, lineColor: '#D3D3D3' }],
                    margin: [0, 0, 0, 20]
                },
                { text: 'Sales Report', style: 'header' },
                { text: `Reporting Period: ${startDate} to ${endDate}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*', '*', '*'],
                        body: [
                            [
                                { text: 'Date', style: 'tableHeader' },
                                { text: 'Total Sales Revenue', style: 'tableHeader' },
                                { text: 'Discount Applied', style: 'tableHeader' },
                                { text: 'Net Sales', style: 'tableHeader' },
                                { text: 'Number of Orders', style: 'tableHeader' },
                                { text: 'Total Items Sold', style: 'tableHeader' }
                            ],
                            ...salesReportData.map(data => [
                                { text: data._id || 'N/A', style: 'tableCell' },
                                { text: `₹${data.totalSales || 0}`, style: 'tableCell' },
                                { text: `₹${data.totalDiscount || 0}`, style: 'tableCell' },
                                { text: `₹${(data.totalSales || 0) - (data.totalDiscount || 0)}`, style: 'tableCell' },
                                { text: data.orderCount?.toString() || '0', style: 'tableCell' },
                                { text: data.totalItemsSold?.toString() || '0', style: 'tableCell' }
                            ])
                        ]
                    },
                    layout: {
                        fillColor: function (rowIndex) { return rowIndex % 2 === 0 ? '#F3F3F3' : null; }
                    }
                },
                { text: 'For any inquiries, please contact us at support@myecommercesite.com or visit our website at www.myecommercesite.com.', style: 'contactInfo', margin: [0, 10, 0, 10] }
            ],
            styles: {
                header: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 10, 0, 20] },
                subheader: { fontSize: 12, alignment: 'center', margin: [0, 0, 0, 20] },
                tableHeader: { fontSize: 12, bold: true, color: 'black', fillColor: '#D3D3D3', alignment: 'center' },
                tableCell: { fontSize: 10, alignment: 'center', margin: [0, 5, 0, 5] },
                contactInfo: { fontSize: 8, alignment: 'center', color: 'grey', margin: [0, 10, 0, 0] },
                siteName: { fontSize: 12, bold: true, margin: [0, 0, 0, 2] },
                siteEmail: { fontSize: 10, margin: [0, 0, 0, 1] },
                siteUrl: { fontSize: 10, margin: [0, 0, 0, 5] }
            },
            footer: function (currentPage, pageCount) {
                return { columns: [{ text: `Page ${currentPage} of ${pageCount}`, alignment: 'left', fontSize: 8, margin: [10, 10, 0, 0] }] };
            }
        };

        const pdfDoc = pdfMake.createPdf(docDefinition);
        const filePath = path.join(__dirname, '../../output');

        pdfDoc.getBuffer((buffer) => {
            fs.writeFileSync(filePath, buffer);
            res.download(filePath, 'SalesReport.pdf', (err) => {
                if (err) { console.error('Download error:', err); }
                fs.unlinkSync(filePath);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Could not generate PDF');
    }
};
// function to generate and download the sales report as an Excel file
const downloadSalesReportExcel = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const salesReportData = await getSalesReportData(filterType, startDate, endDate);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');


        worksheet.mergeCells('A1:D2');
        worksheet.getCell('A1').value = 'WATCHLY';
        worksheet.getCell('A3').value = 'Email: watchlysupport@gmail.com';
        worksheet.getCell('A4').value = 'Website: www.WATCHLY.com';


        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A3').font = { size: 12 };
        worksheet.getCell('A4').font = { size: 12 };

        worksheet.mergeCells('A6:D6');
        worksheet.getCell('A6').value = 'Sales Report';
        worksheet.getCell('A6').font = { bold: true, size: 16 };
        worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.getCell('A7').value = '';

        worksheet.addRow(['Total Sales', 'Order Count', 'Total Discount', 'Coupon Discount']);
        worksheet.getRow(8).font = { bold: true };

        worksheet.columns = [
            { header: 'Total Sales', key: 'totalSales', width: 15 },
            { header: 'Order Count', key: 'orderCount', width: 15 },
            { header: 'Total Discount', key: 'totalDiscount', width: 20 },
            { header: 'Coupon Discount', key: 'totalCouponDiscount', width: 20 }
        ];

        salesReportData.forEach(data => {
            worksheet.addRow({
                totalSales: data.totalSales,
                orderCount: data.orderCount,
                totalDiscount: data.totalDiscount,
                totalCouponDiscount: data.totalCouponDiscount
            });
        });

        const filePath = path.join(__dirname, '../../output');

        await workbook.xlsx.writeFile(filePath);
        res.download(filePath, 'salesReport.xlsx', err => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Could not generate Excel file');
    }
};
// sales reporte by filter
const getSalesReportData = async (filterType, startDate, endDate) => {
    let matchQuery = {};

    // Define the date range based on filterType
    if (filterType === 'daily') {
        matchQuery.createdAt = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    } else if (filterType === 'weekly') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        matchQuery.createdAt = { $gte: startOfWeek };
    } else if (filterType === 'monthly') {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        matchQuery.createdAt = { $gte: startOfMonth };
    } else if (filterType === 'custom' && startDate && endDate) {
        matchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    return await Order.aggregate([
        { $match: matchQuery },
        { $unwind: "$products" },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalSales: { $sum: '$totalAmount' },
                totalDiscount: { $sum: '$discount' },
                totalCouponDiscount: { $sum: '$couponDiscount' },
                orderCount: { $sum: 1 },
                totalItemsSold: { $sum: '$products.quantity' }
            }
        },
        { $sort: { _id: -1 } }
    ]);

};

module.exports = {
    salesReport,
    downloadSalesReportPdf,
    downloadSalesReportExcel,
    getSalesReportData
};