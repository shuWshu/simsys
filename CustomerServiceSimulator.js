// --------- class ---------------

//客の定義
class Customer{ //客
    constructor(order, eatingTime){
        this.order = order; //注文内容
        this.eatingTime = eatingTime; //食事時間
    }
}
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
//客来店
//客グループデータを作りvisitorsに追加
function visitCustomerNumN(visitors, num){
    //const num = Math.floor(Math.random() * 6) + 1; //1~6をランダムで取得
    const group = []
    for(let i = 0; i < num; ++i){
        const order = [Math.floor(Math.random() * 3) + 2, Math.floor(Math.random() * 2)]; //[2~4, 0~1]
        const eatingTime = Math.floor(Math.random() * 22) + 24; //24~45
        const customer = new Customer(order, eatingTime);
        group.push(customer);
        console.log(order, eatingTime);
    }
    visitors.push(group);
}

//座席に案内
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
    return -1;
}

// --------- test code -----------

console.log(directToSeat(visitors))



// 席の配置設定
for(let i = 0; i < 4; ++i){
    seatConfiguration.push(new Seat(4));
}
for(let i = 0; i < 3; ++i){
    seatConfiguration.push(new Seat(6));
}
console.log(seatConfiguration);

visitCustomerNumN(visitors, 4);
visitCustomerNumN(visitors, 2);
visitCustomerNumN(visitors, 5);
console.log(visitors)
console.log(directToSeat(visitors, seatConfiguration))
console.log(directToSeat(visitors, seatConfiguration))
console.log(directToSeat(visitors, seatConfiguration))
console.log(visitors);
console.log(seatConfiguration);

