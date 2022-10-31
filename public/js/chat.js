let socket = new WebSocket("ws://localhost:3001");
let actionMessageId = null
let textInput = document.querySelector('.js-message-field');
let submitButton = document.querySelector('.js-submit');
let TEXT_SAVE_BUTTON = 'Сохранить'
let TEXT_SEND_BUTTON = 'Отправить'
socket.binaryType = "arraybuffer";
let messagesList = document.getElementById('messages');
let status = ''
let isVisibleSendButton = true

function createMessageNode(text, msgId, currentUserMsg) {
    let messageElem = document.createElement('div');
    messageElem.classList.add('js-message')
    let messageText = document.createElement('span');
    messageText.textContent = text;
    messageElem.append(messageText);
    messageElem.setAttribute('id', msgId)

    if (currentUserMsg) {
        // сдесь можно сразу он клик определить editMessageElem.onclick = () => {
        //
        //
        // }
        // editMessageElem.onclick = onMsgBtnClick.bind(this, msgId)
        // function onMsgBtnClick(msgId, event) {
        //
        // }
        let editMessageElem = document.createElement('a');
        editMessageElem.classList.add('js-edit-msg')
        editMessageElem.textContent = 'edit';
        let deleteMessageElem = document.createElement('a');
        deleteMessageElem.classList.add('js-delete-msg')
        deleteMessageElem.textContent = 'x';
        messageElem.setAttribute('current-user-msg', currentUserMsg)
        messageElem.append(editMessageElem);
        messageElem.append(deleteMessageElem);
    }
    return messageElem

}

submitButton.onclick = function () {
    status = 'newMsg';
    if (isVisibleSendButton === false) {
        submitButton.value = TEXT_SEND_BUTTON
        status = 'updateMsg'
        isVisibleSendButton = true
    }
    const outgoingMessage = {message: textInput.value, id: actionMessageId, status: status};
    const message = JSON.stringify(outgoingMessage);
    socket.send(message);
    return false;
};

// получение сообщения - отобразить данные в div#messagesы
socket.onmessage = function (eventMessage) {
    if (eventMessage.data === '__ping__') {
        console.log('onmessage', eventMessage.data)
        socket.send('__pong__');
        return;
    }
    let newMessages = JSON.parse(eventMessage.data)
    let documentFragment = document.createDocumentFragment();
    if (Array.isArray(newMessages)){
        newMessages.forEach(msg => {
            documentFragment.appendChild(createMessageNode(msg.message, msg.id ));
        });
        messagesList.prepend(documentFragment);
        return
    }

    const {message: text, id: msgId, currentUserMsg: currentUserMsg, status: status} = newMessages;
    const messageText = document.querySelector(`[id='${msgId}'] span`)
    const deleteElement = document.getElementById(msgId);
    let messageElem = '';
    if (status === 'removeMsg') {
        deleteElement && deleteElement.remove()
    } else if (status === 'newMsg' && currentUserMsg) {
        messageElem = createMessageNode(text, msgId, currentUserMsg)
        textInput.value = ''
        messagesList.prepend(messageElem);
    } else if (status === 'newMsg' && !currentUserMsg) {
        messageElem = createMessageNode(text, msgId)
        textInput.value = ''
        messagesList.prepend(messageElem);
    } else if (status === 'updateMsg') {
        messageText.textContent = text
        textInput.value = ''
    }
}

messagesList.onclick = function (clickEvent) {
    //нужно при функции бинд,
    let messageId = clickEvent.target.closest('.js-message').getAttribute("id");
    actionMessageId = messageId;


    //классов если будет несколько то ошибка
    if (clickEvent.target.className === 'js-edit-msg') {
        submitButton.value = TEXT_SAVE_BUTTON
        ////не надо завязываться на дом, а надо хранить в буфере весь чат
        textInput.value = document.querySelector(`[id="${messageId}"] span`).textContent;
        isVisibleSendButton = false

    } else if (clickEvent.target.className === 'js-delete-msg') {
        let outgoingMessage = {message: '', id: actionMessageId, status: 'removeMsg'};
        let message = JSON.stringify(outgoingMessage);
        actionMessageId = null
        socket.send(message);
    }
    return false;
};
