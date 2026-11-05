document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('input[name="service"]');
    const totalAmount = document.getElementById('total-amount');
    const btnWhatsApp = document.getElementById('btn-whatsapp');

    const PHONE_NUMBER = "59896643887"; // Número para WhatsApp (formato internacional sin +)

    function updateTotal() {
        let total = 0;
        checkboxes.forEach(cb => {
            if (cb.checked) {
                total += parseInt(cb.value);
            }
        });
        totalAmount.textContent = `$${total}`;
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateTotal);
    });

    btnWhatsApp.addEventListener('click', () => {
        const selectedServices = [];
        let total = 0;

        checkboxes.forEach(cb => {
            if (cb.checked) {
                selectedServices.push(cb.getAttribute('data-name'));
                total += parseInt(cb.value);
            }
        });

        let text = "";
        if (selectedServices.length === 0) {
            text = "¡Hola! Quisiera realizar una consulta sobre los servicios de gomería a domicilio.";
        } else {
            text = `¡Hola! Necesito solicitar los siguientes servicios a domicilio:\n- ${selectedServices.join('\n- ')}\n\nTotal estimado: $${total}\n\n¿Tienen disponibilidad ahora?`;
        }

        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
    });
});
