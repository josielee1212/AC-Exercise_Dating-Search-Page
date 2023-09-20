const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const users = [];
const dataPanel = document.querySelector("#data-panel");
const randomBtn = document.querySelector("#random-user");
const userPerPage = 12;
const modal = document.querySelector("#user-modal");
let randomList = []

// 拿user清單
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
  })
  .catch((err) => console.log(err));

// 生成隨機用戶清單
function getRandomUser(userList, listLength) {
  randomList = []; // 儲存隨機數的組合，且每次重置為空陣列

  while (randomList.length < listLength) {
    const randomIndex = Math.floor(Math.random() * userList.length);

    // 檢查是以否已存在隨機清單中，沒有則加入
    if (!randomList.includes(userList[randomIndex])) {
      randomList.push(userList[randomIndex]);
    }
  }

  // 根據隨機數組合生成新的用戶清單
  return randomList;
}

function renderUserList(data) {
  let rawHTML = "";

  // Render User List
  data.forEach((item) => {
    // name, surname, avatar, id ,gender
    const genderIconClass = (item.gender === "male") ? "fa-mars-stroke-up" : "fa-venus";
    rawHTML += `
     <div class="col-sm-3 btn-group" role="group" aria-label="Basic checkbox toggle button group">
      <div class="mb-2">
        <div class="card">
          <img src="${item.avatar}" class="card-img-top" data-bs-toggle="modal"
                data-bs-target="#user-modal" data-id="${item.id}" alt="User Avatar">
          <div class="card-body d-flex justify-content-center">
            <h5 class="card-title">${item.name + " " + item.surname} <i class="fa-solid ${genderIconClass}"></i></h5>
                  </div>
          <div class="card-footer d-flex justify-content-evenly">
              <button class="btn btn-primary btn-show-user" data-bs-toggle="modal"
                data-bs-target="#user-modal" data-id="${item.id}">查看</button>
              <button class="btn btn-outline-danger btn-add-favorite" id="favorite-${item.id}" data-id="${item.id}">關注</button>
            </div>
        </div>
      </div>
    </div>`;

  });
  dataPanel.innerHTML = rawHTML;
  // 每次渲染完USER資料後，檢查是否有已關注的USER，並更改關注鈕樣式
  data.forEach((item) => {
    const favoriteBtn = document.querySelector(`#favorite-${item.id}`)
    if (checkFavorite(item.id)) {
      favoriteBtn.classList.add("btn-checked")
      favoriteBtn.innerText = "已關注"
    }
  })
}

//檢查User是否已存在最愛清單 
function checkFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  return list.some((user) => user.id === id)
}

function showUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalAvatar = document.querySelector("#user-modal-avatar");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalBirthday = document.querySelector("#user-modal-birthday");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalAddButton = document.querySelector("#user-modal-add-button");
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || [];
  modalAddButton.dataset.id = id;

  axios.get(`${INDEX_URL + "/" + id}`).then((response) => {
    const data = response.data;
    modalTitle.innerText = data.name + " " + data.surname;
    modalAvatar.innerHTML = `<img src= "${data.avatar}"
    alt = "User Avatar" class="img-fluid" >`;
    modalRegion.innerText = "Region : " + data.region;
    modalBirthday.innerText = "Birthday : " + data.birthday;
    modalGender.innerText = "Gender : " + data.gender;
    modalAge.innerText = "Age : " + data.age;
    modalEmail.innerText = "Email : " + data.email;

    // 在打開 Modal 時檢查用戶是否已關注，並設置對應的按鈕樣式
    const isFavorite = checkFavorite(id);
    if (isFavorite) {
      modalAddButton.classList.add("btn-checked");
      modalAddButton.innerText = "已關注";
    } else {
      modalAddButton.classList.remove("btn-checked");
      modalAddButton.innerText = "關注";
    }
  })
    .catch((error) => console.log(error));
}

function addToFavorite(id) {
  // List每次讀取時，從local storage以json物件形式拿取，若前者無東西者為空陣列
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  // 找出加入最愛的使用者資料，並push進list中
  const user = users.find((user) => user.id === id)
  const favoriteBtn = document.querySelector(`#favorite-${id}`)
  if (checkFavorite(id)) {
    return alert('此用戶已經在最愛清單中！')
  }
  // 將list中資料轉成json字串形式放入local storage
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
  // 成功關注時，更改關注鈕樣式
  favoriteBtn.classList.add("btn-checked")
  favoriteBtn.innerText = "已關注"
  // 重新渲染USER，並讓頁面停留在同一頁
  renderUserList(randomList);
}


dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user") || event.target.matches(".card-img-top")) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));

  }
});

modal.addEventListener("click", function onModalClicked(event) {
  if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
    // 成功關注時，直接更改關注鈕樣式
    event.target.classList.add("btn-checked")
    event.target.innerText = "已關注"
  }
})

//監聽隨機鈕，並隨機抽取12用戶 
randomBtn.addEventListener("click", function onRandomBtnClicked(event) {
  renderUserList(getRandomUser(users, userPerPage))
})
