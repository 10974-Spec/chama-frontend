import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateInvoicePDF = async (transaction: any, user: any) => {
    try {
        const chamaName = transaction.chamaId?.name || 'Chama Sacco';
        const amount = transaction.amount;
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const refId = transaction.referenceId || 'N/A';
        const userName = user?.name || 'Member';

        const html = `
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
                body { font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; padding: 40px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #2A5C3F; padding-bottom: 20px; margin-bottom: 40px; }
                .logo { font-size: 32px; font-weight: bold; color: #2A5C3F; letter-spacing: 2px; }
                .title { font-size: 24px; margin-top: 10px; color: #555; }
                .details { margin-bottom: 40px; line-height: 1.6; }
                .details strong { color: #222; }
                .table-cont { background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
                table { width: 100%; border-collapse: collapse; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
                th { color: #888; text-transform: uppercase; font-size: 12px; }
                td { font-size: 16px; font-weight: 500; }
                .total { text-align: right; font-size: 24px; font-weight: bold; color: #2A5C3F; margin-top: 20px; }
                .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">CHAMA</div>
                <div class="title">Official Receipt</div>
            </div>
            
            <div class="details">
                <p><strong>Member Name:</strong> ${userName}</p>
                <p><strong>Chama Group:</strong> ${chamaName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Receipt Number:</strong> ${refId}</p>
            </div>

            <div class="table-cont">
                <table>
                    <tr>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Amount</th>
                    </tr>
                    <tr>
                        <td>Weekly Contribution</td>
                        <td style="color: #2A5C3F;">Paid</td>
                        <td>Ksh ${amount}</td>
                    </tr>
                </table>
            </div>

            <div class="total">Total: Ksh ${amount}</div>

            <div class="footer">
                Thank you for your contribution. Keep saving and growing with us!
                <br />Generated securely via Chama App.
            </div>
        </body>
        </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        console.log('File has been saved to:', uri);
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error("Error generating invoice:", error);
        alert("Failed to generate or download the invoice.");
    }
};
