const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const users = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector('#search-input');
const paginator = document.querySelector('#paginator');
const userPerPage = 12;
const modal = document.querySelector("#user-modal");
const filterTag = document.querySelector("#filter-tag");
let filteredUsers = [];
let currentPage = 1; // 初始化为第一頁

// 拿user清單
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length)
    renderUserList(getUserByPage(1));
  })
  .catch((err) => console.log(err));

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / userPerPage)
  let rawHTML = "";
  for (page = 1; page <= numberOfPages; page++) {
    // 建立一個class變數，來切換該被highlight的當前頁碼
    const currentPageClass = page === currentPage ? "current-page" : "";
    rawHTML += `
      <li class="page-item"><a class="page-link ${currentPageClass}" id="page-${page}" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML;
}

function getUserByPage(page) {
  //如果filteredUsers長度不為0，則data=filteredUsers，否則回傳users
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * userPerPage
  return data.slice(startIndex, startIndex + userPerPage)
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
  renderUserList(getUserByPage(currentPage));
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

//監聽表單提交事件實現搜尋功能
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  // 沒輸入內容的警示
  if (!keyword.length) {
    return alert(`您沒有輸入內容`);
  }

  // 使用 filter 方法来過濾用户列表，並且依據每次搜尋的內容重新定義filteredUsers
  filteredUsers = users.filter((user) => {
    const userName = user.name + " " + user.surname;
    return userName.toLowerCase().includes(keyword);
  });

  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的人`); S
  }
  renderPaginator(filteredUsers.length)
  renderUserList(getUserByPage(1));
});

// 監聽快捷篩選區，
filterTag.addEventListener('click', function onFilterTagClicked(event) {
  if (event.target.matches(".filter-gender")) {
    const filterGender = event.target.dataset.gender
    filteredUsers = users.filter((user) => {
      return user.gender === filterGender;
    });
    if (filteredUsers.length === 0) {
      return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的人`); S
    }
    renderPaginator(filteredUsers.length)
    renderUserList(getUserByPage(1));
  }

})

// 監聽paginator實現頁簽導覽功能
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  currentPage = Number(event.target.dataset.page); // 更新當前頁面
  renderUserList(getUserByPage(currentPage));
  // 重新渲染Paginator，更新highlight的新頁碼
  renderPaginator(users.length)
})

