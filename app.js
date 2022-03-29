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

//Создаем функцию для генерации msgId
function getMsgId() {
    msgId += 1
    return msgId
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
        if (msgObj.id == null) {
            // Присваиваем новому сообщению id
            msgObj.id = getMsgId()
        }
        message = JSON.stringify(msgObj);
        // Перебираем всех подключенных клиентов
        for (let u of users) {
            // Отправляем им полученное сообщение
            u.connection.send(message)
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