/**
 * Gerador de QR Code
 * Este script gerencia a criação e download de QR Codes personalizados
 * 
 * @author Arthur Candian Rocha
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const qrContentInput = document.getElementById('qr-content');
    const qrSizeSelect = document.getElementById('qr-size');
    const qrColorInput = document.getElementById('qr-color');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrContainer = document.getElementById('qr-container');
    const notification = document.getElementById('notification');
    
    // Configuração inicial do QR Code
    let currentQRCode = null;
    
    // Adiciona event listeners
    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQRCode);
    qrContentInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });
    
    // Gera o QR Code ao carregar a página
    generateQRCode();
    
    /**
     * Gera um QR Code com base nos parâmetros selecionados pelo usuário
     */
    function generateQRCode() {
        // Limpa o container
        qrContainer.innerHTML = '';
        
        // Obtém os valores dos inputs
        const content = qrContentInput.value.trim();
        const size = parseInt(qrSizeSelect.value);
        const color = qrColorInput.value;
        
        // Valida o conteúdo
        if (!content) {
            showNotification('Por favor, insira algum conteúdo para o QR Code.', true);
            return;
        }
        
        try {
            // Cria uma instância do gerador de QR Code
            // TypeNumber (4-40) determina a capacidade e densidade do QR Code
            // ErrorCorrectionLevel (L, M, Q, H) determina a capacidade de correção de erros
            const qr = qrcode(size, 'M');
            qr.addData(content);
            qr.make();
            
            // Gera o HTML para o QR Code
            const qrCodeHtml = qr.createSvgTag({
                scalable: true,
                margin: 4,
                cellSize: 8,
                cellColor: color
            });
            
            // Adiciona o QR Code ao container
            qrContainer.innerHTML = qrCodeHtml;
            
            // Ajusta o QR Code para caber no container
            const svgElement = qrContainer.querySelector('svg');
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            
            // Armazena a referência ao SVG atual
            currentQRCode = svgElement;
            
            // Habilita o botão de download
            downloadBtn.disabled = false;
            
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            showNotification('Erro ao gerar o QR Code. Verifique os dados e tente novamente.', true);
        }
    }
    
    /**
     * Faz o download do QR Code como imagem PNG
     */
    function downloadQRCode() {
        if (!currentQRCode) {
            showNotification('Nenhum QR Code gerado para download.', true);
            return;
        }
        
        try {
            // Cria um canvas para converter o SVG em PNG
            const canvas = document.createElement('canvas');
            const svgSize = currentQRCode.getBoundingClientRect();
            
            // Define o tamanho do canvas (aumenta a resolução para melhor qualidade)
            canvas.width = svgSize.width * 2;
            canvas.height = svgSize.height * 2;
            
            const ctx = canvas.getContext('2d');
            ctx.scale(2, 2); // Escala para melhorar a qualidade
            
            // Converte o SVG em uma imagem
            const svgData = new XMLSerializer().serializeToString(currentQRCode);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Cria uma imagem a partir do SVG
            const img = new Image();
            
            img.onload = function() {
                // Desenha a imagem no canvas
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, svgSize.width, svgSize.height);
                URL.revokeObjectURL(svgUrl);
                
                // Converte o canvas para PNG
                canvas.toBlob(function(blob) {
                    // Cria um link para download
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(blob);
                    
                    // Define o nome do arquivo baseado no conteúdo do QR Code
                    let filename = 'qrcode_';
                    const content = qrContentInput.value.trim();
                    
                    // Se o conteúdo for uma URL, extrai o domínio para o nome do arquivo
                    if (content.startsWith('http')) {
                        try {
                            const url = new URL(content);
                            filename += url.hostname.replace(/\./g, '_');
                        } catch {
                            filename += 'url';
                        }
                    } else {
                        // Limita o tamanho para evitar nomes de arquivo muito longos
                        const contentForFilename = content.slice(0, 15).replace(/\W+/g, '_');
                        filename += contentForFilename || 'personalizado';
                    }
                    
                    downloadLink.download = `${filename}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    
                    // Mostra notificação de sucesso
                    showNotification('QR Code baixado com sucesso!');
                }, 'image/png', 1.0);
            };
            
            img.src = svgUrl;
            
        } catch (error) {
            console.error('Erro ao fazer download do QR Code:', error);
            showNotification('Erro ao fazer download do QR Code.', true);
        }
    }
    
    /**
     * Exibe uma notificação para o usuário
     * 
     * @param {string} message - A mensagem a ser exibida
     * @param {boolean} isError - Se é uma mensagem de erro (true) ou sucesso (false)
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
