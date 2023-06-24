let pizzasContent = document.querySelector('.content')
let cartBox = document.querySelector('.cartBox');
let loginForm = document.querySelector('.loginForm');

let cartContent = document.querySelector('.cart-content')
let cartShowContent = document.querySelector('#content')
let emptyCartShowContent = document.querySelector('.empty-cart')
let priceFields = document.querySelectorAll('#total-price')
let amountFields = document.querySelectorAll('#pizzas-amount')

let sortSelect = document.querySelector('.sort').children[1]
let typeBtns = document.querySelector('.type')

// Аккаунты - (логин, пароль)
accaunts = [
    ['боб', 'строитель'],
    ['11', '11'],
    ['12', '12']
]

let pizzasList = [
    ['Чизбургер-пицца', 395, 'pizza1.jpg', []],
    ['Сырная', 450, 'pizza2.jpg', []],
    ['Креветки по азиатски', 290, 'pizza3.jpg', ['Вегетарианская']],
    ['Сырный цыпленок', 385, 'pizza4.jpg', ['Мясные']],
    ['Абобус', 9999, 'abobus.jpg', []],
]

let accaunt_id = -1

class Cart {
    constructor() {
        this.pizzas = getCookie('pizzas')
        if (this.pizzas) {
            this.pizzas = JSON.parse(this.pizzas)
        } else {
            this.pizzas = []
        }
        this.amount = 0
        this.updateDraw()
    }

    pizzaIndex(name, type, size) {
        for (let i = 0; i < this.pizzas.length; i++) {
            if (this.pizzas[i][0] == name && this.pizzas[i][1] == type && this.pizzas[i][2] == size) {
                return i
            }
        }
        return -1
    }

    addPizza(element, data=null) {
        console.log(element)
        console.log(data)
        if (data != null) {
            var [name, type, size, price] = data
        } else {
            var [name, type, size, price, img] = this.getDatas(element)
        }
        console.log(name, type, size, price, img)
        let index = this.pizzaIndex(name, type, size)
        if (index != -1) {
            this.pizzas[index][4] += 1
        } else {
            this.pizzas.push([name, type, size, price, 1, img])
        }
        setCookie('pizzas', JSON.stringify(this.pizzas))
        this.updateDraw()
    }

    reducePizza(name, type, size) {
        let index = this.pizzaIndex(name, type, size)
        this.pizzas[index][4] -= 1
        if (this.pizzas[index][4] <= 0) {
            this.delPizza(name, type, size)
        }
        setCookie('pizzas', JSON.stringify(this.pizzas))
        this.updateDraw()
    }

    delPizza(name, type, size) {
        let index = this.pizzaIndex(name, type, size)
        this.pizzas.splice(index, 1)
        this.updateDraw()
    }

    clear() {
        this.pizzas = []
        setCookie('pizzas', JSON.stringify(this.pizzas))
        this.updateDraw()
    }

    updateAmount() {
        this.amount = 0
        for(let i = 0; i<this.pizzas.length; i++) {
            this.amount += this.pizzas[i][4]
        }
        amountFields[0].innerHTML = this.amount
        amountFields[1].innerHTML = this.amount
    }

    updateTotalPrice() {
        this.totalPrice = 0
        for(let i = 0; i<this.pizzas.length; i++) {
            this.totalPrice += this.pizzas[i][4]*this.pizzas[i][3]
        }
        priceFields[0].innerHTML = this.totalPrice
        priceFields[1].innerHTML = this.totalPrice
    }

    getDatas(elementChildren) {
        let element = elementChildren.parentElement;
        let search = !(element.classList.contains('card'));
        while (search) {
            element = element.parentElement
            search = !(element.classList.contains('card'));
        }
        let name = element.querySelector('#name').innerText
        let [type, size] = element.querySelectorAll('.cook-active')
        type = type.innerText; size = size.innerText.split(' ')[0]
        let price = element.querySelector('#price').innerText
        let img = element.querySelector('img').src.split('/')
        img = img[img.length-1]
        return [name, type, size, price, img]
    }

    updateContent() {
        let content = ''
        for(let i = 0; i<this.pizzas.length; i++) {
            let [name, type, size, price, amount, img] = this.pizzas[i]
            content += `
            <div class="cart-card">
                <img src="images/${img}">
                <div class="cart-descibe">
                    <h3>${name}</h3>
                    <p>${type}, ${size}см</p>
                </div>
                <div class="cart-amount-buttons">
                    <button class="btn" onclick="cart.reducePizza('${name}', '${type}', ${size})"><img src="images/minus.svg"></button>
                    <p>${amount}</p>
                    <button class="btn" onclick="cart.addPizza('', ['${name}', '${type}', ${size}, ${price}])"><img src="images/plus.svg"></button>
                </div>
                <p>${price} Р</p>
                <button class="cart-del-btn btn" onclick="cart.delPizza('${name}', '${type}', ${size})"><img src="images/plus.svg"></button>
            </div>`
        }
        cartContent.innerHTML = content
    }

    updateDraw() {
        this.updateAmount()
        this.updateTotalPrice()
        this.updateContent()
        if (this.amount > 0) {
            cartShowContent.style.display = 'block'
            emptyCartShowContent.style.display = 'none'
        } else {
            cartShowContent.style.display = 'none'
            emptyCartShowContent.style.display = 'flex'
        }
    }

    open() {
        cartBox.style.display = 'block'
        loginForm.style.display = 'none'
        this.updateDraw()
    }

    close() {
        cartBox.style.display = 'none'
    }
}

function setType(element) {
    let elements = element.parentElement.children;
    for (let i = 0; i< elements.length; i++) {
        elements[i].classList.remove('cook-active')
    }
    element.classList.add('cook-active')
    let fisrtPrice = element.parentElement.parentElement.children[1].children[0].getAttribute('price')
    let size = element.parentElement.parentElement.children[1].querySelector('.cook-active').innerText.split(' ')[0]
    console.log(fisrtPrice, size)
    element.parentElement.parentElement.parentElement.querySelector('#price').innerText = (fisrtPrice * size/26).toFixed()

}

function setSortType(element) {
    let elements = element.parentElement.children;
    for (let i = 0; i< elements.length; i++) {
        elements[i].classList.remove('active-type')
    }
    element.classList.add('active-type')
    setContent()
}

function setContent() {
    let sortType = sortSelect.value
    let sortTypeBtn = typeBtns.querySelector('.active-type').innerText
    // console.log(sortTypeBtn, typeBtns)
    let sortedPizzas = {}
    if (sortType == 'цене') {
        for (let i = 0; i<pizzasList.length; i++) {
            let price = pizzasList[i][1]
            while ((price in sortedPizzas) & (price - pizzasList[i][1] < 10)) {price++}
            sortedPizzas[price] = pizzasList[i]
        }
    } else if (sortType == 'алфавиту') {
        let names = []
        for (let i = 0; i<pizzasList.length; i++) {names.push(pizzasList[i][0])}
        names.sort()
        while (names.length > 0) {
            for (let i = 0; i<pizzasList.length; i++) {
                if (names[0] == pizzasList[i][0]) {
                    sortedPizzas[names[0]] = pizzasList[i]
                    names.splice(0, 1)
                    break
                }
            }
        }
    } else {
        for (let i = 0; i<pizzasList.length; i++) { 
            sortedPizzas[i] = pizzasList[i]
        }
    }
    if (sortTypeBtn != 'Все') {
        // console.log(sortedPizzas)
        for (let i in sortedPizzas) {
            if (!sortedPizzas[i][3].includes(sortTypeBtn)) {
                console.log(sortTypeBtn, sortedPizzas[i][3], `${sortTypeBtn}` in sortedPizzas[i][3])
                delete sortedPizzas[i]
            }
        }
    }
    // cartShowContent
    pizzasContent.innerHTML = ''
    for (let i in sortedPizzas) {
    // for (let i = 0; i < pizzasList.length; i++) {
        pizzasContent.innerHTML += `
        <div class="card">
            <img src="images/${sortedPizzas[i][2]}">
            <h3 id="name">${sortedPizzas[i][0]}</h3>
            <div class="cook-type">
                <div>
                    <button class="btn2 cook-active" onclick="setType(this)">тонкое</button>
                    <button class="btn2" onclick="setType(this)">традиционное</button>
                </div>
                <div>
                    <button class="btn2 cook-active" onclick="setType(this)" price="${sortedPizzas[i][1]}">26 см.</button>
                    <button class="btn2" onclick="setType(this)">30 см.</button>
                    <button class="btn2" onclick="setType(this)">40 см.</button>
                </div>
            </div>
            <div class="info">
                <h3>от <span id="price">${sortedPizzas[i][1]}</span> Р</h3>
                <button class="add-box btn" onclick="cart.addPizza(this)">
                    <img src="images/plus.svg">
                    <b>добавить</b>
                </button>
            </div>
        </div>`

    }

}

function setCookie(name,value) {
    var expires = "";
    const date = new Date();
    date.setTime(date.getTime() + (10*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    name = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return null;
}

function loginFormOpen() {
    cartBox.style.display = 'none'
    loginForm.style.display = 'block'
}

function loginFormClose() {
    cartBox.style.display = 'none'
    loginForm.style.display = 'none'
}

function loginAccaunt(element) {
    box = element.parentElement;

    login = box.querySelector('#login').value
    password = box.querySelector('#password').value

    for (let i=0; i<accaunts.length; i++) {
        if (accaunts[i][0] == login & accaunts[i][1] == password) {
            setCookie('accaunt', i)

        }
    }
    updateAccauntData()
}

function exitAccaunt() {
    setCookie('accaunt', -1)
    updateAccauntData()
}

function updateAccauntData() {
    accaunt_id = getCookie('accaunt')

    yesAccaunt = document.querySelector('.yes-accaunt')
    noAccaunt = document.querySelector('.no-accaunt')

    console.log(accaunt_id)
    if (accaunt_id == -1) {
        yesAccaunt.style.display = 'none'
        noAccaunt.style.display = 'block'
    }
    else {
        yesAccaunt.style.display = 'flex'
        noAccaunt.style.display = 'none'

        yesAccaunt.querySelector('#login').innerText = 'Логин: ' + accaunts[accaunt_id][0]
        yesAccaunt.querySelector('#password').innerText = 'Пароль: ' + accaunts[accaunt_id][1]
    }
}


updateAccauntData()
cart = new Cart()
// cart.open()
setContent()