
const cart_items = document.querySelector('#cart .cart-items');
let total_cart_price = document.querySelector('#total-value').innerText;
const marchent = document.querySelector('#merch-content');
const parentContainer = document.getElementById('EcommerceContainer');
const backendApis = "http://13.114.50.85:4000";
const pagination = document.querySelector('.pagination');

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const page = 1;
        let responce = await axios.get(`${backendApis}/products?page=${page}`);
        // console.log("hi", responce.data);
        await responce.data.products.forEach(ele => {
            // console.log(ele);
            showProductOnScreen(ele);
        });
        showPagination(responce.data);

        // let responce = await axios.get(`${backendApis}/products`)
        // if (responce.request.status === 200) {
        //     responce.data.forEach(element => {
        //         // console.log(element.id, element.title, element.price);
        //         showProductOnScreen(element);
        //     })
        // }
    } catch (err) {
        console.log(err);
    }
});


showProductOnScreen = (obj) => {
    const parentDiv = document.createElement('div');

    parentDiv.setAttribute('id', `id-${(obj.id)}`);
    parentDiv.innerHTML = `
        <h3>${obj.title}</h3>
        <div class="image-container">
            <img class="prod-images" src="${obj.imageUrl}" alt="">
        </div>
        <div class="prod-details">
            <span class="priceClass">$<span>${obj.price}</span></span>
            <button class="shop-item-button" type='button'>ADD TO CART</button>
        </div>`

    marchent.appendChild(parentDiv);
}


parentContainer.addEventListener('click', (e) => {

    //for clicking cart to show the products in cart and on click cancel will invisible.

    if (e.target.className == 'cart-btn-bottom' || e.target.className == 'cart-bottom' || e.target.className == 'cart-holder') {
        document.querySelector('#cart').style = "display:block;"
        showProductInCart();
        cart_items.innerHTML = "";
        total_cart_price = 0.00;
    }
    if (e.target.className == 'cancel') {
        document.querySelector('#cart').style = "display:none;"
        cart_items.innerHTML = "";
        total_cart_price = 0.00;
    }

    //when click button add to cart.
    if (e.target.className == 'shop-item-button') {
        let id = e.target.parentNode.parentNode.id;
        // const name = document.querySelector(`#${id} h3`).innerText;
        const name = e.target.parentNode.parentNode.firstElementChild.innerText;
        const img_src = document.querySelector(`#${id} img`).src;
        // const img_src = e.target.parentNode.classList.contains('prod-images').src;
        const price = e.target.parentNode.firstElementChild.firstElementChild.innerText;


        const productId = id.split("-")[1];
        console.log('id =', productId);
        axios.post(`${backendApis}/cart`, { productId: productId })
            .then((responce) => {

                if (responce.request.status === 200) {
                    // console.log(responce.data);
                    notifyOnScreen(responce.data.message);
                    let cartProduct = document.getElementById(`quantity-${productId}`);
                    // console.log('jjjj');
                    if (cartProduct) {
                        cartProduct.value = +(cartProduct.value) + 1;
                        console.log(cartProduct.id, cartProduct.value);
                        total_cart_price = (+(total_cart_price) + parseFloat(price)).toFixed(2);
                        document.querySelector('#total-value').innerText = `${total_cart_price}`;
                    } else {
                        console.log('new product is added to cart');
                        let newId = id.split("-")[1];
                        addNewProductInCart(newId, name, price, img_src, 1);
                        document.querySelector('.cart-number').innerText++;
                    }
                } else {
                    console.log(responce.data);
                }
            })
            .catch(err => {
                console.log('error');
                console.log(err);
                notifyOnScreen(err.message);
            });
    }


    //for click on purchase button functionality.
    if (e.target.className == 'purchase-btn') {
        if (parseInt(document.querySelector('.cart-number').innerText) === 0) {
            alert('You have Nothing in Cart , Add some products to purchase !');
            return;
        }

        axios.post(`${backendApis}/orders`)
            .then(responce => {
                console.log(responce);
                if (responce.request.status === 200) {
                    let orderId = responce.data.orderId;
                    alert(`Congratulations !!! 😊😊👍 \n Your order is placed successfully. \n Your Order ID: ${orderId}`)
                    // notifyOnScreen();
                    cart_items.innerHTML = ""
                    document.querySelector('.cart-number').innerText = 0;
                    document.querySelector('#total-value').innerText = `0.00`;
                } else {
                    alert(responce.data.message);
                }
            })
            .catch(err => {
                console.log(err);

            });

        // alert('Thanks for the purchase')

    }

    //for remove button functionality.
    if (e.target.innerText == 'REMOVE') {
        if (confirm('Are you sure ?')) {
            let productId = e.target.parentNode.parentNode.id;
            let qId = productId.split("-")[2];
            //deleting product from server.
            axios.post(`${backendApis}/cart-delete-item`, { productId: qId })
                .then(res => {
                    if (res.request.status === 200) {
                        console.log(res.data);
                        notifyOnScreen(res.data.message);
                        // let total_cart_price = document.querySelector('#total-value').innerText;
                        total_cart_price = parseFloat(total_cart_price).toFixed(2) - (parseFloat(document.querySelector(`#${productId} .cart-price`).innerText) * parseFloat(document.getElementById(`quantity-${qId}`).value)).toFixed(2);
                        document.querySelector('.cart-number').innerText = parseInt(document.querySelector('.cart-number').innerText) - 1
                        document.querySelector('#total-value').innerText = `${total_cart_price.toFixed(2)}`
                        e.target.parentNode.parentNode.remove()
                    }
                });
        }
    }

})


//getting data from backend for cart by get request.
showProductInCart = async () => {
    try {
        let responce = await axios.get(`${backendApis}/cart`);

        if (responce.request.status === 200) {
            let numberOfProductsInCart = 0;
            await responce.data.products.forEach(ele => {
                addNewProductInCart(ele.id, ele.title, ele.price, ele.imageUrl, ele.cartItem.quantity);
                numberOfProductsInCart++;
            })
            document.querySelector('.cart-number').innerText = numberOfProductsInCart;
        } else {
            console.log(responce.data);
        }
    } catch (err) {
        console.log(err);
    }
}


//adding some functionallity and styling for that product which is added to cart.
function addNewProductInCart(id, title, price, imageUrl, quantity) {
    const cart_item = document.createElement('div');

    cart_item.classList.add('cart-row');
    cart_item.setAttribute('id', `in-cart-${id}`);
    const updatedPrice = price * quantity;

    total_cart_price = parseFloat(total_cart_price) + parseFloat(updatedPrice);
    total_cart_price = total_cart_price.toFixed(2);

    document.querySelector('#total-value').innerText = `${total_cart_price}`;
    cart_item.innerHTML = `
        <span class='cart-item cart-column'>
            <img class='cart-img' src="${imageUrl}" alt="">
            <span>${title}</span>
        </span>
        <span class='cart-price cart-column'>${price}</span>
        <span class='cart-quantity cart-column'>
            <input type="text" value="${quantity}" id="quantity-${id}">
            <button>REMOVE</button>
        </span>`
    cart_items.appendChild(cart_item);
}

function showPagination({
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage
}) {
    pagination.innerHTML = "";

    if (currentPage != 1 && previousPage != 1) {
        const btn4 = document.createElement('button');
        btn4.classList.add('btn');
        btn4.innerHTML = 1;
        btn4.addEventListener('click', () => {
            marchent.innerHTML = "";
            getProducts(1);
        });
        let span = document.createElement('span');
        span.innerText = `........`
        
        pagination.appendChild(btn4);
        pagination.appendChild(span);
    }

    if (hasPreviousPage) {
        const btn2 = document.createElement('button');
        btn2.innerHTML = previousPage;
        btn2.classList.add('btn');
        btn2.addEventListener('click', () => {
            marchent.innerHTML = "";
            getProducts(previousPage);
        });
        pagination.appendChild(btn2);
    }
    const btn1 = document.createElement('button');
    btn1.classList.add('btn');
    btn1.innerHTML = `<h3>${currentPage}</h3>`;
    btn1.addEventListener('click', () => {
        marchent.innerHTML = "";
        getProducts(currentPage);
    });
    pagination.appendChild(btn1);

    if (hasNextPage) {
        const btn3 = document.createElement('button');
        btn3.innerHTML = nextPage;
        btn3.classList.add('btn');
        btn3.addEventListener('click', () => {
            marchent.innerHTML = "";
            getProducts(nextPage);
        });
        pagination.appendChild(btn3);
    }

    if (currentPage != lastPage && nextPage!=lastPage) {
        const btn4 = document.createElement('button');
        btn4.classList.add('btn');
        btn4.innerHTML = lastPage;
        btn4.addEventListener('click', () => {
            marchent.innerHTML = "";
            getProducts(lastPage);
        });
        let span = document.createElement('span');
        span.innerText = `........`
        pagination.appendChild(span);
        pagination.appendChild(btn4);
    }
}

function getProducts(page) {
    axios.get(`${backendApis}/products?page=${page}`)
        .then(responce => {
            responce.data.products.forEach(ele => {
                showProductOnScreen(ele);
            })
            showPagination(responce.data);
        })
        .catch(err => console.log(err))
}


function notifyOnScreen(massage) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `<h4>${massage}<h4>`;
    container.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2500)
}