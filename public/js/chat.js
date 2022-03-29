let socket = new WebSocket("ws://localhost:3001");
let chatMsgLimit = 50
let editMessageId = null
let deleteMessageId = null
const maxMsgLength = 250
let textInput = document.querySelector('.js-message-field');
let submitButton = document.querySelector('.js-submit');

socket.binaryType = "arraybuffer";

function UserException(message) {
    this.message = message;
    this.name = "Исключение, определённое пользователем";
}

// отправка сообщения из формы
let submitForm = document.querySelector('.js-submit-form');
submitForm.onsubmit = function (submitEvent) {
    try {
        if (textInput.value === '') {
            throw new UserException("Введите сообщение в поле ввода");
        }
        if (textInput.value.length > maxMsgLength) {
            throw new UserException("Сообщение слишком длинное");
        }
        if (submitEvent.submitter.defaultValue === 'Сохранить') {
            submitButton.value = 'Отправить'
        }
        const outgoingMessage = {message: textInput.value, id: editMessageId};
        const message = JSON.stringify(outgoingMessage);
        textInput.value = null
        editMessageId = null
        socket.send(message);
        return false;
    } catch (e) {
        alert(e.message);
    }
};


// получение сообщения - отобразить данные в div#messagesы
socket.onmessage = function (event) {
    if (chatMsgLimit > 0) {
        const {message: text, id: msgId} = JSON.parse(event.data);
        const findElemById = document.querySelector(`[msgId='${msgId}'] span`)
        const deleteElement = document.querySelector(`[msgId='${msgId}']`)

        if (!text) {
            deleteElement.remove()
        } else if (text.length <= 15 && text.length !== 0) {
            if (findElemById === null) {
                let messageElem = document.createElement('div');
                let msgText = document.createElement('span');
                let editMessageElem = document.createElement('a');
                editMessageElem.classList.add('js-edit-msg')
                editMessageElem.textContent = 'edit';
                let deleteMessageElem = document.createElement('a');
                deleteMessageElem.classList.add('js-delete-msg')
                deleteMessageElem.textContent = 'x';

                msgText.textContent = text;
                messageElem.append(msgText);
                messageElem.append(editMessageElem);
                messageElem.append(deleteMessageElem);

                messageElem.setAttribute('msgId', msgId)
                document.getElementById('messages').prepend(messageElem);
                chatMsgLimit -= 1
            } else {
                findElemById.textContent = text
            }
        }
    } else {
        alert("Вы достигли лимита сообщений")
    }

    // Клик на кнопку редактирования сообщения
    let editLink = document.querySelector('.js-edit-msg');
    editLink.onclick = function (event) {
        submitButton.value = 'Сохранить'
        editMessageId = event.target.parentElement.attributes.msgid?.value
        let messageText = event.target.parentElement.firstElementChild.innerHTML
        textInput.value = messageText
        return false;
    };

    // Клик на кнопку удаления сообщения
    let deleteLink = document.querySelector('.js-delete-msg');
    deleteLink.onclick = function (event) {
        deleteMessageId = event.target.parentElement.attributes.msgid?.value
        console.log(deleteMessageId)
        let outgoingMessage = {message: null, id: deleteMessageId};
        let message = JSON.stringify(outgoingMessage);
        socket.send(message);
        return false;
    };
}



