let currentVoucher = null;

function getCurrentSlipNo() {
    return currentVoucher ? currentVoucher.slipNo : Date.now();
}

document.addEventListener('DOMContentLoaded', function() {
    // Get the slip parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const slipNo = urlParams.get('slip');
    
    if (!slipNo) {
        document.getElementById('voucher-content').innerHTML = `
            <div class="alert alert-danger">
                <h4>Error</h4>
                <p>No voucher slip number provided in the URL.</p>
                <p>Please use a valid link like: /dvprntview.html?slip=1756281913650</p>
            </div>
        `;
        return;
    }
    
    // Load the voucher data
    loadVoucherForPrint(slipNo);
});

function loadVoucherForPrint(slipNo) {
    db.collection("dr.vouchers")
        .where("slipNo", "==", parseInt(slipNo))
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                document.getElementById('voucher-content').innerHTML = `
                    <div class="alert alert-warning">
                        <h4>Voucher Not Found</h4>
                        <p>No voucher found with slip number: ${slipNo}</p>
                    </div>
                `;
                return;
            }
            
            const doc = querySnapshot.docs[0];
            const voucher = doc.data();
            displayVoucher(voucher);
        })
        .catch((error) => {
            console.error("Error getting document:", error);
            document.getElementById('voucher-content').innerHTML = `
                <div class="alert alert-danger">
                    <h4>Error Loading Voucher</h4>
                    <p>${error.message}</p>
                </div>
            `;
        });
}


async function displayVoucher(voucher) {
    // Store voucher data globally for filename generation
    currentVoucher = voucher;
    const date = voucher.entryDate.toDate().toLocaleString();
    
    // Generate QR code for this voucher - FIXED: Use absolute URL
    const voucherUrl = `${window.location.origin}/dv/dvprntview.html?slip=${voucher.slipNo}`;
    let qrCodeHTML = '';
    
    // Check if QRCode library is available
    if (typeof QRCode === 'undefined') {
        console.warn('QRCode library not loaded, using fallback');
        qrCodeHTML = `
            <div style="text-align: center; padding: 10px; border: 1px solid #ddd; width: 110px; height: 110px;">
                <p style="font-size: 9px; color: #666; margin: 0; line-height: 1.2;">Scan Code<br>Not Available</p>
            </div>
        `;
    } else {
        try {
            // Create a temporary container for QR code generation
            const qrContainer = document.createElement('div');
            qrContainer.style.position = 'absolute';
            qrContainer.style.left = '-9999px'; // Hide offscreen instead of display:none
            document.body.appendChild(qrContainer);
            
            // FIXED: Simplified QR code generation with proper error level
            const qrCode = new QRCode(qrContainer, {
                text: voucherUrl,
                width: 110,
                height: 110,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M // Changed from H to M for better compatibility
            });
            
            // Wait a moment for QR code to generate
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Get the generated QR code canvas
            const qrCanvas = qrContainer.querySelector('canvas');
            const qrImg = qrContainer.querySelector('img');
            
            if (qrCanvas) {
                // Convert canvas to data URL
                const qrDataUrl = qrCanvas.toDataURL('image/png');
                qrCodeHTML = `
                    <img src="${qrDataUrl}" alt="Voucher QR Code" style="border: 1px solid #ddd; padding: 3px; width: 110px; height: 110px;">
                    <p style="margin-top: 2px; font-size: 10px; color: #666; text-align: center;">Scan to verify</p>
                `;
            } else if (qrImg) {
                // If img element was created instead of canvas
                qrCodeHTML = `
                    <img src="${qrImg.src}" alt="Voucher QR Code" style="border: 1px solid #ddd; padding: 3px; width: 110px; height: 110px;">
                    <p style="margin-top: 2px; font-size: 10px; color: #666; text-align: center;">Scan to verify</p>
                `;
            } else {
                throw new Error('QR code element not generated');
            }
            
            // Clean up
            document.body.removeChild(qrContainer);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrCodeHTML = `
                <div style="text-align: center; padding: 10px; border: 1px solid #ddd; width: 110px; height: 110px;">
                    <p style="font-size: 9px; color: #666; margin: 0; line-height: 1.2;">QR Code<br>Generation<br>Failed</p>
                    <p style="font-size: 8px; color: #999; margin-top: 5px;">URL: ${voucherUrl.substring(0, 30)}...</p>
                </div>
            `;
        }
    }
    
    // Calculate denominations (rest of the function remains the same)
    const denominations = [
        { value: 5000, count: voucher.deno5000 || 0 },
        { value: 1000, count: voucher.deno1000 || 0 },
        { value: 500, count: voucher.deno500 || 0 },
        { value: 100, count: voucher.deno100 || 0 },
        { value: 50, count: voucher.deno50 || 0 },
        { value: 20, count: voucher.deno20 || 0 },
        { value: 10, count: voucher.deno10 || 0 },
        { value: 1, count: voucher.deno1 || 0 }
    ];
    
    let totalCash = 0;
    let denominationsHTML = '';
    
    denominations.forEach(deno => {
        if (deno.count > 0) {
            const amount = deno.count * deno.value;
            totalCash += amount;
            
            denominationsHTML += `
                <tr>
                    <td>${deno.value}</td>
                    <td>${deno.count}</td>
                    <td>${amount.toLocaleString()}</td>
                </tr>
            `;
        }
    });
    
    // Create voucher HTML (rest remains the same)
    const voucherHTML = `
        <div class="receipt-container" id="voucher-to-capture">
            <div class="receipt-header">
                <img class="Logo" src="/image/ARY_Digital_Logo_2.png" alt="ARY Digital Logo">
                <div>
                    <h3>OFFICIAL DEBIT VOUCHER</h3>
                </div>
                <div class="qr-container">
                    ${qrCodeHTML}
                </div>                            
            </div>
            <div class="receipt-details">
                <div class="row">
                    <div class="topHead">
                        <strong>Paid To:</strong><h1><u>${voucher.pointPerson}</u></h1>
                        <strong>Head:</strong><h1><u>${voucher.paymentHead || 'N/A'}</u></h1>
                    </div>
                    <div class="col-6 mt-4">
                        <p><strong>V No:</strong> ${voucher.slipNo}</p>
                        <p><strong>Payment From:</strong> ${voucher.paymentFrom}</p>
                        <p><strong>Payment Mode:</strong> ${voucher.paymentMode}</p>
                    </div>
                    <div class="col-6 mt-4">
                        <p><strong>Cell:</strong> ${voucher.cellNo}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Payment Status:</strong> ${voucher.paymentStatus}</p>
                    </div>
                </div>
                
                <p><strong>Narration:</strong></p>
                <textarea readonly>${voucher.remarks || 'N/A'}</textarea>

                <h5 class="mt-4">Denomination Breakdown</h5>
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Denomination</th>
                            <th>Count</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${denominationsHTML}
                    </tbody>
                    <tfoot>
                        <tr class="table-primary">
                            <th colspan="2">Total Cash</th>
                            <th>${totalCash.toLocaleString()}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="receipt-footer">
                <p class="mb-0">Generated by ORSYS-ARY DV System</p>
            </div>
            <hr>
            <div class="centered-list">
                <ul>
                    <li>Prepared By: ${voucher.user.charAt(0).toUpperCase() + voucher.user.slice(1).toLowerCase()}</li>
                    <li>Verified By: Qasim</li>
                    <li>Reviewed By: Mohiuddin</li>
                    <li>Received By: ${voucher.pointPerson.charAt(0).toUpperCase() + voucher.pointPerson.slice(1).toLowerCase()}</li>
                </ul>
            </div>
        </div>
    `;
    
    document.getElementById('voucher-content').innerHTML = voucherHTML;
}

// ADDED: Helper function to test QR code URL
function testQRUrl() {
    if (currentVoucher) {
        const testUrl = `${window.location.origin}/dv/dvprntview.html?slip=${currentVoucher.slipNo}`;
        console.log('Testing QR URL:', testUrl);
        window.open(testUrl, '_blank');
    }
}


async function shareAsImage() {
    const element = document.getElementById('voucher-to-capture');
    if (!element) {
        alert('Voucher not loaded yet. Please wait...');
        return;
    }

    try {
        // Show loading
        const shareBtn = event.target;
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
        shareBtn.disabled = true;

        // Set A4 dimensions on the element first (210mm x 297mm)
        element.style.width = '210mm';
        element.style.height = '297mm';

        // Generate canvas from the voucher
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: element.offsetWidth,
            height: element.offsetHeight
        });

        // Convert to blob
        canvas.toBlob(async (blob) => {
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'voucher.png', { type: 'image/png' })] })) {
                // Use native sharing if available
                const file = new File([blob], `debit_voucher_${getCurrentSlipNo()}.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        title: 'ORSYS-ARY Debit Voucher',
                        text: `Debit Voucher #${currentVoucher.slipNo} from ORSYS-ARY System`,
                        files: [file]
                    });
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Error sharing:', error);
                        fallbackDownload(blob);
                    }
                }
            } else {
                // Fallback to download
                fallbackDownload(blob);
            }

            // Restore button
            shareBtn.innerHTML = originalText;
            shareBtn.disabled = false;
        }, 'image/png', 0.9);

    } catch (error) {
        console.error('Error generating image:', error);
        alert('Error generating image. Please try again.');
        
        // Restore button
        shareBtn.innerHTML = originalText;
        shareBtn.disabled = false;
    }
}

async function downloadImage() {
    const element = document.getElementById('voucher-to-capture');
    if (!element) {
        alert('Voucher not loaded yet. Please wait...');
        return;
    }

    try {
        // Show loading
        const downloadBtn = event.target;
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
        downloadBtn.disabled = true;

        // Set A4 dimensions on the element first (210mm x 297mm)
        element.style.width = '210mm';
        element.style.height = '297mm';

        // Generate canvas from the voucher
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: element.offsetWidth,
            height: element.offsetHeight
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `debit_voucher_${getCurrentSlipNo()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Restore button
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }, 'image/png', 0.9);

    } catch (error) {
        console.error('Error generating image:', error);
        alert('Error generating image. Please try again.');
        
        // Restore button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
}

async function downloadPDF() {
    const element = document.getElementById('voucher-to-capture');
    if (!element) {
        alert('Voucher not loaded yet. Please wait...');
        return;
    }

    try {
        // Show loading
        const downloadBtn = event.target;
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
        downloadBtn.disabled = true;

        // Generate QR code for PDF (ensure it's included)
        const voucherUrl = `${window.location.origin}/dv/dvprntview.html?slip=${getCurrentSlipNo()}`;
        let qrDataUrl = '';
        
        try {
            const qrCanvas = document.createElement('canvas');
            await QRCode.toCanvas(qrCanvas, voucherUrl, {
                width: 80,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            qrDataUrl = qrCanvas.toDataURL('image/png');
        } catch (error) {
            console.error('QR code generation failed:', error);
        }

        // Store original styles to restore later
        const originalStyles = {
            width: element.style.width,
            height: element.style.height,
            overflow: element.style.overflow
        };

        // Set A4 dimensions temporarily
        element.style.width = '185mm';
        element.style.height = 'auto';
        element.style.overflow = 'hidden';

        // Use html2pdf for better HTML to PDF conversion
        const opt = {
            margin: 10,
            filename: `debit_voucher_${getCurrentSlipNo()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate and download PDF
        await html2pdf().from(element).set(opt).save();

        // Restore original styles
        element.style.width = originalStyles.width;
        element.style.height = originalStyles.height;
        element.style.overflow = originalStyles.overflow;

        // Restore button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        
        // Restore button
        if (downloadBtn) {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    }
}

function fallbackDownload(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debit_voucher_${getCurrentSlipNo()}.png`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show instructions for WhatsApp
    alert('Image downloaded! You can now open WhatsApp and attach this image to share it.');
}

// Demo voucher data for testing (remove this in production)
function loadDemoVoucher() {
    const demoVoucher = {
        slipNo: 1756281913650,
        paymentFrom: "John Doe",
        pointPerson: "Jane Smith",
        paymentMode: "Cash",
        cellNo: "Cell-A",
        entryDate: { toDate: () => new Date() },
        paymentStatus: "Completed",
        user: "admin",
        remarks: "Monthly office expenses payment",
        paymentHead: "Office Expenses",
        deno5000: 2,
        deno1000: 5,
        deno500: 3,
        deno100: 10,
        deno50: 4,
        deno20: 5,
        deno10: 3,
        deno1: 7
    };
    displayVoucher(demoVoucher);
}

// Auto-load demo if no slip parameter (for testing)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const slipNo = urlParams.get('slip');
    
    if (!slipNo) {
        // Load demo voucher for testing
        setTimeout(() => {
            loadDemoVoucher();
        }, 1000);
    } else {
        // Load actual voucher data
        loadVoucherForPrint(slipNo);
    }
});