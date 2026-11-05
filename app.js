const BACKEND_URL = 'https://gomer-a-a-domicilio-6igb.vercel.app/api/chat';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

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

    appendMessage(text, 'user');
    userInput.value = '';

    userInput.disabled = true;
    sendBtn.disabled = true;

    const loadingMessageDiv = appendMessage('Escribiendo...', 'bot', true);

    try {
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

        if (response.ok && data.respuesta) {
            loadingMessageDiv.textContent = data.respuesta;
            loadingMessageDiv.classList.remove('loading');

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
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});
