const users = []

// fuctions for add user , removeuser, getuser, getuserinroom

const adduser = ({ id , username , room })=>{
    // clean the data like convert in lowercase 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //check if username and room has some values in it
    if( !username || !room){
        return{
            error : 'Username and room are required'
        }
    }

    //check for existing user name with same name or room
    const existinguser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existinguser){
        return {
            error : 'username already in use'
        }
    }

    //store user
    const user = { id , username , room}
    users.push(user)
    return { user }
}

//remove user function

const removeuser = (id) =>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if(index !== -1){
        return users.splice(index , 1)[0]
    }
}


// for getting user by id
const getuser = (id)=>{
    return users.find((user)=>{
        return user.id === id
    })
}

//for getting user in the array users
const getuserinroom = (room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>{
        return user.room === room
    })
}

module.exports = {
    adduser,
    removeuser,
    getuser,
    getuserinroom
}


