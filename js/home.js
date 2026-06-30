const memberId = localStorage.getItem("meteor_member_id");

if (!memberId) {
    window.location.href = "index.html";
}

document.getElementById("memberIdText").textContent = "会員ID：" + memberId;

function logout() {
    localStorage.removeItem("meteor_token");
    localStorage.removeItem("meteor_member_id");

    window.location.href = "index.html";
}