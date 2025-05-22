document.addEventListener('DOMContentLoaded', function() {
    // Captura dos elementos do DOM
    const calcularBtn = document.getElementById('calcularBtn');
    const resetBtn = document.getElementById('resetBtn');
    const valorTotalImpostos = document.getElementById('valorTotalImpostos');
    const periodoTexto = document.getElementById('periodoTexto');
    const valorIR = document.getElementById('valorIR');
    const valorINSS = document.getElementById('valorINSS');
    const valorICMS = document.getElementById('valorICMS');
    const valorISS = document.getElementById('valorISS');
    const valorIPTU = document.getElementById('valorIPTU');
    const valorIPVA = document.getElementById('valorIPVA');
    const graficoImpostos = document.getElementById('graficoImpostos');

    // Alíquotas médias de impostos no Brasil (valores aproximados para fins educativos)
    const aliquotas = {
        icms: 0.18,    // 18% em média sobre produtos
        iss: 0.05,     // 5% em média sobre serviços
        iptu: 0.01,    // 1% ao ano sobre o valor do imóvel
        ipva: 0.04,    // 4% ao ano sobre o valor do veículo
    };

    // Event listeners
    calcularBtn.addEventListener('click', calcularImpostos);
    resetBtn.addEventListener('click', limparFormulario);
    
    // Para atualizar o valor do período de texto quando mudar o input
    document.getElementById('periodo').addEventListener('change', function() {
        periodoTexto.textContent = this.value;
    });

    function calcularImpostos() {
        // Obter valores do formulário
        const salario = parseFloat(document.getElementById('salario').value) || 0;
        const gastosProdutos = parseFloat(document.getElementById('gastosProdutos').value) || 0;
        const gastosServicos = parseFloat(document.getElementById('gastosServicos').value) || 0;
        const valorImoveis = parseFloat(document.getElementById('valorImoveis').value) || 0;
        const valorVeiculos = parseFloat(document.getElementById('valorVeiculos').value) || 0;
        const periodo = parseInt(document.getElementById('periodo').value) || 12;

        // Atualizar texto do período
        periodoTexto.textContent = periodo;

        // Calcular impostos
        const impostoIR = calcularImpostoRenda(salario) * periodo;
        const impostoINSS = calcularINSS(salario) * periodo;
        const impostoICMS = gastosProdutos * aliquotas.icms * periodo;
        const impostoISS = gastosServicos * aliquotas.iss * periodo;
        const impostoIPTU = valorImoveis * aliquotas.iptu * (periodo / 12); // IPTU é anual
        const impostoIPVA = valorVeiculos * aliquotas.ipva * (periodo / 12); // IPVA é anual

        // Calcular total
        const totalImpostos = impostoIR + impostoINSS + impostoICMS + impostoISS + impostoIPTU + impostoIPVA;

        // Atualizar resultados
        valorTotalImpostos.textContent = formatarValor(totalImpostos);
        valorIR.textContent = 'R$ ' + formatarValor(impostoIR);
        valorINSS.textContent = 'R$ ' + formatarValor(impostoINSS);
        valorICMS.textContent = 'R$ ' + formatarValor(impostoICMS);
        valorISS.textContent = 'R$ ' + formatarValor(impostoISS);
        valorIPTU.textContent = 'R$ ' + formatarValor(impostoIPTU);
        valorIPVA.textContent = 'R$ ' + formatarValor(impostoIPVA);

        // Gerar gráfico
        gerarGrafico([
            { nome: 'IR', valor: impostoIR },
            { nome: 'INSS', valor: impostoINSS },
            { nome: 'ICMS', valor: impostoICMS },
            { nome: 'ISS', valor: impostoISS },
            { nome: 'IPTU', valor: impostoIPTU },
            { nome: 'IPVA', valor: impostoIPVA }
        ]);
    }

    function calcularImpostoRenda(salario) {
        // Lógica simplificada de IR (valores aproximados de 2023)
        const salarioMensal = salario;
        let impostoRenda = 0;

        // Dedução simplificada do INSS para cálculo da base do IR
        const baseCalculo = salarioMensal - calcularINSS(salarioMensal);

        if (baseCalculo <= 2112.00) {
            impostoRenda = 0;
        } else if (baseCalculo <= 2826.65) {
            impostoRenda = (baseCalculo * 0.075) - 158.40;
        } else if (baseCalculo <= 3751.05) {
            impostoRenda = (baseCalculo * 0.15) - 370.40;
        } else if (baseCalculo <= 4664.68) {
            impostoRenda = (baseCalculo * 0.225) - 651.73;
        } else {
            impostoRenda = (baseCalculo * 0.275) - 884.96;
        }

        return Math.max(0, impostoRenda);
    }

    function calcularINSS(salario) {
        // Lógica simplificada de INSS (valores aproximados de 2023)
        const salarioMensal = salario;
        let inss = 0;

        if (salarioMensal <= 1320.00) {
            inss = salarioMensal * 0.075;
        } else if (salarioMensal <= 2571.29) {
            inss = 1320.00 * 0.075 + (salarioMensal - 1320.00) * 0.09;
        } else if (salarioMensal <= 3856.94) {
            inss = 1320.00 * 0.075 + (2571.29 - 1320.00) * 0.09 + (salarioMensal - 2571.29) * 0.12;
        } else if (salarioMensal <= 7507.49) {
            inss = 1320.00 * 0.075 + (2571.29 - 1320.00) * 0.09 + (3856.94 - 2571.29) * 0.12 + (salarioMensal - 3856.94) * 0.14;
        } else {
            // Teto do INSS
            inss = 877.24;
        }

        return inss;
    }

    function gerarGrafico(impostos) {
        // Limpar gráfico existente
        graficoImpostos.innerHTML = '';

        // Encontrar o valor máximo para escala
        const maxValor = Math.max(...impostos.map(imposto => imposto.valor));
        
        // Gerar barras do gráfico
        impostos.forEach(imposto => {
            if (imposto.valor > 0) {
                const altura = (imposto.valor / maxValor) * 100;
                const barra = document.createElement('div');
                barra.className = 'grafico-barra';
                barra.style.height = `${altura}%`;
                barra.setAttribute('data-valor', `R$${formatarValor(imposto.valor)}`);
                barra.setAttribute('data-nome', imposto.nome);
                graficoImpostos.appendChild(barra);
            }
        });
    }

    function formatarValor(valor) {
        return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function limparFormulario() {
        document.getElementById('salario').value = '';
        document.getElementById('gastosProdutos').value = '';
        document.getElementById('gastosServicos').value = '';
        document.getElementById('valorImoveis').value = '';
        document.getElementById('valorVeiculos').value = '';
        document.getElementById('periodo').value = '12';
        
        valorTotalImpostos.textContent = '0,00';
        periodoTexto.textContent = '12';
        valorIR.textContent = 'R$ 0,00';
        valorINSS.textContent = 'R$ 0,00';
        valorICMS.textContent = 'R$ 0,00';
        valorISS.textContent = 'R$ 0,00';
        valorIPTU.textContent = 'R$ 0,00';
        valorIPVA.textContent = 'R$ 0,00';
        
        graficoImpostos.innerHTML = '';
    }
});
