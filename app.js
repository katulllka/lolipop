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
let maxChatMsg = 10

// Массив с объектами сообщений
let msgArray = []

//
let deleteMsgObj
let editMsgObj



//Создаем функцию для генерации msgId
function getMsgId() {
    msgId += 1
    return String(msgId)
}

// Проверяем подключение
wsServer.on('connection', function (ws) {
    let user = {
        connection: ws
    }
    // Добавляем нового пользователя ко всем остальным
    users.push(user)
    // Получаем сообщение от клиента
    ws.on('message', function (message) {
        // Парсим полученный message json в объект
        let msgObj = JSON.parse(message)
        let lastMsg

        // Проверка,  если приходит новое сообщение
        if (msgObj.id == null) {
            // Присваиваем новому сообщению id
            msgObj.id = getMsgId()
            // Удаляем последнее сообщение, если количество сообщений в чате достигло максимума
            if (msgArray.length === maxChatMsg) {
                let lastMsgObj = msgArray.shift()
                lastMsgObj.message = null
                lastMsg = JSON.stringify(lastMsgObj);
            }
            // Добавить в массив сообщений новый месседж
            msgArray.push(msgObj)
        // Проверка,  если удаляем существующее сообщение
        }else if (msgObj.message == null) {
            deleteMsgObj = msgArray.find(element => element.id === msgObj.id )
            msgArray.splice(msgArray.indexOf(deleteMsgObj),1)
        // Проверка,  если редактируем существующее сообщение
        }else {
            editMsgObj = msgArray.find(element => element.id === msgObj.id )
            msgArray[msgArray.indexOf(editMsgObj)].message = msgObj.message
        }


        message = JSON.stringify(msgObj);
        // Перебираем всех подключенных клиентов
        for (let u of users) {
            // Отправляем им полученное сообщение
            u.connection.send(message)
            if (lastMsg) {
                u.connection.send(lastMsg)
            }
        }
    })
    // Делаем действие при выходе пользователя из чата
    ws.on('close', function () {
        // Получаем ID этого пользователя
        let id = users.indexOf(user)
        // Убираем этого пользователя
        users.splice(id, 1)
    })
})