const users = []
const addUser = ({ id, username, room }) => {
    username = username?.trim()?.toLowerCase()
    room = room?.trim()?.toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and Room should be provided.'
        }
    }

    const existingUser = users.find((user) => {
        if (id === user.id) {
            return user
        }
        return username === user.username && room === user.room
    })

    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const userIndex = users.findIndex((user) => {
        return user.id === id
    })
    if (userIndex < 0) {
        return {
            error: 'User is not found!'
        }
    } else {
        return { user: users.splice(userIndex, 1)[0] }
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return id === user.id
    })
    if (user) {
        return { user }
    }
    return {
        error: 'User is not found'
    }
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return room === user.room
    })
    return usersInRoom
}

export { addUser, removeUser, getUser, getUsersInRoom, users };