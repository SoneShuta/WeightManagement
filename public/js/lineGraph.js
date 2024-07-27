// var ctx = document.getElementById("stage");
//   var myLineChart = new Chart(ctx, {
//     // グラフの種類：折れ線グラフを指定
//     type: 'line',
//     data: {
//       // x軸の各メモリ
//       labels: ['8月9日', '8月10日', '8月11日', '8月12日', '8月13日', '8月14日', '8月15日'],
//       datasets: [
//         {
//           label: '最高気温(度）',
//           data: [27, 26, 31, 25, 30, 22, 27, 26],
//           borderColor: "#ffa500",
//           backgroundColor: "#00000000",
//           lineTension:0
//         },
//       ],
//     },
//   });

var xAxisLabelMinWidth = 15; // データ当たりの幅を設定
var data = [12, 19, 3, 5, 2];
var width = data.length*xAxisLabelMinWidth; // グラフ全体の幅を計算
document.getElementById('stage').style.width = width+"px"; //　グラフの幅を設定
document.getElementById('stage').style.height = "300px"; //htmlと同じ高さを設定

var myChart = new Chart(document.getElementById('stage').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e'],
        datasets: [{
            label: 'sample data',
            data: data,
        }]
    },
    options: {
        responsive: false, //trueにすると画面の幅に合わせて作図してしまう
    }
});
