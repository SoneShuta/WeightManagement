document.addEventListener('DOMContentLoaded', function () {
  // サーバーからラジオボタンの状態を取得
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const response = JSON.parse(this.responseText);
      const radioBtnShow = document.getElementById('radioBtnShow');
      const radioBtnNotShow = document.getElementById('radioBtnNotShow');
      console.log(response);

      // ラジオボタンの表示／非表示を切り替え
      radioBtnShow.checked = response.showWeight;
      radioBtnNotShow.checked = !response.showWeight;
      console.log(response.showWeight);
    }
  };
  xhr.open('GET', '/api/userSettings', true);
  xhr.send();
});