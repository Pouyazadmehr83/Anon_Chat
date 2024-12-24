from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_socketio import SocketIO, join_room, leave_room, send,rooms,emit
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

user_map = {}  # نگهداری اطلاعات کاربران آنلاین
room_passwords = {}  # نگهداری رمزهای اتاق‌های رمزدار
messages = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create_room', methods=['POST'])
def create_room():
    room_id = secrets.token_hex(4)
    return jsonify({"room_id": room_id})

@app.route('/create_private_room', methods=['POST'])
def create_private_room():
    data = request.get_json()
    password = data.get('password')
    room_id = secrets.token_hex(4)
    room_passwords[room_id] = password  # ذخیره رمز
    return jsonify({"room_id": room_id})

@app.route('/chat/<room_id>', methods=['GET', 'POST'])
def chat(room_id):
    # بررسی رمز عبور
    if room_id in room_passwords:
        if request.method == 'POST':
            entered_password = request.form['password']
            if entered_password != room_passwords[room_id]:
                return "رمز عبور اشتباه است. لطفا دوباره تلاش کنید.", 403
        return render_template('chat.html', room_id=room_id)
    else:
        return render_template('chat.html', room_id=room_id)
    

@app.route('/delete_message', methods=['POST'])
def delete_message():
    message_id = request.json.get('message_id')
    if message_id in messages:
        del messages[message_id]
        emit('message_deleted', {'message_id': message_id}, broadcast=True)
        return jsonify({'status': 'success'})
    return jsonify({'status': 'error', 'message': 'Message not found'}), 404

@socketio.on('send_message')
def handle_message(data):
    message_id = str(len(messages) + 1)  # ساخت ID برای هر پیام
    messages[message_id] = data['message']
    emit('new_message', {'message_id': message_id, 'message': data['message'], 'reply_to': data.get('reply_to')}, broadcast=True)

@socketio.on('join')
def handle_join(data):
    room = data['room']
    user_id = secrets.token_hex(1).upper()[:1]
    user_map[request.sid] = user_id
    join_room(room)
    send({'type': 'notification', 'message': f"کاربر {user_id} وارد شد."}, to=room)

@socketio.on('leave')
def handle_leave(data):
    room = data['room']
    user_id = user_map.pop(request.sid, "ناشناس")
    leave_room(room)
    send({'type': 'notification', 'message': f"کاربر {user_id} خارج شد."}, to=room)

@socketio.on('message')
def handle_message(data):
    room = data['room']
    message = data['message']
    user_id = user_map.get(request.sid, "ناشناس")
    send({'type': 'message', 'user': user_id, 'message': message}, to=room)

@socketio.on('disconnect')
def handle_disconnect():
    user_id = user_map.pop(request.sid, "ناشناس")
    for room in rooms(request.sid):
        leave_room(room)
        send({'type': 'notification', 'message': f"کاربر {user_id} خارج شد."}, to=room)


if __name__ == '__main__':
    socketio.run(app, debug=True)
