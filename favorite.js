const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector('#paginator');
const userPerPage = 12;
const users = JSON.parse(localStorage.getItem('favoriteUsers')) || [];
const modal = document.querySelector("#user-modal");
let currentPage = 1; // 初始化為第一頁

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
  const startIndex = (page - 1) * userPerPage
  return users.slice(startIndex, startIndex + userPerPage)
}

function renderUserList(data) {
  let rawHTML = "";
  // Render User List
  data.forEach((item) => {
    // name, surname, avatar, id, gender
    const genderIconClass = (item.gender === "male") ? "fa-mars-stroke-up" : "fa-venus";
    rawHTML += `
     <div class="col-sm-3">
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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">移除</button>
            </div>
        </div>
      </div>
    </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

function showUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalAvatar = document.querySelector("#user-modal-avatar");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalBirthday = document.querySelector("#user-modal-birthday");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalAddButton = document.querySelector("#user-modal-remove-button");
  modalAddButton.dataset.id = id

  axios.get(`${INDEX_URL + "/" + id}`).then((response) => {
    const data = response.data;
    modalTitle.innerText = data.name + " " + data.surname
    modalAvatar.innerHTML = `<img src= "${data.avatar}"
    alt = "User Avatar" class="img-fluid" >`;
    modalRegion.innerText = "Region : " + data.region;
    modalBirthday.innerText = "Birthday : " + data.birthday;
    modalGender.innerText = "Gender : " + data.gender;
    modalAge.innerText = "Age : " + data.age;
    modalEmail.innerText = "Email : " + data.email;
  })
    .catch((error) => console.log(error));
}

function removeFavorite(id) {
  if (!users || !users.length) return

  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  // 刪除該筆用戶資料
  users.splice(userIndex, 1)
  // 將list中資料轉成json字串形式放入local storage
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  renderPaginator(users.length)
  // 若移除完的USER仍超過1頁，則顯示原頁面，若小於1頁，則直接跳回第一頁
  currentPage = (users.length > 12) ? currentPage : 1
  renderUserList(getUserByPage(currentPage))
}


dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user") || event.target.matches(".card-img-top")) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFavorite(Number(event.target.dataset.id));
  }
});

modal.addEventListener("click", function onModalClicked(event) {
  if (event.target.matches(".btn-remove-favorite")) {
    removeFavorite(Number(event.target.dataset.id));
  }
})


// 監聽paginator實現頁簽導覽功能
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  currentPage = Number(event.target.dataset.page); // 更新當前頁面
  renderUserList(getUserByPage(currentPage));
  // 重新渲染Paginator，更新該highlight的頁碼
  renderPaginator(users.length)
})

// 進到頁面首次渲染內容
renderPaginator(users.length)
renderUserList(getUserByPage(currentPage))
