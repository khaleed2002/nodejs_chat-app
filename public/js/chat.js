const socket = io()
const messageForm = document.querySelector('#message-form')
const messageFormInput = document.querySelector('input')
const messageFormButton = document.querySelector('button')
const locationButton = document.querySelector('#location-btn')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const autoscroll = () => {
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

// Get username and room
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', ({ message, createdAt, username }) => {
    const html = Mustache.render(messageTemplate, {
        username,
        message,
        createdAt: moment(createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', ({ url, createdAt, username }) => {
    const html = Mustache.render(locationMessageTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable
    messageFormButton.setAttribute('disabled', 'disabled')

    const msg = e.target.elements.message.value
    socket.emit('sendMessage', msg, (error, acknowledgementMsg) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''

        if (error) {
            return console.log('Error: ', error);
        }
        console.log(acknowledgementMsg);
    })
})

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support geolocation')
    }

    locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        socket.emit('sendLocation', { latitude, longitude }, (error, msg) => {
            if (error) {
                location.href = '/'
            }
            console.log(msg);
            locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error, msg) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
    console.log(msg);

})