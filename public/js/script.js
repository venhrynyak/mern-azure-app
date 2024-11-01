let tbody = document.querySelector("#tableProducts tbody")
const productForm = document.forms["productForm"]

async function getProducts() {
  const response = await fetch("/api/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.ok) {
    const data = await response.json()

    data.forEach((product) => {
      // add table row
      let tr = row(product)
      tbody.append(tr)
    })
  }
}

async function getProduct(id) {
  const response = await fetch(`/api/products/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.ok) {
    const product = await response.json()

    productForm["productName"].value = product.name
    productForm["productPrice"].value = product.price
    productForm["productId"].value = product._id
  }
}

function row(product) {
  let tr = document.createElement("tr")
  tr.setAttribute("data-rowid", product._id)

  let tdId = document.createElement("td")
  tdId.append(product._id)

  let tdName = document.createElement("td")
  tdName.append(product.name)

  let tdPrice = document.createElement("td")
  tdPrice.append(product.price)

  // delete
  let tdActions = document.createElement("td")

  let btnDelete = document.createElement("button")
  btnDelete.append("Delete")
  btnDelete.setAttribute("class", "btn btn-danger")

  btnDelete.addEventListener("click", () => {
    deleteProduct(product._id)
  })

  // update
  let btnEdit = document.createElement("button")
  btnEdit.append("Edit")
  btnEdit.setAttribute("class", "btn btn-warning mx-1")

  btnEdit.addEventListener("click", () => {
    getProduct(product._id)
  })

  tdActions.append(btnDelete, btnEdit)

  tr.append(tdId, tdName, tdPrice, tdActions)

  return tr
}

async function deleteProduct(id) {
  const response = await fetch(`/api/products/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.ok) {
    const product = await response.json()

    document
      .querySelector(`#tableProducts tr[data-rowid='${product._id}']`)
      .remove()
  }
}

async function createProduct(productName, productPrice) {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: productName,
      price: +productPrice
    })
  })

  if (response.ok) {
    let product = await response.json()
    tbody.append(row(product))
    reset()
  }
}

async function editProduct(productId, productName, productPrice) {
  const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: productName,
      price: +productPrice
    })
  })

  if (response.ok) {
    const product = await response.json()
    reset()

    document
      .querySelector(`#tableProducts tr[data-rowid='${product._id}']`)
      .replaceWith(row(product))
  }
}

productForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const productName = productForm["productName"].value
  const productPrice = productForm["productPrice"].value
  const productId = productForm["productId"].value

  if (productId == 0) createProduct(productName, productPrice)
  else editProduct(productId, productName, productPrice)
})

function reset() {
  productForm.reset()
  productForm["productId"].value = 0
}

getProducts()
