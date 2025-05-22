/**
 * Gerador de PDF
 * Este script gerencia a criação e personalização de documentos PDF
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const documentTitle = document.getElementById('documentTitle');
    const documentContent = document.getElementById('documentContent');
    const pageSize = document.getElementById('pageSize');
    const orientation = document.getElementById('orientation');
    const fileName = document.getElementById('fileName');
    const includeDate = document.getElementById('includeDate');
    const notification = document.getElementById('notification');
    
    // Preview elements
    const previewTitle = document.getElementById('previewTitle');
    const previewDate = document.getElementById('previewDate');
    const previewContent = document.getElementById('previewContent');
    
    // Update preview when input values change
    documentTitle.addEventListener('input', updatePreview);
    documentContent.addEventListener('input', updatePreview);
    includeDate.addEventListener('change', updatePreview);
    
    // Initialize preview
    updatePreview();
    
    // Add event listener for PDF generation
    generatePdfBtn.addEventListener('click', generatePDF);
    
    /**
     * Updates the real-time preview based on user inputs
     */
    function updatePreview() {
        // Update title
        previewTitle.textContent = documentTitle.value;
        
        // Update content (supporting simple HTML)
        previewContent.innerHTML = documentContent.value.replace(/\n/g, '<br>');
        
        // Update date visibility
        if (includeDate.checked) {
            const today = new Date();
            const formattedDate = today.toLocaleDateString();
            previewDate.querySelector('span').textContent = formattedDate;
            previewDate.style.display = 'block';
        } else {
            previewDate.style.display = 'none';
        }
    }
    
    /**
     * Generates a PDF based on user selections
     */
    async function generatePDF() {
        try {
            // Show generating state
            generatePdfBtn.disabled = true;
            generatePdfBtn.textContent = 'Gerando PDF...';
            
            // Get the content to be converted to PDF
            const contentPreview = document.getElementById('contentPreview');
            
            // Use html2canvas to capture the content as an image
            const canvas = await html2canvas(contentPreview, {
                scale: 2, // Increases the resolution of the capture
                useCORS: true, // Necessary if there are images from other origins
                logging: false // Disable console logs
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Create PDF with the selected options
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: orientation.value, // p for portrait, l for landscape
                unit: 'mm',
                format: pageSize.value
            });
            
            // Calculate dimensions to maintain aspect ratio
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // Add the image to the PDF (potentially across multiple pages)
            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // First page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
            
            // Additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }
            
            // Save the PDF with the custom filename
            const outputFileName = `${fileName.value.trim() || 'documento'}.pdf`;
            pdf.save(outputFileName);
            
            // Show success notification
            showNotification('PDF gerado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            showNotification('Erro ao gerar o PDF. Tente novamente.', true);
        } finally {
            // Reset button state
            generatePdfBtn.disabled = false;
            generatePdfBtn.textContent = 'Gerar PDF';
        }
    }
    
    /**
     * Displays a notification message to the user
     * @param {string} message - The message to display
     * @param {boolean} isError - Whether this is an error message
     */
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = 'notification';
        
        if (isError) {
            notification.classList.add('error');
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
