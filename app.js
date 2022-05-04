// Подключаем библиотеку для работы с WebSocket
const WebSocket = require('ws');
// Создаём подключение к WS
let wsServer = new WebSocket.Server({
    port: 3001
});
// Создаём массив для хранения всех подключенных пользователей
let users = []

// Создаем переменную для id
let msgId = 0

// Указываем максимальное количество сообщений в чате
const MAX_CHAT_MSG = 10

// Указываем максимальную длину сообщения в чате
const MAX_MSG_LENGTH = 250

// Массив с объектами сообщений
let msgArray = []

// Удаляемое сообщение
let deleteMsgObj
// Редактируемое сообщение
let editMsgObj


// Функция отправки сообщений пользователям
function sendMessage({msgObj, users, user, lastMsg}) {
    let msgObjSended = {id: msgObj.id, message: msgObj.message, status: msgObj.status}
    let message = JSON.stringify(msgObjSended);
    let messageCurrentUserObj = {...msgObjSended};
    messageCurrentUserObj.currentUserMsg = true
    let messageCurrentUser = JSON.stringify(messageCurrentUserObj);
    // Перебираем всех подключенных клиентов
    for (let u of users) {
        // Юзер,  которому принадлежит сообщение получает месседж с меткой
        if (u === user) {
            u.connection.send(messageCurrentUser)
        } else {
            // Другие юзеры получают сообщение без метки
            u.connection.send(message)
        }
        if (lastMsg) {
            u.connection.send(lastMsg)
        }
    }
}


// Проверяем подключение
wsServer.on('connection', function (ws) {
    let user = {
        connection: ws
    }
    // Добавляем нового пользователя ко всем остальным
    users.push(user)

    //Загружаем пользователю существующую историю сообщений
    let sendHistoryMessage = JSON.stringify(
        msgArray.map(msg => {
           let customMessage = {
               message:  msg.message,
               status:  'newMsg',
               id:  msg.id
           }
           return customMessage
    }));
    user.connection.send(sendHistoryMessage)

    // Подписываемся на получение сообщений от клиента
    ws.on('message', function (message) {
        let msgObj = JSON.parse(message)

        msgObj.message = msgObj.message.substr(0, MAX_MSG_LENGTH)

        let lastMsg
        // Проверка,  если приходит новое сообщение
        if (msgObj.status === 'newMsg') {
            // Сохраняем в объект сообщений юзера
            msgObj.user = user;
            // Присваиваем новому сообщению id
            msgObj.id = (++msgId) + ''
            // Удаляем последнее сообщение, если количество сообщений в чате достигло максимума
            if (msgArray.length === MAX_CHAT_MSG) {
                let lastMsgObj = msgArray.shift()
                lastMsgObj.message = null
                lastMsg = JSON.stringify(lastMsgObj);
            }
            // Добавить в массив сообщений новый месседж
            msgArray.push(msgObj)

            sendMessage({msgObj, users, user, lastMsg})
            // Проверка,  если удаляем существующее сообщение
        } else if (msgObj.message == null) {
            deleteMsgObj = msgArray.find(element => element.id === msgObj.id)
            if (deleteMsgObj.user === user) {
                msgArray.splice(msgArray.indexOf(deleteMsgObj), 1)
                sendMessage({msgObj, users, user})
            }
            // Проверка,  если редактируем существующее сообщение
        } else {
            editMsgObj = msgArray.find(element => element.id === msgObj.id)
            if (editMsgObj.user === user) {
                msgArray[msgArray.indexOf(editMsgObj)].message = msgObj.message
                sendMessage({msgObj, users, user})
            }
        }

    })
    // Делаем действие при выходе пользователя из чата
    ws.on('close', function () {
            // Получаем ID этого пользователя
            let id = users.indexOf(user)
            // Убираем этого пользователя
            users.splice(id, 1)
        },
        ws.on('error', function () {
            // Получаем ID этого пользователя
            let id = users.indexOf(user)
            // Убираем этого пользователя
            users.splice(id, 1)
        })
    )
})