// --------- class ---------------

//客の定義
class Customer{ //客
    constructor(order, eatingTime){
        this.order = order; //注文内容
        this.eatingTime = eatingTime; //食事時間
    }
}
//客の定義例
const order_ex = [1.5, 0]; //注文内容例 引数:麺の量,餃子の数
const eatingTime_ex = 24; //食事時間例 引数:コマ単位の時間
const customer1 = new Customer(order_ex, eatingTime_ex);
const customer2 = new Customer([2, 1], 45);
//客のグループ定義の例
let group1 = [customer1, customer2];
console.log(group1[0].order);
console.log(group1[1].eatingTime);
console.log(group1.length);
//案内待ちグループの定義
const visitors = []; //案内待ちのグループ

//席の情報の定義
class Seat{ //席
    constructor(maxNum){
        this.maxNum = maxNum; //客の収容人数
        this.num = 0; //今いる客の数
        this.state = 0; //客の状態 0:居ない, 1:配膳待, 2:食事中
    }
}
const seatConfiguration = [] //座席のリスト

// --------- function ------------
//座席に案内する関数
//戻値 成功なら案内席のインデックス, 失敗なら-1
function directToSeat(visitors, seatConfiguration){
    if(!visitors.length){ return -1; } //客がいない
    const num = visitors[0].length; //先頭の客人数取得
    for(const [index, seat] of seatConfiguration.entries()){ //各座席について index:インデックス seat:席そのもの
        // 座れる場合
        if(num <= seat.maxNum && seat.num == 0){ //最大人数以下かつ座っていない
            seat.num = num;
            seat.state = 1; //席状態を変更
            visitors.shift();
            return index;
        }
    }
}

// --------- test code -----------

console.log(directToSeat(visitors))

visitors.push(group1);
visitors.push(group1);
console.log(visitors);

// 席の配置設定
for(let i = 0; i < 4; ++i){
    seatConfiguration.push(new Seat(4));
}
for(let i = 0; i < 3; ++i){
    seatConfiguration.push(new Seat(6));
}
console.log(seatConfiguration);
console.log(directToSeat(visitors, seatConfiguration))
console.log(directToSeat(visitors, seatConfiguration))
console.log(visitors);
console.log(seatConfiguration);