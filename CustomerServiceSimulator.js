// --------- class ---------------

//客の定義
class Customer{ //客
    constructor(order, eatingTime){
        this.order = order; //注文内容
        this.eatingTime = eatingTime; //食事時間
    }
}
class Group{ //客のグループ
    constructor(customers){
        this.customers = customers; //客のリスト
        this.num = customers.length; //人数
    }
    add(customer){ //客の追加 引数:客
       this.customers.push(customer); 
       this.num += 1;
    }
}
//案内待ちグループの定義
class Visitors{ //案内待ちのグループ
    constructor(){
        this.groups = [];
        this.num = 0;
    }
    add(group){ //来店時
        this.groups.push(group);
        this.num += 1;
    }
    delete(){ //客を前から減らす
        this.groups.shift();
        this.num -= 1;
    }
}
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
    if(!visitors.num){ return -1; } //客がいない
    const num = visitors.groups[0].num; //先頭の客人数取得
    for(const [index, seat] of seatConfiguration.entries()){ //各座席について index:インデックス seat:席そのもの
        // 座れる場合
        if(num <= seat.maxNum && seat.num == 0){ //最大人数以下かつ座っていない
            seat.num = num;
            seat.state = 1; //席状態を変更
            visitors.delete();
            return index;
        }
    }
}

// --------- test code -----------

const order_ex = [1.5, 0]; //注文内容例 引数:麺の量,餃子の数
const eatingTime_ex = 24; //食事時間例 引数:コマ単位の時間
const order_ex2 = [2, 1]; //注文内容例 引数:麺の量,餃子の数
const eatingTime_ex2 = 45; //食事時間例 引数:コマ単位の時間
const visitors = new Visitors();

console.log(directToSeat(visitors))

let customer1 = new Customer(order_ex, eatingTime_ex);
let customer2 = new Customer(order_ex2, eatingTime_ex2);
let enptylist = [];
let group1 = new Group(enptylist)
group1.add(customer1);
group1.add(customer2);

console.log(group1.customers[0].order);
console.log(group1.customers[0].eatingTime);
console.log(group1.num);

visitors.add(group1);
visitors.add(group1);
console.log(visitors.groups);
console.log(visitors.groups);

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