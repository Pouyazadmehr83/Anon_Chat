const room = "{{ room_id }}"; // room_id از فریم‌ورک شما در سرور ارسال می‌شود
const socket = io();

// اتصال به روم
socket.emit('join', { room: room });

// دریافت پیام‌ها
socket.on('message', (data) => {
    const chat = document.getElementById('chat');
    const userType = data.user === "{{ username }}" ? 'user' : 'other';  // تشخیص اینکه پیام از کاربر خود یا دیگران است

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${userType}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.textContent = data.user[0].toUpperCase();  // نمایش حرف اول نام کاربر به عنوان آواتار

    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.textContent = data.message;  // پیام دریافتی

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString();  // نمایش زمان پیام

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(messageBox);
    messageDiv.appendChild(messageTime);

    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight; // اسکرول به پایین
});

// ارسال پیام
function sendMessage() {
    const input = document.getElementById('message');
    const message = input.value.trim();
    if (message) {
        socket.emit('message', { room: room, message: message });
        input.value = ''; // پاک کردن فیلد
    }
}

// ارسال تصویر
function sendImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            socket.emit('image', { room: room, image: reader.result });
        };
        reader.readAsDataURL(file);
    }
}

// ارسال ایموجی
function addEmoji(emoji) {
    const messageField = document.getElementById('message');
    messageField.value += emoji;
    toggleEmojiPicker(); // بستن پنجره ایموجی
}

// نمایش یا مخفی کردن پنجره ایموجی
function toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emoji-picker');
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
}

// حذف پیام
function deleteMessage(messageId) {
    fetch('/delete_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message_id: messageId }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.status === 'success') {
            document.getElementById(`message-${messageId}`).remove();
        } else {
            alert('Error deleting message');
        }
    });
}

// پاسخ به پیام
function replyMessage(messageId) {
    const replyText = prompt('Enter your reply:');
    if (replyText) {
        socket.emit('send_message', { message: replyText, reply_to: messageId });
    }
}

// وقتی پیام جدید دریافت شد
socket.on('new_message', (data) => {
    const chatDiv = document.getElementById('chat');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message position-relative';
    messageDiv.id = `message-${data.message_id}`;
    messageDiv.innerHTML = `
        <p onclick="showOptions('${data.message_id}')">${data.reply_to ? `Reply to ${data.reply_to}: ` : ''}${data.message}</p>
        <div id="options-${data.message_id}" class="message-options" style="display: none;">
            <button class="btn btn-primary btn-sm" onclick="replyMessage('${data.message_id}')">Reply</button>
        </div>
    `;
    chatDiv.appendChild(messageDiv);
});

// نمایش گزینه‌ها برای پاسخ
function showOptions(messageId) {
    // پنهان کردن تمام منوهای دیگر
    document.querySelectorAll('.message-options').forEach(option => {
        option.style.display = 'none';
    });

    // نمایش منوی مربوط به پیام کلیک‌شده
    const optionsDiv = document.getElementById(`options-${messageId}`);
    if (optionsDiv) {
        optionsDiv.style.display = 'block';
    }
}

document.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.closest('.message-options') && !target.closest('.message')) {
        document.querySelectorAll('.message-options').forEach(option => {
            option.style.display = 'none';
        });
    }
});
