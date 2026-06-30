function login(){
    const memberId = document.getElementById("memberId").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    const API_URL = "https://script.google.com/macros/s/AKfycbxsHYfop671-Fb4GehXwx5XhfZguvlDZqvH2xCusPevwaggSRc3omhxittN7IQHPlC2/exec";

    message.style.color = "red";
    message.textContent = "";

    if(memberId === ""){
        message.textContent = "会員IDを入力してください";
        return;
    }

    if(password === ""){
        message.textContent = "パスワードを入力してください";
        return;
    }

    message.style.color = "#0b4fa3";
    message.textContent = "ログイン確認中です...";

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "login",
            loginId: memberId,
            password: password,
            deviceId: "browser"
        })
    })
    .then(response => response.json())
    .then(result => {
        if(result.success){
            localStorage.setItem("meteor_token", result.token);
            localStorage.setItem("meteor_member_id", result.memberId);

            message.style.color = "green";
            message.textContent = "ログイン成功。ホーム画面へ移動します。";

            window.location.href = "home.html";
        }else{
            message.style.color = "red";
            message.textContent = result.message;
        }
    })
    .catch(error => {
        message.style.color = "red";
        message.textContent = "通信エラーが発生しました";
        console.error(error);
    });
}

