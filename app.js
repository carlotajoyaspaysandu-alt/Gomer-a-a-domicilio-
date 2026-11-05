// URL de tu función Serverless (reemplázala cuando la despliegues en Vercel)
const BACKEND_URL = 'https://tu-backend-en-vercel.vercel.app/api/chat';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Array para mantener el historial de conversación localmente
let conversationHistory = [];

function appendMessage(text, sender, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    if (isLoading) messageDiv.classList.add('loading');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Mostrar mensaje del usuario
    appendMessage(text, 'user');
    userInput.value = '';

    // Bloquear input mientras responde la IA
    userInput.disabled = true;
    sendBtn.disabled = true;

    // 2. Mostrar indicador de carga
    const loadingMessageDiv = appendMessage('Escribiendo...', 'bot', true);

    try {
        // 3. Petición a tu Serverless Backend
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mensaje: text,
                historial: conversationHistory
            })
        });

        const data = await response.json();

        // 4. Actualizar mensaje con la respuesta de la IA
        if (response.ok && data.respuesta) {
            loadingMessageDiv.textContent = data.respuesta;
            loadingMessageDiv.classList.remove('loading');

            // Guardar contexto en la memoria de la sesión
            conversationHistory.push({ role: 'user', content: text });
            conversationHistory.push({ role: 'assistant', content: data.respuesta });
        } else {
            throw new Error(data.error || 'Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('Error:', error);
        loadingMessageDiv.textContent = 'Ocurrió un error al conectar con la IA. Intenta nuevamente.';
        loadingMessageDiv.classList.remove('loading');
    } finally {
        // Desbloquear input
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});
