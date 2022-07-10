//for client
const socket = io()
const $messageform = document.querySelector('#message-form')
const $messageforminput = document.querySelector('input')
const $messageformbutton = document.querySelector('button')
const $sendlocationbutton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationmessagetemplate  = document.querySelector('#locationmessage-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

//for autoscrolling
const autoscroll = () => {
    //new message element
    const $newmessage = $messages.lastElementChild

    // get the height of new message for autoscrolling
    const newmessagestyles = getComputedStyle($newmessage) // for taking out the margin
    const newmessagemargin = parseInt(newmessagestyles.marginBottom) //for side margin to be in number
    const newmessageheight = $newmessage.offsetHeight + newmessagemargin //for height and adding margin

    //visible height
    const visibleheight = $messages.offsetHeight

    // height of messages container
    const containerheight = $messages.scrollHeight

    //how far have i scrolled
    const scrolloffset = ($messages.scrollTop  + visibleheight)*2// amount of value i have scrolled from top

    if(containerheight - newmessageheight < scrolloffset)
    {
       $messages.scrollTop = $messages.scrollHeight //this helps in to scroll to bottom
    }


}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messagetemplate , {
        username : message.username,
        message : message.text,
        createdat : moment(message.createat).format('h : mm a')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})

socket.on('locationmessage' , (message)=>{
    console.log(message)
    const html = Mustache.render(locationmessagetemplate , {
        username : message.username,
        url : message.url,
        createdat : moment(message.createat).format('h : mm a')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})

socket.on('roomdata' , ({room , users})=>{
    const html = Mustache.render(sidebartemplate , {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageform.addEventListener('submit', (e) => {
    e.preventDefault()
    //for disabling

    $messageformbutton.setAttribute('disabled' , 'disabled')

    const message = e.target.elements.message.value// the message in the name in index.html is called from here

    socket.emit('sendMessage', message , (error)=>{
        $messageformbutton.removeAttribute('disabled')
        $messageforminput.value = ''
        $messageforminput.focus()
        //console.log('the message was delivered')
        if(error)
        {
            return console.log(error)
        }
        console.log('message was delivered')
    })//here the callback function use is for event acknowledgement
})

$sendlocationbutton.addEventListener('click' , ()=>{
    if(!navigator.geolocation)
    {
        return alert('geolocation not supported')
    }

    $sendlocationbutton.setAttribute('disabled' , 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{//getcurrentposition is async but doesnt support promise and async
        //console.log(position)
        socket.emit('sendlocation' , {

            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        } , (ackmessage) =>{
            $sendlocationbutton.removeAttribute('disabled')
            console.log(ackmessage)
        })
    })
})


socket.emit('join' , {username , room} , (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})