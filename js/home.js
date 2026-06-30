const API_URL = "https://script.google.com/macros/s/AKfycbxsHYfop671-Fb4GehXwx5XhfZguvlDZqvH2xCusPevwaggSRc3omhxittN7IQHPlC2/exec";

const memberId = localStorage.getItem("meteor_member_id");
const token = localStorage.getItem("meteor_token");

if (!memberId || !token) {
    window.location.href = "index.html";
}



fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
        action: "getMemberInfo",
        memberId: memberId
    })
})
.then(response => response.json())
.then(result => {
    if (result.success) {
        document.getElementById("memberName").textContent =
            result.name + " 様";

        document.getElementById("memberType").textContent =
            result.memberType || "-";

        document.getElementById("expireDate").textContent =
            result.expireDate || "-";

        document.getElementById("points").textContent =
         (result.points || 0) + " pt";

        console.log(result);
    } else {
        document.getElementById("memberIdText").textContent =
            result.message;
    }
})
.catch(error => {
    document.getElementById("memberIdText").textContent =
        "会員情報の取得に失敗しました";

    console.error(error);
});

function logout() {
    localStorage.removeItem("meteor_token");
    localStorage.removeItem("meteor_member_id");

    window.location.href = "index.html";
}