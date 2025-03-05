const socketUrl = 'ws://localhost:8080'; // یا پورت جدید

function createWebSocket() {
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
        console.log('WebSocket connection opened');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error: ', error);
    };

    socket.onmessage = async (event) => {
        let data;
        if (event.data instanceof Blob) {
            data = await event.data.text();
        } else {
            data = event.data;
        }
        console.log('Message received from server: ', data);

        try {
            const { userName, message } = JSON.parse(data);
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerHTML = `<strong>${userName}</strong>: ${message} <button class="reply-btn">پاسخ</button>`;

            const messagesContainer = document.getElementById('messages');
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            const replyBtn = messageElement.querySelector('.reply-btn');
            replyBtn.addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                messageInput.value = `@${userName} `;
                messageInput.focus();
            });

            const admins = ['AdminName1', 'AdminName2']; // اسامی ادمین‌ها
            if (admins.includes(userName)) {
                messageElement.classList.add('admin');
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed, retrying...');
        setTimeout(createWebSocket, 1000); // مجدداً اتصال برقرار کن بعد از یک ثانیه
    };

    return socket;
}

document.addEventListener('DOMContentLoaded', () => {
    const socket = createWebSocket();

    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('click', () => {
        sendMessage(socket);
    });

    function sendMessage(socket) {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        const userName = 'UserName'; // این اسم از صفحه قبلی گرفته شود

        if (message === '') return;

        const badWords = ['کلمه1', 'کلمه2', 'کلمه3']; // کلمات بد برای فیلتر کردن
        const messagesContainer = document.getElementById('messages');

        if (badWords.some(word => message.includes(word))) {
            const botMessage = document.createElement('div');
            botMessage.classList.add('message');
            botMessage.textContent = `کاربر ${userName} به دلیل استفاده از کلمات بد، شما 30 دقیقه سکوت شدید.`;
            messagesContainer.appendChild(botMessage);
            messageInput.value = '';
            return;
        }

        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${userName}</strong>: ${message} <button class="reply-btn">پاسخ</button>`;

        messagesContainer.appendChild(messageElement);
        messageInput.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        const replyBtn = messageElement.querySelector('.reply-btn');
        replyBtn.addEventListener('click', () => {
            messageInput.value = `@${userName} `;
            messageInput.focus();
        });

        if (admins.includes(userName)) {
            messageElement.classList.add('admin');
        }

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ userName, message }));
        } else {
            console.error('WebSocket is not open: readyState is ' + socket.readyState);
        }
    }
});
