num = [4, 4, 2, 2, 1, 1];

//0~n-1の間で偏ったダイス
//引数: [0の比率, 1の比率, 2の比率, ...]
function randamizer(num){
    const total = num.reduce(function(a, b){ return a + b; }) //合計
    const r = Math.random();
    let a = 0;
    for(let i = 0; i < num.length - 1; ++i){
        a += num[i] / total;
        if(r<a) { return i; }
    }  
    return num.length - 1;
}

count = [0, 0, 0, 0, 0, 0];
for(let i = 0; i < 10000; ++i){
    count[randamizer(num) - 1] += 1;
}

console.log(count);