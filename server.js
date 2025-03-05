const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const badWords = ['کلمه1', 'کلمه2', 'کلمه3']; // کلمات بد برای فیلتر کردن
const admins = ['AdminName1', 'AdminName2']; // اسامی ادمین‌ها

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const { userName, message: userMessage } = JSON.parse(message);

        if (badWords.some(word => userMessage.includes(word))) {
            ws.send(JSON.stringify({
                userName: 'Bot',
                message: `کاربر ${userName} به دلیل استفاده از کلمات بد، شما 30 دقیقه سکوت شدید.`
            }));
            return;
        }

        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

console.log('Server is running on ws://localhost:8080');
